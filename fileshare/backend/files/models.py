from django.db import models
import uuid


def upload_to(instance, filename):
    ext = filename.split('.')[-1]
    return f'uploads/{uuid.uuid4()}.{ext}'


class SharedFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_name = models.CharField(max_length=255)
    file = models.FileField(upload_to=upload_to)
    file_size = models.BigIntegerField(default=0)  # bytes
    file_type = models.CharField(max_length=100, blank=True)
    share_token = models.UUIDField(default=uuid.uuid4, unique=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    download_count = models.IntegerField(default=0)
    uploader_name = models.CharField(max_length=100, blank=True, default='Anonymous')
    message = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.original_name} ({self.share_token})"

    @property
    def share_url(self):
        return f"/share/{self.share_token}"

    @property
    def file_size_display(self):
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
