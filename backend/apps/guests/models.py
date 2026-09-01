from django.db import models

class Guest(models.Model):
    guest_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, help_text="Full Name")
    email = models.CharField(unique=True, max_length=255, help_text="Unique Email Address")
    phone = models.CharField(max_length=20, blank=True, null=True, help_text="Phone Number")
    city = models.CharField(max_length=50, blank=True, null=True, help_text="City of Residence")

    class Meta:
        managed = False
        db_table = 'guest'
        verbose_name = 'Guest'
        verbose_name_plural = 'Guests'
        ordering = ['guest_id']

    def __str__(self):
        return f"{self.name} ({self.email})"

    @property
    def total_bookings_count(self):
        return self.bookings.count()
