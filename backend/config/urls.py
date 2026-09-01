from django.contrib import admin
from django.urls import path

admin.site.site_header = "Kaveri Stays Administration"
admin.site.site_title = "Kaveri Stays Admin Portal"
admin.site.index_title = "Welcome to Kaveri Stays Enterprise Management"

urlpatterns = [
    path('admin/', admin.site.urls),
]
