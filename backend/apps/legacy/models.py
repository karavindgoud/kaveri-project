from django.db import models

class LegacyReservations(models.Model):
    row_id = models.TextField(primary_key=True)
    guest_name = models.TextField(blank=True, null=True)
    guest_email = models.TextField(blank=True, null=True)
    guest_phone = models.TextField(blank=True, null=True)
    guest_city = models.TextField(blank=True, null=True)
    hotel_name = models.TextField(blank=True, null=True)
    hotel_city = models.TextField(blank=True, null=True)
    hotel_star = models.TextField(blank=True, null=True)
    room_numbers = models.TextField(blank=True, null=True)
    room_type = models.TextField(blank=True, null=True)
    guests_count = models.TextField(blank=True, null=True)
    checkin = models.TextField(blank=True, null=True)
    checkout = models.TextField(blank=True, null=True)
    nightly_rate = models.TextField(blank=True, null=True)
    total_paid = models.TextField(blank=True, null=True)
    payment_method = models.TextField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'legacy_reservations'
        verbose_name = 'Legacy Reservation'
        verbose_name_plural = 'Legacy Reservations'

    def __str__(self):
        return f"Legacy Reservation {self.row_id} - {self.guest_name}"
