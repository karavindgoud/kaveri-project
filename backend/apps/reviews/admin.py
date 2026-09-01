from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('review_id', 'booking', 'rating', 'review_date', 'comment_snippet')
    list_filter = ('rating', 'review_date')
    search_fields = ('booking__guest__name', 'comment')
    ordering = ('-review_date',)

    def comment_snippet(self, obj):
        return (obj.comment[:50] + '...') if obj.comment and len(obj.comment) > 50 else obj.comment
    comment_snippet.short_description = 'Comment'
