from rest_framework import serializers
from .models import SharedFile


class SharedFileSerializer(serializers.ModelSerializer):
    share_url = serializers.ReadOnlyField()
    file_size_display = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = SharedFile
        fields = [
            'id', 'original_name', 'file_size', 'file_size_display',
            'file_type', 'share_token', 'uploaded_at', 'expires_at',
            'download_count', 'uploader_name', 'message',
            'share_url', 'file_url',
        ]
        read_only_fields = ['id', 'share_token', 'uploaded_at', 'download_count']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class FileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model = SharedFile
        fields = ['file', 'uploader_name', 'message', 'expires_at']

    def create(self, validated_data):
        file_obj = validated_data['file']
        validated_data['original_name'] = file_obj.name
        validated_data['file_size'] = file_obj.size
        validated_data['file_type'] = file_obj.content_type or ''
        return super().create(validated_data)
