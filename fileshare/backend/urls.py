from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", TokenObtainPairView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("auth/me/", views.MeView.as_view()),

    # Files
    path("files/", views.FileUploadView.as_view()),
    path("files/<uuid:pk>/", views.FileDeleteView.as_view()),

    # Share links
    path("shares/", views.ShareLinkListCreateView.as_view()),
    path("shares/<uuid:token>/", views.ShareLinkDeleteView.as_view()),

    # Public
    path("download/<uuid:token>/", views.PublicDownloadView.as_view()),
]
