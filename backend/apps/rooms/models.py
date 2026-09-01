from django.db import models

class Room(models.Model):
    room_id = models.AutoField(primary_key=True)
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.DO_NOTHING,
        db_column='property_id',
        related_name='rooms'
    )
    room_number = models.CharField(max_length=10, help_text="Room number within property")
    room_type = models.ForeignKey(
        'room_types.RoomType',
        on_delete=models.DO_NOTHING,
        db_column='room_type_id',
        related_name='rooms'
    )

    class Meta:
        managed = False
        db_table = 'room'
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        unique_together = (('property', 'room_number'),)
        ordering = ['property', 'room_number']

    def __str__(self):
        return f"Room {self.room_number} - {self.property.name} ({self.room_type.type_name})"
