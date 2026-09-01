from typing import Any
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    objects = models.Manager()
    DoesNotExist: Any = models.ObjectDoesNotExist

    review_id = models.AutoField(primary_key=True)
    booking_id: int
    booking: Any = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.DO_NOTHING,
        db_column='booking_id',
        related_name='review'
    )
    rating = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Star rating (1 to 5)"
    )
    comment = models.TextField(blank=True, null=True, help_text="Guest review comments")
    review_date = models.DateField(blank=True, null=True, help_text="Date review was submitted")

    class Meta:
        managed = False
        db_table = 'review'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-review_date', 'review_id']

    def __str__(self):
        rating_str = f"{self.rating}★" if self.rating else "No rating"
        return f"Review #{self.review_id} for Booking #{self.booking_id}: {rating_str}"
