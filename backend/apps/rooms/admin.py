from django.contrib import admin
from .models import Room

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_id', 'room_number', 'property', 'room_type')
    list_filter = ('property', 'room_type')
    search_fields = ('room_number', 'property__name')
    ordering = ('property', 'room_number')
