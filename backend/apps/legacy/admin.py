from django.contrib import admin
from .models import LegacyReservations

@admin.register(LegacyReservations)
class LegacyReservationsAdmin(admin.ModelAdmin):
    list_display = ('row_id', 'guest_name', 'guest_email', 'hotel_name', 'checkin', 'checkout', 'status')
    search_fields = ('guest_name', 'guest_email', 'hotel_name')
