from django.urls import path
from . import views

urlpatterns = [
    # Auth & Profile
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/profile/', views.profile, name='profile'),

    # Categories
    path('categories/', views.CategoryListCreate.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetail.as_view(), name='category-detail'),

    # Foods
    path('foods/', views.FoodListCreate.as_view(), name='food-list-create'),
    path('foods/<int:pk>/', views.FoodDetail.as_view(), name='food-detail'),
    path('foods/<int:pk>/toggle-availability/', views.toggle_food_availability, name='toggle-food-availability'),
    path('foods/<int:food_id>/reviews/', views.food_reviews, name='food-reviews'),

    # Reviews
    path('reviews/<int:pk>/', views.delete_review, name='delete-review'),

    # Orders
    path('orders/create/', views.create_order, name='create-order'),
    path('orders/my/', views.my_orders, name='my-orders'),
    path('orders/all/', views.all_orders, name='all-orders'),
    path('orders/<int:pk>/', views.order_detail, name='order-detail'),
    path('orders/<int:pk>/status/', views.update_order_status, name='update-order-status'),

    # Coupons & Offers
    path('coupons/', views.list_coupons, name='list-coupons'),
    path('coupons/validate/', views.validate_coupon, name='validate-coupon'),

    # Notifications
    path('notifications/', views.my_notifications, name='my-notifications'),
    path('notifications/<int:pk>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark-all-notifications-read'),

    # Favorites
    path('favorites/', views.my_favorites, name='my-favorites'),
    path('favorites/<int:food_id>/toggle/', views.toggle_favorite, name='toggle-favorite'),

    # Admin Reports & Analytics
    path('admin/analytics/', views.admin_analytics, name='admin-analytics'),
    path('admin/customers/', views.admin_customers_list, name='admin-customers'),

    # Seed Database with realistic demo data
    path('seed/', views.seed_demo_data, name='seed-demo-data'),
]
