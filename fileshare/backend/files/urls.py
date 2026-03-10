from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.FileUploadView.as_view(), name='file-upload'),
    path('files/', views.MyFilesView.as_view(), name='file-list'),
    path('files/<uuid:share_token>/', views.FileDetailView.as_view(), name='file-detail'),
    path('files/<uuid:share_token>/delete/', views.FileDeleteView.as_view(), name='file-delete'),
    path('download/<uuid:share_token>/', views.FileDownloadView.as_view(), name='file-download'),
]
