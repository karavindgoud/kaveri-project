from django.contrib import admin
from .models import Guest

@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ('guest_id', 'name', 'email', 'phone', 'city', 'total_bookings_count')
    search_fields = ('name', 'email', 'phone', 'city')
    ordering = ('guest_id',)
