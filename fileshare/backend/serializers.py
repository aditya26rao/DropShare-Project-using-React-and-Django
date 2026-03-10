from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile, ShareLink


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UploadedFileSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    share_count = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = ["id", "original_name", "file_size", "mime_type", "uploaded_at", "owner", "share_count"]

    def get_share_count(self, obj):
        return obj.shares.count()


class ShareLinkSerializer(serializers.ModelSerializer):
    file = UploadedFileSerializer(read_only=True)
    file_id = serializers.UUIDField(write_only=True)
    share_url = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ShareLink
        fields = [
            "token", "file", "file_id", "recipient_email", "message",
            "expires_at", "download_count", "max_downloads",
            "created_at", "share_url", "is_expired",
        ]
        read_only_fields = ["token", "download_count", "created_at"]

    def get_share_url(self, obj):
        request = self.context.get("request")
        base = request.build_absolute_uri("/") if request else "http://localhost:3000/"
        return f"{base}share/{obj.token}"

    def create(self, validated_data):
        file_id = validated_data.pop("file_id")
        file = UploadedFile.objects.get(id=file_id, owner=self.context["request"].user)
        return ShareLink.objects.create(file=file, created_by=self.context["request"].user, **validated_data)
