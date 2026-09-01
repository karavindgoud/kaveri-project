from django.db import models

class Payment(models.Model):
    METHOD_CHOICES = (
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('upi', 'UPI'),
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
    )

    payment_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.DO_NOTHING,
        db_column='booking_id',
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Payment amount")
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, help_text="Payment method")
    payment_date = models.DateField(help_text="Transaction date")

    class Meta:
        managed = False
        db_table = 'payment'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-payment_date', 'payment_id']

    def __str__(self):
        return f"Payment #{self.payment_id}: ${self.amount} via {self.method} for Booking #{self.booking_id}"
