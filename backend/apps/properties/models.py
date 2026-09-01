from typing import Any
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Property(models.Model):
    objects = models.Manager()
    rooms: Any

    property_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, help_text="Hotel Property Name")
    city = models.CharField(max_length=50, help_text="City location of the property")
    stars = models.SmallIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Star rating (1 to 5)"
    )

    class Meta:
        managed = False
        db_table = 'property'
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'
        ordering = ['property_id']

    def __str__(self):
        star_str = f" ({self.stars}★)" if self.stars else ""
        return f"{self.name} - {self.city}{star_str}"

    @property
    def total_rooms_count(self):
        return self.rooms.count()
