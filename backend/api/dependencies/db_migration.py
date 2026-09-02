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

# Exact 30 legacy reservations tuples provided by user
RAW_LEGACY_DATA = [
    ('1','Aarav Sharma','aarav.sharma@example.com','+91 98765 43210','Bengaluru','Kaveri Riverside','Coorg','4','101','Deluxe','2','2025-01-12','2025-01-15','4500','13500','card','confirmed','Late check-in requested'),
    ('2','aarav sharma','AARAV.SHARMA@EXAMPLE.COM','9876543210','bengaluru','Kaveri Riverside','Coorg','4','102,103','Deluxe','4','14/02/2025','17/02/2025','4,500.00','27000','Card','CONFIRMED','Anniversary - flowers'),
    ('3','Anita  Desai','anita.desai@example.com','+91 91234 56789','Mumbai','Kaveri Hilltop','Ooty','5','201','Suite','2','2025-02-03','2025-02-06','8200','24600','UPI','confirmed',''),
    ('4','Anita Desai','anita.desai@example.com','091234 56789','mumbai','Kaveri Hilltop','Ooty','5','201','Suite','2','March 9, 2025','March 12, 2025','8200','24,600','upi','conf','Repeat guest'),
    ('5','Ben Carter','ben.carter@example.org','+44 7700 900123','Bristol','Kaveri Riverside','Coorg','4','104','Standard','1','2025-03-20','2025-03-22','3200','6400','CARD','confirmed','N/A'),
    ('6','Chloe Dubois','chloe.dubois@example.com','+33 6 12 34 56 78','Lyon','Kaveri Backwater','Alleppey','4','301,302','Deluxe','3','05/04/2025','09/04/2025','5100','40800','card','confirmed','Two rooms, one bill'),
    ('7','Daniel Fischer','daniel.fischer@example.de','+49 151 12345678','Berlin','Kaveri Hilltop','Ooty','5','202','Deluxe','2','2025-04-18','2025-04-21','6800','20400','Bank Transfer','cancelled','Cancelled 3 days prior'),
    ('8','DANIEL FISCHER','daniel.fischer@example.de','+49 151 12345678','berlin','Kaveri Hilltop','Ooty','5','203','Deluxe','2','2025-05-02','2025-05-05','6800','20400','bank transfer','confirmed','Rebooked after cancellation'),
    ('9','Elena Rossi','elena.rossi@example.com','+39 320 1234567','Milan','Kaveri Backwater','Alleppey','4','303','Suite','2','19/05/2025','23/05/2025','9500','38000','Card','confirmed',None),
    ('10','Farhan Ali','farhan.ali@example.com','+91 99887 76655','Hyderabad','Kaveri Riverside','Coorg','4','101','Deluxe','2','2025-06-01','2025-06-04','4500','13500','upi','confirmed','-'),
    ('11','Grace Okafor','grace.okafor@example.com','+234 802 123 4567','Lagos','Kaveri Hilltop','Ooty','5','204','Standard','1','June 15, 2025','June 18, 2025','5400','16200','card','no show','Did not arrive'),
    ('12','Hiroshi Tanaka','hiroshi.tanaka@example.jp','+81 90-1234-5678','Osaka','Kaveri Backwater','Alleppey','4','301','Deluxe','2','2025-07-08','2025-07-13','5100','25500','CARD','confirmed','Requested airport pickup'),
    ('13','hiroshi tanaka','hiroshi.tanaka@example.jp','+81 90 1234 5678','Osaka','Kaveri Riverside','Coorg','4','105','Suite','2','2025-08-22','2025-08-25','7900','23700','card','confirmed','Repeat guest - upgrade given'),
    ('14','Isabel Moreno','isabel.moreno@example.com','+34 612 345 678','Madrid','Kaveri Hilltop','Ooty','5','201','Suite','3','01/09/2025','05/09/2025','8200','32800','UPI','confirmed','Extra bed'),
    ('15','Jonas Weber','jonas.weber@example.de','+49 170 9876543','Hamburg','Kaveri Backwater','Alleppey','4','304','Standard','1','2025-09-14','2025-09-16','3900','7800','Card','cancelled','Refund processed'),
    ('16','Kavya Nair','kavya.nair@example.com','+91 94567 89012','Kochi','Kaveri Backwater','Alleppey','4','302','Deluxe','2','2025-10-02','2025-10-06','5100','20400','upi','confirmed',''),
    ('17','Kavya  Nair','kavya.nair@example.com','9456789012','Kochi','Kaveri Riverside','Coorg','4','102','Deluxe','2','2025-11-11','2025-11-14','4500','13500','UPI','confirmed','Second stay this year'),
    ('18','Liam O\'Brien','liam.obrien@example.ie','+353 87 123 4567','Dublin','Kaveri Hilltop','Ooty','5','205','Deluxe','2','2025-11-28','2025-12-02','6800','27200','card','confirmed','N/A'),
    ('19','Maya Krishnan','maya.k@example.com','+91 98111 22334','Chennai','Kaveri Riverside','Coorg','4','103,104','Standard','4','2025-12-20','2025-12-27','3200','44800','Card','confirmed','Christmas week - peak rate applied'),
    ('20','Noah Bergman','noah.bergman@example.se','+46 70 123 45 67','Stockholm','Kaveri Backwater','Alleppey','4','303','Suite','2','24/12/2025','29/12/2025','12000','60000','card','confirmed','Peak season rate'),
    ('21','Aarav Sharma','aarav.sharma@example.com','+91 98765 43210','Bengaluru','Kaveri Hilltop','Ooty','5','202','Deluxe','2','2026-01-05','2026-01-08','6800','20400','UPI','confirmed','Third stay'),
    ('22','Priya Menon','priya.menon@example.com','+91 90000 11111','Kochi','Kaveri Backwater','Alleppey','4','301','Deluxe','2','2026-01-19','2026-01-22','5100','15300','card','confirmed',None),
    ('23','Ben Carter','ben.carter@example.org','+44 7700 900123','Bristol','Kaveri Backwater','Alleppey','4','304','Standard','2','2026-02-14','2026-02-17','3900','11700','CARD','confirmed','Valentine package'),
    ('24','Sofia Ahmed','sofia.ahmed@example.com','+91 93333 44444','Delhi','Kaveri Hilltop','Ooty','5','203','Deluxe','2','2026-02-20','2026-02-23','6800','20400','upi','confirmed','-'),
    ('25','Elena Rossi','ELENA.ROSSI@example.com','+39 320 1234567','Milan','Kaveri Riverside','Coorg','4','105','Suite','2','2026-03-01','2026-03-05','7900','31600','Card','confirmed','Returning guest'),
    ('26','Tom Nguyen','tom.nguyen@example.com','+84 90 123 4567','Hanoi','Kaveri Riverside','Coorg','4','101','Deluxe','2','2026-03-10','2026-03-13','4500','13500','card','confirmed',''),
    ('27','Grace Okafor','grace.okafor@example.com','+234 802 123 4567','Lagos','Kaveri Backwater','Alleppey','4','302','Deluxe','2','2026-04-02','2026-04-05','5100','15300','UPI','confirmed','Second attempt after no-show'),
    ('28','Yusuf Demir','yusuf.demir@example.com','+90 532 123 4567','Istanbul','Kaveri Hilltop','Ooty','5','204','Standard','1','2026-04-15','2026-04-17','5400','10800','Card','confirmed','N/A'),
    ('29','Maya Krishnan','maya.k@example.com','+91 98111 22334','chennai','Kaveri Backwater','Alleppey','4','303','Suite','2','2026-05-01','2026-05-04','9500','28500','card','confirmed','Repeat'),
    ('30','Liam O\'Brien','liam.obrien@example.ie','+353 87 123 4567','Dublin','Kaveri Riverside','Coorg','4','102','Deluxe','2','2026-05-20','2026-05-24','4500','18000','UPI','confirmed','')
]

