from django.contrib import admin
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

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'student_id', 'department', 'phone', 'is_admin']
    search_fields = ['user__username', 'student_id', 'phone']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'is_active', 'created_at']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_veg', 'is_available', 'stock_quantity', 'rating']
    list_filter = ['category', 'is_veg', 'is_available', 'is_popular', 'is_special']
    search_fields = ['name', 'description']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'token_number', 'user', 'student_name', 'status', 'total_amount', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method', 'payment_status']
    search_fields = ['order_id', 'token_number', 'student_name', 'user__username']
    inlines = [OrderItemInline]

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'food_item', 'rating', 'created_at']
    list_filter = ['rating']

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_percent', 'min_order', 'max_discount', 'is_active']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'is_read', 'created_at']

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'food_item', 'created_at']
