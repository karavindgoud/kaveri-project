from typing import Any
from django.db import models
from django.core.validators import MinValueValidator

class RoomType(models.Model):
    objects = models.Manager()

    room_type_id = models.AutoField(primary_key=True)
    type_name = models.CharField(unique=True, max_length=20, help_text="Category name (e.g. Deluxe, Suite)")
    max_occupancy = models.SmallIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Maximum guests allowed in this room type"
    )

    class Meta:
        managed = False
        db_table = 'room_type'
        verbose_name = 'Room Type'
        verbose_name_plural = 'Room Types'
        ordering = ['room_type_id']

    def __str__(self):
        return f"{self.type_name} (Max Guests: {self.max_occupancy})"
