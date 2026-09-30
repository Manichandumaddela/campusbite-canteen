from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    student_id = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)
    year = models.CharField(max_length=20, blank=True)
    avatar = models.CharField(max_length=255, blank=True, default='👨‍🎓')
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} ({self.student_id or 'No ID'})"


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True, default='')
    icon = models.CharField(max_length=50, blank=True, default='🍽️')
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.name.lower().replace(' ', '-').replace('&', 'and')
        super().save(*args, **kwargs)


class FoodItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    original_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    image = models.ImageField(upload_to='foods/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    is_veg = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)
    is_special = models.BooleanField(default=False)
    stock_quantity = models.PositiveIntegerField(default=50)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    rating_count = models.PositiveIntegerField(default=1)
    preparation_time = models.PositiveIntegerField(default=15, help_text="Estimated minutes")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-is_special', '-is_popular', '-rating', 'name']

    def __str__(self):
        return f"{self.name} (₹{self.price})"


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_percent = models.PositiveIntegerField(default=10)
    min_order = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=8, decimal_places=2, default=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.code} ({self.discount_percent}% off)"


class Order(models.Model):
    STATUS_CHOICES = [
        ('placed', 'Order Placed'),
        ('confirmed', 'Order Confirmed'),
        ('preparing', 'Preparing in Kitchen'),
        ('ready', 'Ready for Pickup'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_CHOICES = [
        ('counter', 'Pay at Counter (Cash/Card)'),
        ('upi', 'UPI / QR Code Scan'),
        ('wallet', 'Campus Smart Wallet'),
    ]

    PAYMENT_STATUS = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid'),
        ('failed', 'Payment Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_id = models.CharField(max_length=50, unique=True, blank=True)
    token_number = models.CharField(max_length=10, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='placed')
    
    # Financials
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    
    # Student / Delivery Details
    student_name = models.CharField(max_length=150, blank=True)
    student_id = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)
    year = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    pickup_location = models.CharField(max_length=100, default='Main Canteen Counter 1')
    special_instructions = models.TextField(blank=True)
    
    # Payment
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='counter')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    estimated_prep_time = models.PositiveIntegerField(default=15)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_id or self.id} - {self.student_name or self.user.username}"

    def save(self, *args, **kwargs):
        if not self.order_id:
            now_str = timezone.now().strftime('%Y%m%d')
            rand_suffix = ''.join(random.choices(string.digits, k=4))
            self.order_id = f"CAN{now_str}{rand_suffix}"
        if not self.token_number:
            self.token_number = ''.join(random.choices(string.digits, k=4))
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def subtotal(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.food_item.name} x {self.quantity}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.food_item.name} ({self.rating}★)"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, default='order')
    is_read = models.BooleanField(default=False)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'food_item')

    def __str__(self):
        return f"{self.user.username} ❤️ {self.food_item.name}"
