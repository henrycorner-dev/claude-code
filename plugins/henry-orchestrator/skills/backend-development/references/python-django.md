# Python/Django Reference

## Django REST Framework Project Structure

```
project/
├── manage.py
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   └── users/
│       ├── __init__.py
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       ├── urls.py
│       ├── services.py
│       ├── permissions.py
│       └── tests.py
└── requirements.txt
```

## Settings Configuration

```python
# config/settings.py
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    # Local apps
    'apps.users',
    'apps.products',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

# Security
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG
```

## Models

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['-date_joined']),
        ]

    def __str__(self):
        return self.email
```

```python
# apps/products/models.py
from django.db import models
from django.conf import settings

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name
```

## Serializers

```python
# apps/users/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password': 'Password fields did not match'
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'email']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value
```

```python
# apps/products/serializers.py
from rest_framework import serializers
from .models import Product
from apps.users.serializers import UserSerializer

class ProductSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock',
            'is_active', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price cannot be negative')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative')
        return value

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'stock']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ProductUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'stock', 'is_active']
```

## Views

### Class-Based Views

```python
# apps/users/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import User
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer
)
from .permissions import IsOwnerOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'email']
    ordering_fields = ['date_joined', 'name']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
```

### Function-Based Views

```python
# apps/users/views.py (alternative)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import UserSerializer, UserCreateSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

## Service Layer

```python
# apps/users/services.py
from typing import Optional, Dict, Any
from django.db import transaction
from django.core.exceptions import ValidationError

from .models import User

class UserService:
    @staticmethod
    def create_user(data: Dict[str, Any]) -> User:
        """Create a new user with validation"""
        with transaction.atomic():
            user = User.objects.create_user(
                email=data['email'],
                password=data['password'],
                name=data['name']
            )
            # Additional logic like sending welcome email
            return user

    @staticmethod
    def update_user(user: User, data: Dict[str, Any]) -> User:
        """Update user with validation"""
        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)

        user.full_clean()
        user.save()
        return user

    @staticmethod
    def deactivate_user(user: User) -> User:
        """Soft delete user"""
        user.is_active = False
        user.save()
        return user

    @staticmethod
    def get_active_users(filters: Optional[Dict] = None):
        """Get active users with optional filters"""
        queryset = User.objects.filter(is_active=True)

        if filters:
            if 'search' in filters:
                queryset = queryset.filter(
                    name__icontains=filters['search']
                )
            if 'date_from' in filters:
                queryset = queryset.filter(
                    date_joined__gte=filters['date_from']
                )

        return queryset.select_related().prefetch_related()
```

## Permissions

```python
# apps/users/permissions.py
from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners or admins to edit objects
    """
    def has_object_permission(self, request, view, obj):
        # Admin users have all permissions
        if request.user.is_staff:
            return True

        # Write permissions only for owner
        return obj == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin can do everything, others can only read
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
```

## Custom Exception Handler

```python
# apps/core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize error response format
        response.data = {
            'status': 'error',
            'message': str(exc),
            'details': response.data
        }
        return response

    # Handle Django validation errors
    if isinstance(exc, DjangoValidationError):
        return Response({
            'status': 'error',
            'message': 'Validation failed',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
        }, status=status.HTTP_400_BAD_REQUEST)

    # Handle 404 errors
    if isinstance(exc, Http404):
        return Response({
            'status': 'error',
            'message': 'Resource not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Unhandled exceptions
    return Response({
        'status': 'error',
        'message': 'Internal server error'
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

## URL Configuration

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
]
```

```python
# apps/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

## Authentication

### Custom JWT Claims

```python
# apps/users/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['name'] = user.name
        token['email'] = user.email
        token['is_staff'] = user.is_staff

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add extra responses
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'name': self.user.name
        }

        return data
```

```python
# apps/users/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
```

## Filters

```python
# apps/products/filters.py
from django_filters import rest_framework as filters
from .models import Product

class ProductFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    in_stock = filters.BooleanFilter(method='filter_in_stock')

    class Meta:
        model = Product
        fields = ['name', 'is_active']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset
```

```python
# apps/products/views.py
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer
from .filters import ProductFilter

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
```

## Pagination

```python
# apps/core/pagination.py
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'results': data
        })
```

## Middleware

```python
# apps/core/middleware.py
import logging
import uuid
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class RequestIDMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.id = str(uuid.uuid4())
        return None

    def process_response(self, request, response):
        if hasattr(request, 'id'):
            response['X-Request-ID'] = request.id
        return response

class RequestLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        logger.info(f"Request: {request.method} {request.path}", extra={
            'request_id': getattr(request, 'id', None),
            'user': request.user.id if request.user.is_authenticated else None
        })
        return None
```

## Testing

```python
# apps/users/tests.py
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse

from .models import User

class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )

    def test_create_user(self):
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('testpass123'))

    def test_user_str(self):
        self.assertEqual(str(self.user), 'test@example.com')

class UserAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )

    def test_create_user(self):
        url = reverse('user-list')
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'name': 'New User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_get_users_authenticated(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_users_unauthenticated(self):
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
```

## Management Commands

```python
# apps/users/management/commands/create_admin.py
from django.core.management.base import BaseCommand
from apps.users.models import User

class Command(BaseCommand):
    help = 'Create an admin user'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str)
        parser.add_argument('--name', type=str, default='Admin')

    def handle(self, *args, **options):
        email = options['email']
        name = options['name']

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User {email} already exists')
            )
            return

        user = User.objects.create_superuser(
            email=email,
            password='admin123',  # Should be changed
            name=name
        )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created admin user {email}')
        )
```

## Signals

```python
# apps/users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    if created:
        # Send welcome email
        # Create user profile
        # Log user creation
        print(f"New user created: {instance.email}")
```

## Best Practices Summary

1. **Use Django REST Framework** for API development
2. **Separate concerns**: Views, serializers, services, models
3. **Use viewsets** for CRUD operations
4. **Implement permissions** properly
5. **Use serializers** for validation
6. **Write tests** for all endpoints
7. **Use Django ORM** efficiently with select_related and prefetch_related
8. **Implement pagination** for list endpoints
9. **Use filters** for searchable endpoints
10. **Handle exceptions** with custom exception handler
11. **Use transactions** for related operations
12. **Implement proper authentication** with JWT
13. **Use environment variables** for configuration
14. **Write management commands** for admin tasks
15. **Use signals** for decoupled event handling
