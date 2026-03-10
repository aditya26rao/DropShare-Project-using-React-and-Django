from django.contrib import admin
from .models import SharedFile


@admin.register(SharedFile)
class SharedFileAdmin(admin.ModelAdmin):
    list_display = ['original_name', 'uploader_name', 'file_size_display', 'download_count', 'uploaded_at', 'share_token']
    list_filter = ['uploaded_at', 'file_type']
    search_fields = ['original_name', 'uploader_name', 'share_token']
    readonly_fields = ['id', 'share_token', 'uploaded_at', 'download_count']
