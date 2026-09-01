import re
from datetime import datetime, date
from decimal import Decimal
from django.db import transaction

from properties.models import Property
from room_types.models import RoomType
from rooms.models import Room
from guests.models import Guest
from rate_plans.models import Rate
from bookings.models import Booking
from payments.models import Payment
from reviews.models import Review
from legacy.models import LegacyReservations

def parse_date(date_str):
    if not date_str:
        return None
    date_str = date_str.strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d", "%d/%m/%y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None

def parse_decimal(val):
    if not val:
        return Decimal('0.00')
    cleaned = re.sub(r'[^\d\.]', '', val.replace(',', ''))
    try:
        return Decimal(cleaned)
    except Exception:
        return Decimal('0.00')

def parse_int(val, default=0):
    if not val:
        return default
    cleaned = re.sub(r'[^\d]', '', val)
    try:
        return int(cleaned)
    except Exception:
        return default

def clean_email(email):
    if not email:
        return ""
    return email.strip().lower()

def clean_status(status_str):
    if not status_str:
        return "confirmed"
    norm = status_str.strip().lower()
    if "confirm" in norm:
        return "confirmed"
    if "check" in norm and "in" in norm:
        return "checked_in"
    if "check" in norm and "out" in norm:
        return "checked_out"
    if "cancel" in norm:
        return "cancelled"
    if "no" in norm and "show" in norm:
        return "no_show"
    return "confirmed"

def clean_payment_method(method_str):
    if not method_str:
        return "credit_card"
    norm = method_str.strip().lower()
    if "card" in norm:
        if "debit" in norm:
            return "debit_card"
        return "credit_card"
    if "upi" in norm:
        return "upi"
    if "transfer" in norm or "wire" in norm or "bank" in norm:
        return "bank_transfer"
    if "cash" in norm:
        return "cash"
    return "credit_card"

def import_legacy_data_if_needed():
    # Only migrate if relational tables are completely unpopulated/empty
    if Booking.objects.count() > 0:
        print("INFO: Database already contains relational data. Skipping auto-migration.")
        return

    legacy_count = LegacyReservations.objects.count()
    if legacy_count == 0:
        print("INFO: No legacy reservations found to migrate.")
        return

    print(f"INFO: Relational database is empty. Auto-migrating {legacy_count} legacy records...")
    
    count = 0
    for item in LegacyReservations.objects.all():
        try:
            with transaction.atomic():
                # 1. Property
                hotel_name = (item.hotel_name or "Kaveri Resort").strip()
                hotel_city = (item.hotel_city or "Unknown").strip()
                hotel_stars = parse_int(item.hotel_star, 5)
                hotel_stars = max(1, min(5, hotel_stars))

                prop, _ = Property.objects.get_or_create(
                    name=hotel_name,
                    city=hotel_city,
                    defaults={"stars": hotel_stars}
                )

                # 2. RoomType
                rt_name = (item.room_type or "Deluxe").strip()[:20]
                max_occ = parse_int(item.guests_count, 2)
                max_occ = max(1, max_occ)

                room_type_obj, created = RoomType.objects.get_or_create(
                    type_name=rt_name,
                    defaults={"max_occupancy": max_occ}
                )
                if not created and max_occ > room_type_obj.max_occupancy:
                    room_type_obj.max_occupancy = max_occ
                    room_type_obj.save()

                # 3. Rooms
                room_nums = [r.strip() for r in (item.room_numbers or "101").split(",") if r.strip()]
                rooms_list = []
                for num in room_nums:
                    room_obj, _ = Room.objects.get_or_create(
                        property=prop,
                        room_number=num[:10],
                        defaults={"room_type": room_type_obj}
                    )
                    rooms_list.append(room_obj)

                # 4. Guest
                g_email = clean_email(item.guest_email or f"guest_{item.row_id}@example.com")
                g_name = (item.guest_name or "VIP Guest").strip()
                g_phone = (item.guest_phone or "").strip()[:20]
                g_city = (item.guest_city or "").strip()[:50]

                guest_obj, created = Guest.objects.get_or_create(
                    email=g_email,
                    defaults={
                        "name": g_name,
                        "phone": g_phone,
                        "city": g_city
                    }
                )
                if not created:
                    updated = False
                    if g_name and guest_obj.name == "VIP Guest":
                        guest_obj.name = g_name
                        updated = True
                    if g_phone and not guest_obj.phone:
                        guest_obj.phone = g_phone
                        updated = True
                    if g_city and not guest_obj.city:
                        guest_obj.city = g_city
                        updated = True
                    if updated:
                        guest_obj.save()

                # 5. Rate Plan
                c_in = parse_date(item.checkin) or date.today()
                c_out = parse_date(item.checkout) or date.today()
                nightly_rate_val = parse_decimal(item.nightly_rate)
                if nightly_rate_val > 0:
                    try:
                        Rate.objects.get_or_create(
                            property=prop,
                            room_type=room_type_obj,
                            start_date=c_in,
                            end_date=c_out,
                            defaults={"nightly_rate": nightly_rate_val}
                        )
                    except Exception:
                        pass # bypass rate overlap constraints

                # 6. Booking
                booking_status = clean_status(item.status)
                guests_cnt = parse_int(item.guests_count, 2)
                guests_cnt = max(1, guests_cnt)

                booking_obj = Booking.objects.create(
                    booking_id=int(item.row_id),
                    guest=guest_obj,
                    room=rooms_list[0] if rooms_list else None,
                    check_in=c_in,
                    check_out=c_out,
                    guest_count=guests_cnt,
                    status=booking_status
                )

                # 7. Payment
                paid_amt = parse_decimal(item.total_paid)
                pay_method = clean_payment_method(item.payment_method)
                Payment.objects.create(
                    booking=booking_obj,
                    amount=paid_amt,
                    method=pay_method,
                    payment_date=c_in
                )

                # 8. Review
                if item.notes and item.notes.strip():
                    Review.objects.create(
                        booking=booking_obj,
                        rating=5,
                        comment=item.notes.strip(),
                        review_date=c_out
                    )

                count += 1
        except Exception as ex:
            print(f"ERROR: Could not migrate legacy row {item.row_id}: {ex}")

    print(f"SUCCESS: Automatically migrated {count} legacy reservations into structured schema.")
