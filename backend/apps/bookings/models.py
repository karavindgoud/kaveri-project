from typing import Any
from django.db import models
from django.core.validators import MinValueValidator

class Booking(models.Model):
    objects = models.Manager()
    DoesNotExist: Any = models.ObjectDoesNotExist

    STATUS_CHOICES = (
        ('confirmed', 'Confirmed'),
        ('checked_in', 'Checked In'),
        ('checked_out', 'Checked Out'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )

    booking_id = models.AutoField(primary_key=True)
    guest_id: int
    guest: Any = models.ForeignKey(
        'guests.Guest',
        on_delete=models.DO_NOTHING,
        db_column='guest_id',
        related_name='bookings'
    )
    room_id: int
    room: Any = models.ForeignKey(
        'rooms.Room',
        on_delete=models.DO_NOTHING,
        db_column='room_id',
        related_name='bookings'
    )
    payments: Any
    review: Any
    check_in = models.DateField(help_text="Arrival date")
    check_out = models.DateField(help_text="Departure date")
    guest_count = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Number of guests"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        help_text="Reservation status"
    )

    class Meta:
        managed = False
        db_table = 'booking'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-check_in', 'booking_id']

    def __str__(self):
        return f"Booking #{self.booking_id}: {self.guest.name} - Room {self.room.room_number} ({self.status})"

    @property
    def nights_count(self):
        if self.check_out and self.check_in:
            return (self.check_out - self.check_in).days
        return 0

    @property
    def total_paid(self):
        return sum(p.amount for p in self.payments.all())
