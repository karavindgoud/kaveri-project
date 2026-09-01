import re
from datetime import datetime, date, timedelta
from decimal import Decimal
from django.db import connection, transaction

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
    cleaned = re.sub(r'[^\d\.]', '', str(val).replace(',', ''))
    try:
        return Decimal(cleaned)
    except Exception:
        return Decimal('0.00')

def parse_int(val, default=0):
    if not val:
        return default
    cleaned = re.sub(r'[^\d]', '', str(val))
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

def ensure_database_tables_exist():
    """Ensure all relational and legacy tables exist in Postgres/SQLite before querying."""
    vendor = connection.vendor
    pk_type = "SERIAL PRIMARY KEY" if vendor == "postgresql" else "INTEGER PRIMARY KEY AUTOINCREMENT"
    
    statements = [
        f"""CREATE TABLE IF NOT EXISTS property (
            property_id {pk_type},
            name VARCHAR(100) NOT NULL,
            city VARCHAR(50) NOT NULL,
            stars SMALLINT DEFAULT 5
        )""",
        f"""CREATE TABLE IF NOT EXISTS room_type (
            room_type_id {pk_type},
            type_name VARCHAR(20) NOT NULL UNIQUE,
            max_occupancy SMALLINT NOT NULL DEFAULT 2
        )""",
        f"""CREATE TABLE IF NOT EXISTS room (
            room_id {pk_type},
            property_id INT NOT NULL REFERENCES property(property_id) ON DELETE CASCADE,
            room_number VARCHAR(10) NOT NULL,
            room_type_id INT NOT NULL REFERENCES room_type(room_type_id) ON DELETE RESTRICT,
            UNIQUE(property_id, room_number)
        )""",
        f"""CREATE TABLE IF NOT EXISTS guest (
            guest_id {pk_type},
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20),
            city VARCHAR(50)
        )""",
        f"""CREATE TABLE IF NOT EXISTS rate (
            rate_id {pk_type},
            property_id INT NOT NULL REFERENCES property(property_id) ON DELETE CASCADE,
            room_type_id INT NOT NULL REFERENCES room_type(room_type_id) ON DELETE CASCADE,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            nightly_rate NUMERIC(10,2) NOT NULL
        )""",
        f"""CREATE TABLE IF NOT EXISTS booking (
            booking_id {pk_type},
            guest_id INT NOT NULL REFERENCES guest(guest_id) ON DELETE CASCADE,
            room_id INT REFERENCES room(room_id) ON DELETE SET NULL,
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            guest_count INT NOT NULL DEFAULT 1,
            status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
        )""",
        f"""CREATE TABLE IF NOT EXISTS payment (
            payment_id {pk_type},
            booking_id INT NOT NULL REFERENCES booking(booking_id) ON DELETE CASCADE,
            amount NUMERIC(10,2) NOT NULL,
            method VARCHAR(20) NOT NULL,
            payment_date DATE NOT NULL
        )""",
        f"""CREATE TABLE IF NOT EXISTS review (
            review_id {pk_type},
            booking_id INT UNIQUE NOT NULL REFERENCES booking(booking_id) ON DELETE CASCADE,
            rating SMALLINT,
            comment TEXT,
            review_date DATE
        )""",
        """CREATE TABLE IF NOT EXISTS legacy_reservations (
            row_id TEXT PRIMARY KEY,
            guest_name TEXT,
            guest_email TEXT,
            guest_phone TEXT,
            guest_city TEXT,
            hotel_name TEXT,
            hotel_city TEXT,
            hotel_star TEXT,
            room_numbers TEXT,
            room_type TEXT,
            guests_count TEXT,
            checkin TEXT,
            checkout TEXT,
            nightly_rate TEXT,
            total_paid TEXT,
            payment_method TEXT,
            status TEXT,
            notes TEXT
        )"""
    ]
    with connection.cursor() as cursor:
        for stmt in statements:
            try:
                cursor.execute(stmt)
            except Exception as e:
                print(f"WARNING: Schema table creation notice ({e})")
    print("INFO: Database schema verification completed successfully.")

