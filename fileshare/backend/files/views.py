from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.utils import timezone

from .models import SharedFile
from .serializers import SharedFileSerializer, FileUploadSerializer


class FileUploadView(APIView):
    """POST /api/upload/ - Upload a new file."""
    parser_classes = [MultiPartParser]

    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        shared_file = serializer.save()
        response_serializer = SharedFileSerializer(shared_file, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class FileDetailView(APIView):
    """GET /api/files/<share_token>/ - Get file metadata by share token."""

    def get(self, request, share_token):
        shared_file = get_object_or_404(SharedFile, share_token=share_token)

        # Check expiry
        if shared_file.expires_at and shared_file.expires_at < timezone.now():
            return Response(
                {'error': 'This share link has expired.'},
                status=status.HTTP_410_GONE
            )

        serializer = SharedFileSerializer(shared_file, context={'request': request})
        return Response(serializer.data)


class FileDownloadView(APIView):
    """GET /api/download/<share_token>/ - Download the actual file."""

    def get(self, request, share_token):
        shared_file = get_object_or_404(SharedFile, share_token=share_token)

        # Check expiry
        if shared_file.expires_at and shared_file.expires_at < timezone.now():
            return Response(
                {'error': 'This share link has expired.'},
                status=status.HTTP_410_GONE
            )

        # Increment download count
        shared_file.download_count += 1
        shared_file.save(update_fields=['download_count'])

        # Stream file from Django storage
        response = FileResponse(
            shared_file.file.open('rb'),
            as_attachment=True,
            filename=shared_file.original_name
        )
        return response


class MyFilesView(APIView):
    """GET /api/files/ - List all uploaded files (in production, filter by user)."""

    def get(self, request):
        files = SharedFile.objects.all()[:50]
        serializer = SharedFileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)


class FileDeleteView(APIView):
    """DELETE /api/files/<share_token>/delete/ - Delete a file."""

    def delete(self, request, share_token):
        shared_file = get_object_or_404(SharedFile, share_token=share_token)

        # Delete actual file from storage backend
        if shared_file.file:
            shared_file.file.delete(save=False)

        shared_file.delete()
        return Response({'message': 'File deleted successfully.'}, status=status.HTTP_200_OK)