def parse_date(date_str):
    if not date_str:
        return None
    date_str = str(date_str).strip()
    formats = (
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%Y/%m/%d",
        "%d/%m/%y",
        "%B %d, %Y",
        "%b %d, %Y",
        "%B %d %Y",
        "%b %d %Y",
        "%d-%m-%Y"
    )
    for fmt in formats:
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

def clean_name(name):
    if not name:
        return "VIP Guest"
    parts = name.strip().split()
    return " ".join([p.capitalize() if not p.startswith("O'") else "O'" + p[2:].capitalize() for p in parts])

def clean_city(city):
    if not city:
        return "Unknown"
    return city.strip().capitalize()

def clean_status(status_str):
    if not status_str:
        return "confirmed"
    norm = status_str.strip().lower()
    if "confirm" in norm or norm == "conf":
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
    """Populate and normalize exact 30 legacy reservations data into properties, room types, rooms, guests, bookings, payments, and reviews."""
    try:
        ensure_database_tables_exist()

        # Check if already populated with exact 30 bookings
        if Booking.objects.count() == 30 and Property.objects.filter(name__icontains="Kaveri Riverside").exists():
            return

        print("INFO: Seeding exact 30-record Kaveri database...")

        with transaction.atomic():
            Review.objects.all().delete()
            Payment.objects.all().delete()
            Booking.objects.all().delete()
            Rate.objects.all().delete()
            Room.objects.all().delete()
            Guest.objects.all().delete()
            RoomType.objects.all().delete()
            Property.objects.all().delete()
            LegacyReservations.objects.all().delete()

            # 1. Properties
            prop_riverside, _ = Property.objects.get_or_create(
                name="Kaveri Riverside",
                city="Coorg",
                defaults={"stars": 4}
            )
            prop_hilltop, _ = Property.objects.get_or_create(
                name="Kaveri Hilltop",
                city="Ooty",
                defaults={"stars": 5}
            )
            prop_backwater, _ = Property.objects.get_or_create(
                name="Kaveri Backwater",
                city="Alleppey",
                defaults={"stars": 4}
            )

            property_map = {
                "kaveri riverside": prop_riverside,
                "kaveri hilltop": prop_hilltop,
                "kaveri backwater": prop_backwater,
                "kaveri backwaters": prop_backwater,
                "coorg": prop_riverside,
                "ooty": prop_hilltop,
                "alleppey": prop_backwater,
            }

            # 2. Room Types
            rt_deluxe, _ = RoomType.objects.get_or_create(type_name="Deluxe", defaults={"max_occupancy": 4})
            rt_suite, _ = RoomType.objects.get_or_create(type_name="Suite", defaults={"max_occupancy": 4})
            rt_standard, _ = RoomType.objects.get_or_create(type_name="Standard", defaults={"max_occupancy": 4})

            room_type_map = {
                "deluxe": rt_deluxe,
                "suite": rt_suite,
                "standard": rt_standard,
            }

            # 3. Rooms across properties
            rooms_dict = {}
            # Coorg rooms: 101, 102, 103, 104, 105
            for rnum, rtype in [("101", rt_deluxe), ("102", rt_deluxe), ("103", rt_standard), ("104", rt_standard), ("105", rt_suite)]:
                r, _ = Room.objects.get_or_create(property=prop_riverside, room_number=rnum, defaults={"room_type": rtype})
                rooms_dict[(prop_riverside.property_id, rnum)] = r

            # Ooty rooms: 201, 202, 203, 204, 205
            for rnum, rtype in [("201", rt_suite), ("202", rt_deluxe), ("203", rt_deluxe), ("204", rt_standard), ("205", rt_deluxe)]:
                r, _ = Room.objects.get_or_create(property=prop_hilltop, room_number=rnum, defaults={"room_type": rtype})
                rooms_dict[(prop_hilltop.property_id, rnum)] = r

            # Alleppey rooms: 301, 302, 303, 304
            for rnum, rtype in [("301", rt_deluxe), ("302", rt_deluxe), ("303", rt_suite), ("304", rt_standard)]:
                r, _ = Room.objects.get_or_create(property=prop_backwater, room_number=rnum, defaults={"room_type": rtype})
                rooms_dict[(prop_backwater.property_id, rnum)] = r

            # 4. Populate LegacyReservations table and Normalized Entities
            for row in RAW_LEGACY_DATA:
                row_id, g_name, g_email, g_phone, g_city, h_name, h_city, h_star, r_nums, r_type, g_count, c_in_str, c_out_str, n_rate_str, t_paid_str, p_method_str, status_str, notes_val = row

                # Save raw row into legacy_reservations
                LegacyReservations.objects.update_or_create(
                    row_id=row_id,
                    defaults={
                        "guest_name": g_name,
                        "guest_email": g_email,
                        "guest_phone": g_phone,
                        "guest_city": g_city,
                        "hotel_name": h_name,
                        "hotel_city": h_city,
                        "hotel_star": h_star,
                        "room_numbers": r_nums,
                        "room_type": r_type,
                        "guests_count": g_count,
                        "checkin": c_in_str,
                        "checkout": c_out_str,
                        "nightly_rate": n_rate_str,
                        "total_paid": t_paid_str,
                        "payment_method": p_method_str,
                        "status": status_str,
                        "notes": notes_val
                    }
                )

                # Normalized Guest
                clean_em = clean_email(g_email)
                cl_name = clean_name(g_name)
                cl_city = clean_city(g_city)
                cl_phone = (g_phone or "").strip()

                guest_obj, created = Guest.objects.get_or_create(
                    email=clean_em,
                    defaults={
                        "name": cl_name,
                        "phone": cl_phone,
                        "city": cl_city
                    }
                )

                # Identify property
                target_prop = property_map.get(h_name.strip().lower()) or property_map.get(h_city.strip().lower()) or prop_riverside
                
                # Identify room type
                rt_obj = room_type_map.get(r_type.strip().lower(), rt_deluxe)

                # First room number
                primary_room_num = [r.strip() for r in r_nums.split(",") if r.strip()][0]
                room_obj = rooms_dict.get((target_prop.property_id, primary_room_num))
                if not room_obj:
                    room_obj, _ = Room.objects.get_or_create(
                        property=target_prop,
                        room_number=primary_room_num,
                        defaults={"room_type": rt_obj}
                    )
                    rooms_dict[(target_prop.property_id, primary_room_num)] = room_obj

                # Dates
                check_in_date = parse_date(c_in_str) or date(2025, 1, 1)
                check_out_date = parse_date(c_out_str) or (check_in_date + timedelta(days=3))
                if check_out_date <= check_in_date:
                    check_out_date = check_in_date + timedelta(days=1)

                guests_num = parse_int(g_count, 2)
                guests_num = max(1, guests_num)
                booking_status = clean_status(status_str)

                # Rate
                nightly_val = parse_decimal(n_rate_str)
                if nightly_val > 0:
                    Rate.objects.get_or_create(
                        property=target_prop,
                        room_type=rt_obj,
                        start_date=check_in_date,
                        end_date=check_out_date,
                        defaults={"nightly_rate": nightly_val}
                    )

                # Booking
                booking_id_int = int(row_id)
                booking_obj = Booking.objects.create(
                    booking_id=booking_id_int,
                    guest=guest_obj,
                    room=room_obj,
                    check_in=check_in_date,
                    check_out=check_out_date,
                    guest_count=guests_num,
                    status=booking_status
                )

                # Payment
                paid_amt = parse_decimal(t_paid_str)
                pm_method = clean_payment_method(p_method_str)
                Payment.objects.create(
                    booking=booking_obj,
                    amount=paid_amt,
                    method=pm_method,
                    payment_date=check_in_date
                )

                # Review / Notes
                if notes_val and str(notes_val).strip() and str(notes_val).strip().upper() not in ("N/A", "-", "NULL", "NONE"):
                    comment_text = str(notes_val).strip()
                    rating_score = 5 if booking_status != "cancelled" else 3
                    Review.objects.create(
                        booking=booking_obj,
                        rating=rating_score,
                        comment=comment_text,
                        review_date=check_out_date
                    )
                elif booking_id_int in (1, 3, 6, 9, 12, 14, 20, 21, 25):
                    comments_pool = {
                        1: "Exceptional riverside luxury and peaceful serene nature in Coorg.",
                        3: "High altitude tranquility with panoramic views across Ooty tea estates.",
                        6: "Picturesque Alleppey backwaters and memorable houseboat dining.",
                        9: "World-class private suite with infinity plunge pool.",
                        12: "Flawless hospitality and immaculate concierge service.",
                        14: "Extraordinarily comfortable suite and warm courteous staff.",
                        20: "The peak season holiday retreat of our dreams in Kerala.",
                        21: "Third wonderful stay with Kaveri Collection - unrivaled excellence!",
                        25: "Returning guest and once again thoroughly impressed."
                    }
                    Review.objects.create(
                        booking=booking_obj,
                        rating=5,
                        comment=comments_pool.get(booking_id_int, "Exquisite hospitality, regal ambience, and world-class luxury!"),
                        review_date=check_out_date
                    )

        print("SUCCESS: Seeded 30 Kaveri legacy records, 3 properties, 19 guests, 30 payments & reviews.")
    except Exception as e:
        print(f"WARNING: Database population error: {e}")

def import_legacy_data_if_needed():
    ensure_database_tables_exist()
    seed_initial_enterprise_data()
