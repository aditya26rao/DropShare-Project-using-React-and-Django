import mimetypes
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UploadedFile, ShareLink
from .serializers import (
    RegisterSerializer, UserSerializer,
    UploadedFileSerializer, ShareLinkSerializer,
)


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ── Files ─────────────────────────────────────────────────────────────────────

class FileUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        files = UploadedFile.objects.filter(owner=request.user).order_by("-uploaded_at")
        return Response(UploadedFileSerializer(files, many=True).data)

    def post(self, request):
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response({"error": "No file provided"}, status=400)

        mime, _ = mimetypes.guess_type(uploaded.name)
        instance = UploadedFile.objects.create(
            owner=request.user,
            file=uploaded,
            original_name=uploaded.name,
            file_size=uploaded.size,
            mime_type=mime or "application/octet-stream",
        )
        return Response(UploadedFileSerializer(instance).data, status=201)


class FileDeleteView(APIView):
    def delete(self, request, pk):
        file = get_object_or_404(UploadedFile, id=pk, owner=request.user)
        file.file.delete(save=False)
        file.delete()
        return Response(status=204)


# ── Share links ───────────────────────────────────────────────────────────────

class ShareLinkListCreateView(generics.ListCreateAPIView):
    serializer_class = ShareLinkSerializer

    def get_queryset(self):
        return ShareLink.objects.filter(created_by=self.request.user).select_related("file").order_by("-created_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class ShareLinkDeleteView(APIView):
    def delete(self, request, token):
        link = get_object_or_404(ShareLink, token=token, created_by=request.user)
        link.delete()
        return Response(status=204)


# ── Public download ───────────────────────────────────────────────────────────

class PublicDownloadView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        link = get_object_or_404(ShareLink, token=token)

        if link.is_expired:
            return Response({"error": "This link has expired."}, status=410)

        link.download_count += 1
        link.save(update_fields=["download_count"])

        file_obj = link.file
        response = FileResponse(
            file_obj.file.open("rb"),
            content_type=file_obj.mime_type,
            as_attachment=True,
            filename=file_obj.original_name,
        )
        return response

    def head(self, request, token):
        """Return file metadata without downloading."""
        link = get_object_or_404(ShareLink, token=token)
        if link.is_expired:
            return Response(status=410)
        serializer = ShareLinkSerializer(link, context={"request": request})
        return Response(serializer.data)
