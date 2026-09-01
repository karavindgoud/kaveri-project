from django.contrib import admin
from .models import Property

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('property_id', 'name', 'city', 'stars', 'total_rooms_count')
    list_filter = ('city', 'stars')
    search_fields = ('name', 'city')
    ordering = ('property_id',)
