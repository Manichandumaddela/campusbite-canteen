from decimal import Decimal
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

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
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserProfileSerializer,
    CategorySerializer,
    FoodItemSerializer,
    OrderSerializer,
    ReviewSerializer,
    CouponSerializer,
    NotificationSerializer,
    FavoriteSerializer
)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }


# ---------------- AUTHENTICATION & PROFILE ----------------

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({**get_tokens(user), 'user': UserSerializer(user, context={'request': request}).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''

    # Known credentials auto-provisioning / sync (ensures admin accounts work seamlessly in production)
    KNOWN_ACCOUNTS = {
        'manichandu': ('maddelamani', True, True, 'Mani', 'Chandu', 'maddelamanichandu@gmail.com'),
        'admin': ('admin123', True, True, 'Canteen', 'Manager', 'admin@canteen.edu'),
        'student': ('student123', False, False, 'Rahul', 'Sharma', 'rahul.sharma@college.edu'),
    }

    if username in KNOWN_ACCOUNTS and password == KNOWN_ACCOUNTS[username][0]:
        pwd, is_staff, is_superuser, fname, lname, email = KNOWN_ACCOUNTS[username]
        u, _ = User.objects.get_or_create(
            username=username,
            defaults={'first_name': fname, 'last_name': lname, 'email': email, 'is_staff': is_staff, 'is_superuser': is_superuser}
        )
        if not u.check_password(password) or u.is_staff != is_staff or u.is_superuser != is_superuser:
            u.set_password(password)
            u.is_staff = is_staff
            u.is_superuser = is_superuser
            u.save()
        prof, _ = UserProfile.objects.get_or_create(user=u)
        if is_staff and not prof.is_admin:
            prof.is_admin = True
            prof.save()

    user = authenticate(username=username, password=password)
    if user:
        # Ensure user profile exists
        UserProfile.objects.get_or_create(user=user)
        return Response({**get_tokens(user), 'user': UserSerializer(user, context={'request': request}).data})
    return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    prof, _ = UserProfile.objects.get_or_create(user=user)

    if request.method in ['PUT', 'PATCH']:
        first_name = request.data.get('first_name', user.first_name)
        last_name = request.data.get('last_name', user.last_name)
        email = request.data.get('email', user.email)
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.save()

        prof.phone = request.data.get('phone', prof.phone)
        prof.student_id = request.data.get('student_id', prof.student_id)
        prof.department = request.data.get('department', prof.department)
        prof.year = request.data.get('year', prof.year)
        prof.avatar = request.data.get('avatar', prof.avatar)
        prof.save()

    return Response(UserSerializer(user, context={'request': request}).data)


# ---------------- CATEGORIES ----------------

class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionError("Admin only")
        serializer.save()


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]


# ---------------- FOOD ITEMS ----------------

class FoodListCreate(generics.ListCreateAPIView):
    serializer_class = FoodItemSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        qs = FoodItem.objects.all().select_related('category')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        veg = self.request.query_params.get('veg')
        available_only = self.request.query_params.get('available')
        sort_by = self.request.query_params.get('sort')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if category:
            if category.isdigit():
                qs = qs.filter(category_id=category)
            else:
                qs = qs.filter(category__name__iexact=category)

        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search) | Q(category__name__icontains=search))

        if veg == 'true' or veg == '1':
            qs = qs.filter(is_veg=True)
        elif veg == 'false' or veg == '0':
            qs = qs.filter(is_veg=False)

        if available_only == 'true' or available_only == '1':
            qs = qs.filter(is_available=True)

        if min_price:
            try:
                qs = qs.filter(price__gte=Decimal(min_price))
            except Exception:
                pass

        if max_price:
            try:
                qs = qs.filter(price__lte=Decimal(max_price))
            except Exception:
                pass

        if sort_by == 'price_asc':
            qs = qs.order_by('price')
        elif sort_by == 'price_desc':
            qs = qs.order_by('-price')
        elif sort_by == 'rating':
            qs = qs.order_by('-rating')
        elif sort_by == 'popular':
            qs = qs.order_by('-is_popular', '-rating')
        else:
            qs = qs.order_by('-is_special', '-is_popular', '-created_at')

        return qs

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionError("Admin only")
        serializer.save()


class FoodDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_food_availability(request, pk):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        food = FoodItem.objects.get(pk=pk)
        food.is_available = not food.is_available
        food.save()
        return Response(FoodItemSerializer(food, context={'request': request}).data)
    except FoodItem.DoesNotExist:
        return Response({'error': 'Food item not found'}, status=status.HTTP_404_NOT_FOUND)


# ---------------- ORDERS & CHECKOUT ----------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    items = request.data.get('items', [])
    if not items:
        return Response({'error': 'No items in order'}, status=status.HTTP_400_BAD_REQUEST)

    # Customer info
    student_name = request.data.get('student_name', request.user.get_full_name() or request.user.username)
    student_id = request.data.get('student_id', '')
    department = request.data.get('department', '')
    year = request.data.get('year', '')
    phone = request.data.get('phone', '')
    pickup_location = request.data.get('pickup_location', 'Main Canteen Counter 1')
    special_instructions = request.data.get('special_instructions', '')
    payment_method = request.data.get('payment_method', 'counter')
    coupon_code = request.data.get('coupon_code', '').strip().upper()

    # Calculate financials
    subtotal = Decimal('0.00')
    order_items_to_create = []
    max_prep_time = 10

    for it in items:
        try:
            food = FoodItem.objects.get(id=it.get('food_item') or it.get('id'))
        except FoodItem.DoesNotExist:
            continue
        
        if not food.is_available:
            return Response({'error': f"'{food.name}' is currently out of stock."}, status=status.HTTP_400_BAD_REQUEST)

        qty = max(1, int(it.get('quantity', 1)))
        subtotal += food.price * qty
        max_prep_time = max(max_prep_time, food.preparation_time)
        order_items_to_create.append((food, qty, food.price))

    if not order_items_to_create:
        return Response({'error': 'No valid items found in order.'}, status=status.HTTP_400_BAD_REQUEST)

    # Coupon discount
    discount_amount = Decimal('0.00')
    if coupon_code:
        try:
            coupon = Coupon.objects.get(code=coupon_code, is_active=True)
            if subtotal >= coupon.min_order:
                disc = (subtotal * Decimal(coupon.discount_percent)) / Decimal('100.00')
                discount_amount = min(disc, coupon.max_discount)
        except Coupon.DoesNotExist:
            coupon_code = ''

    # GST 5% standard canteen tax
    tax_amount = ((subtotal - discount_amount) * Decimal('0.05')).quantize(Decimal('0.01'))
    total_amount = (subtotal - discount_amount + tax_amount).quantize(Decimal('0.01'))

    # Payment status
    payment_status = 'paid' if payment_method in ['upi', 'wallet'] else 'pending'

    order = Order.objects.create(
        user=request.user,
        status='placed',
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
        coupon_code=coupon_code or None,
        student_name=student_name,
        student_id=student_id,
        department=department,
        year=year,
        phone=phone,
        pickup_location=pickup_location,
        special_instructions=special_instructions,
        payment_method=payment_method,
        payment_status=payment_status,
        estimated_prep_time=max_prep_time
    )

    for food, qty, price in order_items_to_create:
        OrderItem.objects.create(order=order, food_item=food, quantity=qty, price=price)
        # decrease inventory stock
        if food.stock_quantity > 0:
            food.stock_quantity = max(0, food.stock_quantity - qty)
            if food.stock_quantity == 0:
                food.is_available = False
            food.save()

    # Create initial notification
    Notification.objects.create(
        user=request.user,
        title=f"Order Placed #{order.order_id}",
        message=f"Your order with Token #{order.token_number} is received! Estimated prep time: {order.estimated_prep_time} mins.",
        notification_type='order',
        order=order
    )

    return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return Response(OrderSerializer(orders, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    try:
        if request.user.is_staff:
            order = Order.objects.get(Q(pk=pk) | Q(order_id=str(pk)))
        else:
            order = Order.objects.get(Q(pk=pk) | Q(order_id=str(pk)), user=request.user)
        return Response(OrderSerializer(order, context={'request': request}).data)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_orders(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    qs = Order.objects.all().order_by('-created_at')
    status_filter = request.query_params.get('status')
    search = request.query_params.get('search')
    date_filter = request.query_params.get('date')

    if status_filter:
        qs = qs.filter(status=status_filter)
    if search:
        qs = qs.filter(
            Q(order_id__icontains=search) |
            Q(token_number__icontains=search) |
            Q(student_name__icontains=search) |
            Q(student_id__icontains=search) |
            Q(user__username__icontains=search)
        )
    if date_filter == 'today':
        qs = qs.filter(created_at__date=timezone.now().date())

    return Response(OrderSerializer(qs, many=True, context={'request': request}).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_status(request, pk):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status', order.status)
    payment_status = request.data.get('payment_status', order.payment_status)

    old_status = order.status
    order.status = new_status
    order.payment_status = payment_status
    order.save()

    # Generate customer alert on status advancement
    if new_status != old_status:
        status_titles = {
            'confirmed': ("Order Confirmed! 🔵", "The kitchen has accepted your order and added it to the queue."),
            'preparing': ("Preparing in Kitchen 🟠", "Your food is on the flame! Fresh and hot preparations are underway."),
            'ready': ("Ready for Pickup! 🟣", f"Please collect your food at {order.pickup_location} using Token #{order.token_number}!"),
            'completed': ("Order Completed 🟢", "Thank you for dining with us! Hope you enjoyed your meal."),
            'cancelled': ("Order Cancelled ❌", "Your order was cancelled. Please check with the canteen counter."),
        }
        title, msg = status_titles.get(new_status, (f"Order status updated: {new_status}", f"Order #{order.order_id} is now {new_status}"))
        Notification.objects.create(
            user=order.user,
            title=title,
            message=msg,
            notification_type='order',
            order=order
        )

    return Response(OrderSerializer(order, context={'request': request}).data)


# ---------------- REVIEWS & RATINGS ----------------

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def food_reviews(request, food_id):
    try:
        food = FoodItem.objects.get(pk=food_id)
    except FoodItem.DoesNotExist:
        return Response({'error': 'Food item not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        reviews = Review.objects.filter(food_item=food).order_by('-created_at')
        return Response(ReviewSerializer(reviews, many=True).data)

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required to review'}, status=status.HTTP_401_UNAUTHORIZED)
        
        rating = int(request.data.get('rating', 5))
        comment = request.data.get('comment', '').strip()
        if not comment:
            return Response({'error': 'Comment cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        review, created = Review.objects.update_or_create(
            user=request.user,
            food_item=food,
            defaults={'rating': rating, 'comment': comment}
        )

        # Recalculate average rating
        stats = Review.objects.filter(food_item=food).aggregate(avg=Avg('rating'), count=Count('id'))
        food.rating = round(Decimal(str(stats['avg'] or 5.0)), 1)
        food.rating_count = stats['count'] or 1
        food.save()

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, pk):
    try:
        review = Review.objects.get(pk=pk)
        if review.user != request.user and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        food = review.food_item
        review.delete()

        # Recalculate average
        stats = Review.objects.filter(food_item=food).aggregate(avg=Avg('rating'), count=Count('id'))
        food.rating = round(Decimal(str(stats['avg'] or 4.5)), 1)
        food.rating_count = max(1, stats['count'] or 1)
        food.save()

        return Response({'message': 'Review deleted'})
    except Review.DoesNotExist:
        return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)


# ---------------- COUPONS & OFFERS ----------------

@api_view(['GET'])
@permission_classes([AllowAny])
def list_coupons(request):
    coupons = Coupon.objects.filter(is_active=True)
    return Response(CouponSerializer(coupons, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_coupon(request):
    code = request.data.get('code', '').strip().upper()
    subtotal = Decimal(str(request.data.get('subtotal', 0)))

    try:
        coupon = Coupon.objects.get(code=code, is_active=True)
        if subtotal < coupon.min_order:
            return Response({
                'valid': False,
                'error': f"Minimum order of ₹{coupon.min_order} required for coupon '{code}'."
            }, status=status.HTTP_400_BAD_REQUEST)

        discount = (subtotal * Decimal(coupon.discount_percent) / Decimal('100.00')).quantize(Decimal('0.01'))
        discount = min(discount, coupon.max_discount)

        return Response({
            'valid': True,
            'code': coupon.code,
            'discount_percent': coupon.discount_percent,
            'discount_amount': float(discount),
            'message': f"Coupon applied! You saved ₹{discount}"
        })
    except Coupon.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'Invalid or expired coupon code'
        }, status=status.HTTP_404_NOT_FOUND)


# ---------------- NOTIFICATIONS ----------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:25]
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({
        'notifications': NotificationSerializer(notifs, many=True).data,
        'unread_count': unread_count
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, user=request.user)
        notif.is_read = True
        notif.save()
        return Response({'success': True})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'success': True})


# ---------------- FAVORITES / WISHLIST ----------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_favorites(request):
    favs = Favorite.objects.filter(user=request.user).select_related('food_item')
    return Response(FavoriteSerializer(favs, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, food_id):
    try:
        food = FoodItem.objects.get(pk=food_id)
        fav, created = Favorite.objects.get_or_create(user=request.user, food_item=food)
        if not created:
            fav.delete()
            return Response({'favorited': False, 'message': 'Removed from favorites'})
        return Response({'favorited': True, 'message': 'Added to favorites'})
    except FoodItem.DoesNotExist:
        return Response({'error': 'Food item not found'}, status=status.HTTP_404_NOT_FOUND)


# ---------------- ADMIN ANALYTICS & DASHBOARD ----------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    now = timezone.now()
    today = now.date()

    all_orders = Order.objects.all()
    today_orders = all_orders.filter(created_at__date=today)

    total_revenue = all_orders.exclude(status='cancelled').aggregate(s=Sum('total_amount'))['s'] or Decimal('0.00')
    today_revenue = today_orders.exclude(status='cancelled').aggregate(s=Sum('total_amount'))['s'] or Decimal('0.00')

    total_orders_count = all_orders.count()
    today_orders_count = today_orders.count()
    pending_orders_count = all_orders.filter(status__in=['placed', 'confirmed', 'preparing']).count()
    ready_orders_count = all_orders.filter(status='ready').count()
    completed_orders_count = all_orders.filter(status='completed').count()

    total_customers = User.objects.filter(is_staff=False).count()
    total_products = FoodItem.objects.count()
    low_stock_items = FoodItem.objects.filter(stock_quantity__lte=10, is_available=True).count()

    # Top selling food items
    top_items = (
        OrderItem.objects.values('food_item__name')
        .annotate(total_qty=Sum('quantity'), total_sales=Sum('price'))
        .order_by('-total_qty')[:5]
    )

    # Category-wise sales
    category_sales = (
        OrderItem.objects.values('food_item__category__name')
        .annotate(total_qty=Sum('quantity'), total_revenue=Sum('price'))
        .order_by('-total_qty')[:6]
    )

    # Order status breakdown
    status_breakdown = dict(all_orders.values_list('status').annotate(c=Count('id')))

    return Response({
        'kpis': {
            'total_revenue': float(total_revenue),
            'today_revenue': float(today_revenue),
            'total_orders': total_orders_count,
            'today_orders': today_orders_count,
            'pending_orders': pending_orders_count,
            'ready_orders': ready_orders_count,
            'completed_orders': completed_orders_count,
            'total_customers': total_customers,
            'total_products': total_products,
            'low_stock_items': low_stock_items,
        },
        'top_items': list(top_items),
        'category_sales': list(category_sales),
        'status_breakdown': status_breakdown
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_customers_list(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    students = User.objects.filter(is_staff=False).select_related('profile')
    data = []
    for s in students:
        orders = Order.objects.filter(user=s)
        total_spent = orders.exclude(status='cancelled').aggregate(s=Sum('total_amount'))['s'] or 0
        prof = getattr(s, 'profile', None)
        data.append({
            'id': s.id,
            'name': s.get_full_name() or s.username,
            'username': s.username,
            'email': s.email,
            'phone': prof.phone if prof else '',
            'student_id': prof.student_id if prof else '',
            'department': prof.department if prof else '',
            'year': prof.year if prof else '',
            'orders_count': orders.count(),
            'total_spent': float(total_spent),
            'joined_date': s.date_joined.strftime('%Y-%m-%d')
        })

    return Response(data)


# ---------------- SEED REALISTIC DEMO DATA ----------------

@api_view(['POST'])
@permission_classes([AllowAny])
def seed_demo_data(request):
    """Seed sample categories, dishes, admin and student user, and active coupons."""
    # Create Admin user if doesn't exist & ensure credentials
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@canteen.edu', 'first_name': 'Canteen', 'last_name': 'Manager', 'is_staff': True, 'is_superuser': True}
    )
    admin_user.set_password('admin123')
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    p_admin, _ = UserProfile.objects.get_or_create(user=admin_user)
    p_admin.is_admin = True
    p_admin.department = 'Hospitality'
    p_admin.save()

    # Create Mani Chandu user (Admin / Superuser) & ensure credentials
    mani_user, _ = User.objects.get_or_create(
        username='manichandu',
        defaults={'email': 'maddelamanichandu@gmail.com', 'first_name': 'Mani', 'last_name': 'Chandu', 'is_staff': True, 'is_superuser': True}
    )
    mani_user.set_password('maddelamani')
    mani_user.is_staff = True
    mani_user.is_superuser = True
    mani_user.save()
    p_mani, _ = UserProfile.objects.get_or_create(user=mani_user)
    p_mani.is_admin = True
    p_mani.student_id = 'MC2026-001'
    p_mani.department = 'Management & Engineering'
    p_mani.phone = '9876543210'
    p_mani.save()

    # Create demo student & ensure credentials
    student_user, _ = User.objects.get_or_create(
        username='student',
        defaults={'email': 'rahul.sharma@college.edu', 'first_name': 'Rahul', 'last_name': 'Sharma', 'is_staff': False}
    )
    student_user.set_password('student123')
    student_user.is_staff = False
    student_user.save()
    p_student, _ = UserProfile.objects.get_or_create(user=student_user)
    p_student.student_id = 'CS2026-042'
    p_student.department = 'Computer Science & Engg'
    p_student.year = 'Final Year (4th)'
    p_student.phone = '9876543210'
    p_student.save()

    # Categories
    categories_data = [
        {'name': 'Breakfast', 'icon': '🥞', 'image_url': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500'},
        {'name': 'Lunch & Meals', 'icon': '🍱', 'image_url': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500'},
        {'name': 'Biryani & Rice', 'icon': '🍚', 'image_url': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'},
        {'name': 'Snacks & Chaat', 'icon': '🥟', 'image_url': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500'},
        {'name': 'Fast Food', 'icon': '🍔', 'image_url': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500'},
        {'name': 'Beverages', 'icon': '🧋', 'image_url': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500'},
        {'name': 'Desserts', 'icon': '🍨', 'image_url': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500'},
    ]

    cat_objs = {}
    for c in categories_data:
        obj, _ = Category.objects.get_or_create(name=c['name'], defaults=c)
        cat_objs[c['name']] = obj

    # Sample Food Items
    foods_data = [
        # Breakfast
        {
            'category': cat_objs['Breakfast'],
            'name': 'Crispy Masala Dosa',
            'description': 'Golden brown crispy rice crepe stuffed with spiced potato masala, served with 2 chutneys & sambar.',
            'price': Decimal('50.00'),
            'original_price': Decimal('60.00'),
            'image_url': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': True,
            'rating': Decimal('4.8'),
            'preparation_time': 10,
            'stock_quantity': 45
        },
        {
            'category': cat_objs['Breakfast'],
            'name': 'Steamed Idli Sambar (3 Pcs)',
            'description': 'Fluffy steamed rice-lentil cakes immersed in piping hot aromatic vegetable sambar and fresh coconut chutney.',
            'price': Decimal('40.00'),
            'original_price': Decimal('45.00'),
            'image_url': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': False,
            'rating': Decimal('4.6'),
            'preparation_time': 5,
            'stock_quantity': 50
        },
        {
            'category': cat_objs['Breakfast'],
            'name': 'Chole Bhature Combo',
            'description': 'Two large puffed golden bhaturas served with spicy Punjabi chickpea masala, pickle and pickled onions.',
            'price': Decimal('75.00'),
            'original_price': Decimal('85.00'),
            'image_url': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': True,
            'rating': Decimal('4.9'),
            'preparation_time': 12,
            'stock_quantity': 35
        },

        # Biryani & Rice
        {
            'category': cat_objs['Biryani & Rice'],
            'name': 'Hyderabadi Chicken Dum Biryani',
            'description': 'Fragrant basmati rice layered with succulent marinated chicken, saffron, caramelised onions & mirchi ka salan.',
            'price': Decimal('140.00'),
            'original_price': Decimal('160.00'),
            'image_url': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
            'is_veg': False,
            'is_popular': True,
            'is_special': True,
            'rating': Decimal('4.9'),
            'preparation_time': 15,
            'stock_quantity': 60
        },
        {
            'category': cat_objs['Biryani & Rice'],
            'name': 'Shahi Paneer Dum Biryani',
            'description': 'Spiced long grain aromatic basmati infused with tender cottage cheese cubes, rich saffron, raita & gravy.',
            'price': Decimal('110.00'),
            'original_price': Decimal('130.00'),
            'image_url': 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': False,
            'rating': Decimal('4.7'),
            'preparation_time': 12,
            'stock_quantity': 40
        },

        # Lunch & Meals
        {
            'category': cat_objs['Lunch & Meals'],
            'name': 'Campus Executive Thali',
            'description': 'Complete balanced meal: Paneer curry, Dal Tadka, 2 rotis, Jeera rice, salad, pickle, papad and sweet.',
            'price': Decimal('90.00'),
            'original_price': Decimal('100.00'),
            'image_url': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': True,
            'rating': Decimal('4.8'),
            'preparation_time': 8,
            'stock_quantity': 50
        },
        {
            'category': cat_objs['Lunch & Meals'],
            'name': 'Rajma Chawal Bowl',
            'description': 'Slow-cooked Punjabi red kidney beans in rich spiced tomato-onion gravy poured over steaming basmati rice.',
            'price': Decimal('65.00'),
            'original_price': Decimal('75.00'),
            'image_url': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
            'is_veg': True,
            'is_popular': False,
            'is_special': False,
            'rating': Decimal('4.6'),
            'preparation_time': 7,
            'stock_quantity': 30
        },

        # Fast Food
        {
            'category': cat_objs['Fast Food'],
            'name': 'Crispy Veg Supreme Burger',
            'description': 'Crunchy herb potato-peas patty topped with crisp lettuce, sliced tomato, cheese slice and creamy tandoori mayo.',
            'price': Decimal('60.00'),
            'original_price': Decimal('70.00'),
            'image_url': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': False,
            'rating': Decimal('4.5'),
            'preparation_time': 10,
            'stock_quantity': 40
        },
        {
            'category': cat_objs['Fast Food'],
            'name': 'Spicy Peri Peri Grilled Sandwich',
            'description': 'Triple layer grilled sandwich with peri peri vegetables, melted mozzarella cheese, served with mint mayo.',
            'price': Decimal('55.00'),
            'original_price': Decimal('65.00'),
            'image_url': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': False,
            'rating': Decimal('4.7'),
            'preparation_time': 8,
            'stock_quantity': 35
        },
        {
            'category': cat_objs['Fast Food'],
            'name': 'Crispy Chicken Wrap / Roll',
            'description': 'Flaky paratha rolled with tender seasoned spiced chicken tikka strips, crunchy onion rings and garlic mayo.',
            'price': Decimal('85.00'),
            'original_price': Decimal('95.00'),
            'image_url': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600',
            'is_veg': False,
            'is_popular': True,
            'is_special': True,
            'rating': Decimal('4.8'),
            'preparation_time': 10,
            'stock_quantity': 30
        },

        # Snacks & Chaat
        {
            'category': cat_objs['Snacks & Chaat'],
            'name': 'Mumbai Vada Pav (2 Pcs)',
            'description': 'Crispy golden spiced potato fritter batata vada stuffed in soft pav buns with garlic dry red chutney & fried chillies.',
            'price': Decimal('35.00'),
            'original_price': Decimal('40.00'),
            'image_url': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': False,
            'rating': Decimal('4.9'),
            'preparation_time': 5,
            'stock_quantity': 80
        },
        {
            'category': cat_objs['Snacks & Chaat'],
            'name': 'Paneer Steamed Momos (6 Pcs)',
            'description': 'Delicate steamed dumplings stuffed with cottage cheese and herbs, served with fiery schezwan garlic chutney.',
            'price': Decimal('50.00'),
            'original_price': Decimal('60.00'),
            'image_url': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': False,
            'rating': Decimal('4.6'),
            'preparation_time': 10,
            'stock_quantity': 40
        },
        {
            'category': cat_objs['Snacks & Chaat'],
            'name': 'Crispy Samosa Chaat',
            'description': 'Crushed hot Punjabi samosas dressed with warm spicy chole, sweetened yogurt, tamarind chutney & nylon sev.',
            'price': Decimal('45.00'),
            'original_price': Decimal('50.00'),
            'image_url': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
            'is_veg': True,
            'is_popular': False,
            'is_special': False,
            'rating': Decimal('4.7'),
            'preparation_time': 6,
            'stock_quantity': 50
        },

        # Beverages
        {
            'category': cat_objs['Beverages'],
            'name': 'Thick Cold Coffee with Chocolate',
            'description': 'Blended artisanal coffee with full cream milk, vanilla ice-cream scoop and decadent chocolate drizzle.',
            'price': Decimal('45.00'),
            'original_price': Decimal('55.00'),
            'image_url': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': True,
            'rating': Decimal('4.9'),
            'preparation_time': 5,
            'stock_quantity': 60
        },
        {
            'category': cat_objs['Beverages'],
            'name': 'Masala Cutting Chai (Kullad)',
            'description': 'Kadak freshly brewed tea with crushed ginger, cardamom, clove and fresh milk in authentic earthen kullad.',
            'price': Decimal('15.00'),
            'original_price': Decimal('20.00'),
            'image_url': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': False,
            'rating': Decimal('4.8'),
            'preparation_time': 3,
            'stock_quantity': 100
        },
        {
            'category': cat_objs['Beverages'],
            'name': 'Fresh Mango Lassi',
            'description': 'Rich blended yogurt drink flavoured with sweet Alphonso mango pulp, saffron strands and chopped pistachios.',
            'price': Decimal('40.00'),
            'original_price': Decimal('50.00'),
            'image_url': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600',
            'is_veg': True,
            'is_popular': False,
            'is_special': False,
            'rating': Decimal('4.7'),
            'preparation_time': 4,
            'stock_quantity': 40
        },

        # Desserts
        {
            'category': cat_objs['Desserts'],
            'name': 'Hot Gulab Jamun (2 Pcs)',
            'description': 'Soft melt-in-mouth milk solid spheres dipped in rose and green cardamom infused warm sugar syrup.',
            'price': Decimal('30.00'),
            'original_price': Decimal('35.00'),
            'image_url': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': False,
            'rating': Decimal('4.8'),
            'preparation_time': 3,
            'stock_quantity': 50
        },
        {
            'category': cat_objs['Desserts'],
            'name': 'Chocolate Brownie with Fudge',
            'description': 'Warm gooey dark chocolate brownie served with hot chocolate fudge sauce and walnut crumbs.',
            'price': Decimal('60.00'),
            'original_price': Decimal('70.00'),
            'image_url': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
            'is_veg': True,
            'is_popular': True,
            'is_special': True,
            'rating': Decimal('4.9'),
            'preparation_time': 5,
            'stock_quantity': 35
        },
    ]

    for item_data in foods_data:
        try:
            food_item = FoodItem.objects.filter(
                name=item_data['name'],
                category=item_data['category']
            ).first()
            if food_item:
                for k, v in item_data.items():
                    setattr(food_item, k, v)
                food_item.save()
            else:
                FoodItem.objects.create(**item_data)
        except Exception:
            pass

    # Active Coupons
    coupons_list = [
        {'code': 'WELCOME10', 'description': '10% off for all new student orders', 'discount_percent': 10, 'min_order': Decimal('50.00'), 'max_discount': Decimal('50.00')},
        {'code': 'CAMPUS20', 'description': '20% off on orders above ₹150 for campus clubs', 'discount_percent': 20, 'min_order': Decimal('150.00'), 'max_discount': Decimal('100.00')},
        {'code': 'FESTIVAL50', 'description': 'Special 25% off festival offer on group treats', 'discount_percent': 25, 'min_order': Decimal('200.00'), 'max_discount': Decimal('120.00')},
    ]

    for c in coupons_list:
        try:
            coupon = Coupon.objects.filter(code=c['code']).first()
            if coupon:
                for k, v in c.items():
                    setattr(coupon, k, v)
                coupon.save()
            else:
                Coupon.objects.create(**c)
        except Exception:
            pass

    return Response({
        'status': 'success',
        'message': 'Demo data seeded successfully!',
        'categories_created': len(categories_data),
        'foods_created': len(foods_data),
        'user_credentials': {'username': 'manichandu', 'password': 'maddelamani', 'role': 'Admin / Superuser'},
        'admin_credentials': {'username': 'admin', 'password': 'admin123'},
        'student_credentials': {'username': 'student', 'password': 'student123'}
    })
