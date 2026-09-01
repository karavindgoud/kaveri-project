from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'guest', 'room', 'check_in', 'check_out', 'guest_count', 'status', 'nights_count')
    list_filter = ('status', 'check_in', 'room__property')
    search_fields = ('guest__name', 'guest__email', 'room__room_number')
    ordering = ('-check_in',)
