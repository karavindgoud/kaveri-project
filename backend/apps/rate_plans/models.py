from typing import Any
from django.db import models

class Rate(models.Model):
    objects = models.Manager()

    rate_id = models.AutoField(primary_key=True)
    property_id: int
    property: Any = models.ForeignKey(
        'properties.Property',
        on_delete=models.DO_NOTHING,
        db_column='property_id',
        related_name='rates'
    )
    room_type_id: int
    room_type: Any = models.ForeignKey(
        'room_types.RoomType',
        on_delete=models.DO_NOTHING,
        db_column='room_type_id',
        related_name='rates'
    )
    start_date = models.DateField(help_text="Effective start date")
    end_date = models.DateField(help_text="Effective end date")
    nightly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Rate per night in currency"
    )

    class Meta:
        managed = False
        db_table = 'rate'
        verbose_name = 'Rate Plan'
        verbose_name_plural = 'Rate Plans'
        ordering = ['start_date', 'property']

    def __str__(self):
        return f"{self.property.name} - {self.room_type.type_name}: ${self.nightly_rate}/night ({self.start_date} to {self.end_date})"
