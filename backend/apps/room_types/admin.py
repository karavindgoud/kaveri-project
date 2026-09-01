from django.contrib import admin
from .models import RoomType

@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ('room_type_id', 'type_name', 'max_occupancy')
    search_fields = ('type_name',)
    ordering = ('room_type_id',)
