from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'booking', 'amount', 'method', 'payment_date')
    list_filter = ('method', 'payment_date')
    search_fields = ('booking__booking_id', 'booking__guest__name', 'method')
    ordering = ('-payment_date',)
