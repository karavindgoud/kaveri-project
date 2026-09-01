from django.contrib import admin
from .models import Rate

@admin.register(Rate)
class RateAdmin(admin.ModelAdmin):
    list_display = ('rate_id', 'property', 'room_type', 'nightly_rate', 'start_date', 'end_date')
    list_filter = ('property', 'room_type')
    search_fields = ('property__name', 'room_type__type_name')
    ordering = ('start_date',)