def seed_initial_enterprise_data():
    """Populate default luxury hotel properties, rooms, room types, rates, and sample bookings."""
    try:
        if Property.objects.count() > 0:
            return

        print("INFO: Seeding default luxury resort data...")
        with transaction.atomic():
            # 1. Properties
            p1 = Property.objects.create(name="The Kaveri Palace & Spa", city="Udaipur", stars=5)
            p2 = Property.objects.create(name="The Kaveri Backwater Lagoon", city="Alleppey", stars=5)
            p3 = Property.objects.create(name="Kaveri Mist Rainforest Retreat", city="Coorg", stars=5)
            p4 = Property.objects.create(name="The Kaveri Grand Heritage", city="Mysore", stars=5)
            p5 = Property.objects.create(name="Kaveri Cloud Valley", city="Ooty", stars=5)

            # 2. Room Types
            rt_deluxe = RoomType.objects.create(type_name="Deluxe Suite", max_occupancy=2)
            rt_villa = RoomType.objects.create(type_name="Presidential Villa", max_occupancy=4)
            rt_heritage = RoomType.objects.create(type_name="Grand Heritage", max_occupancy=3)
            rt_penthouse = RoomType.objects.create(type_name="Royal Penthouse", max_occupancy=4)
            rt_chalet = RoomType.objects.create(type_name="Mountain Chalet", max_occupancy=2)

            # 3. Rooms
            rooms_created = []
            for prop in [p1, p2, p3, p4, p5]:
                for idx, rt in enumerate([rt_deluxe, rt_villa, rt_heritage, rt_penthouse, rt_chalet], start=1):
                    r = Room.objects.create(
                        property=prop,
                        room_number=f"{prop.property_id}0{idx}",
                        room_type=rt
                    )
                    rooms_created.append(r)

            # 4. Rate Plans
            today = date.today()
            year_later = today + timedelta(days=365)
            for prop in [p1, p2, p3, p4, p5]:
                Rate.objects.create(property=prop, room_type=rt_deluxe, start_date=today, end_date=year_later, nightly_rate=Decimal("250.00"))
                Rate.objects.create(property=prop, room_type=rt_villa, start_date=today, end_date=year_later, nightly_rate=Decimal("650.00"))
                Rate.objects.create(property=prop, room_type=rt_heritage, start_date=today, end_date=year_later, nightly_rate=Decimal("420.00"))
                Rate.objects.create(property=prop, room_type=rt_penthouse, start_date=today, end_date=year_later, nightly_rate=Decimal("890.00"))
                Rate.objects.create(property=prop, room_type=rt_chalet, start_date=today, end_date=year_later, nightly_rate=Decimal("310.00"))

            # 5. Guests
            g1 = Guest.objects.create(name="Aravind Goud", email="john.doe@example.com", phone="+91 9876543210", city="Hyderabad")
            g2 = Guest.objects.create(name="Lady Eleanor Vance", email="eleanor.vance@luxurytravel.co.uk", phone="+44 20 7946 0912", city="London")
            g3 = Guest.objects.create(name="Vikramaditya Rao", email="vikram.rao@royalstays.in", phone="+91 9988776655", city="Bangalore")
            g4 = Guest.objects.create(name="Dr. Sophia Martinez", email="sophia.m@globalmed.org", phone="+1 415 555 2671", city="San Francisco")

            # 6. Sample Bookings & Payments
            b1 = Booking.objects.create(
                guest=g1,
                room=rooms_created[0],
                check_in=today - timedelta(days=2),
                check_out=today + timedelta(days=3),
                guest_count=2,
                status="checked_in"
            )
            Payment.objects.create(booking=b1, amount=Decimal("1250.00"), method="credit_card", payment_date=today - timedelta(days=2))

            b2 = Booking.objects.create(
                guest=g2,
                room=rooms_created[1],
                check_in=today + timedelta(days=5),
                check_out=today + timedelta(days=10),
                guest_count=3,
                status="confirmed"
            )
            Payment.objects.create(booking=b2, amount=Decimal("3250.00"), method="bank_transfer", payment_date=today)

            b3 = Booking.objects.create(
                guest=g3,
                room=rooms_created[2],
                check_in=today - timedelta(days=10),
                check_out=today - timedelta(days=5),
                guest_count=2,
                status="checked_out"
            )
            Payment.objects.create(booking=b3, amount=Decimal("2100.00"), method="upi", payment_date=today - timedelta(days=10))
            Review.objects.create(booking=b3, rating=5, comment="Exquisite hospitality, regal ambience, and world-class culinary excellence!", review_date=today - timedelta(days=5))

            b4 = Booking.objects.create(
                guest=g4,
                room=rooms_created[3],
                check_in=today + timedelta(days=1),
                check_out=today + timedelta(days=4),
                guest_count=2,
                status="confirmed"
            )
            Payment.objects.create(booking=b4, amount=Decimal("2670.00"), method="credit_card", payment_date=today)

        print("INFO: Successfully seeded rich luxury hotel dataset.")
    except Exception as e:
        print(f"WARNING: Could not seed default data: {e}")

def import_legacy_data_if_needed():
    # 1. First ensure tables exist
    ensure_database_tables_exist()

    # 2. Seed initial luxury data if empty
    seed_initial_enterprise_data()

    # 3. Only migrate legacy reservations if legacy table has data and booking table is empty
    try:
        if Booking.objects.count() > 4:
            return

        legacy_count = LegacyReservations.objects.count()
        if legacy_count == 0:
            return

        print(f"INFO: Auto-migrating {legacy_count} legacy records...")
        
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
                            pass

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

        print(f"SUCCESS: Automatically migrated {count} legacy reservations.")
    except Exception as ex:
        print(f"WARNING: Exception during legacy import: {ex}")
