from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category,
    FoodItem,
    Order,
    OrderItem,
    UserProfile,
    Review,
    Coupon,
    Notification,
    Favorite
)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone', 'student_id', 'department', 'year', 'avatar', 'is_admin']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    student_id = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    year = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'student_id', 'department', 'year']

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        student_id = validated_data.pop('student_id', '')
        department = validated_data.pop('department', '')
        year = validated_data.pop('year', '')

        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(
            user=user,
            phone=phone,
            student_id=student_id,
            department=department,
            year=year
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'image', 'image_url', 'is_active', 'items_count']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.CharField(source='user.profile.avatar', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'user_name', 'avatar', 'food_item', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']


class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    display_image = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = FoodItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description', 'price',
            'original_price', 'image', 'image_url', 'display_image', 'is_veg',
            'is_available', 'is_popular', 'is_special', 'stock_quantity',
            'rating', 'rating_count', 'preparation_time', 'created_at', 'reviews'
        ]

    def get_display_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url or 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'


class OrderItemSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source='food_item.name', read_only=True)
    food_image = serializers.SerializerMethodField()
    is_veg = serializers.BooleanField(source='food_item.is_veg', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'food_item', 'food_name', 'food_image', 'is_veg', 'quantity', 'price']

    def get_food_image(self, obj):
        if obj.food_item.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.food_item.image.url)
            return obj.food_item.image.url
        return obj.food_item.image_url or 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'username', 'order_id', 'token_number', 'status',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount', 'coupon_code',
            'student_name', 'student_id', 'department', 'year', 'phone',
            'pickup_location', 'special_instructions', 'payment_method', 'payment_status',
            'estimated_prep_time', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['user', 'order_id', 'token_number', 'created_at', 'updated_at']


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'order', 'created_at']


class FavoriteSerializer(serializers.ModelSerializer):
    food_item_details = FoodItemSerializer(source='food_item', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'food_item', 'food_item_details', 'created_at']
