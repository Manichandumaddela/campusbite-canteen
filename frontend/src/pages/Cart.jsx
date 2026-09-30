import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  Printer,
  CheckCircle2,
  QrCode,
  Building,
  User,
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import UPIPaymentModal from '../components/UPIPaymentModal';
import { sound } from '../utils/sound';

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQty,
    clearCart,
    subtotal,
    discount,
    tax,
    grandTotal,
    coupon,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [studentName, setStudentName] = useState(user?.get_full_name || user?.username || '');
  const [studentId, setStudentId] = useState(user?.profile?.student_id || '');
  const [department, setDepartment] = useState(user?.profile?.department || 'Computer Science & Engg');
  const [year, setYear] = useState(user?.profile?.year || 'Final Year (4th)');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [pickupLocation, setPickupLocation] = useState('Main Canteen Counter 1 (Meals & Thali)');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('counter'); // 'counter', 'upi', 'wallet'

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Checkout states
  const [loading, setLoading] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [priceBump, setPriceBump] = useState(false);

  useEffect(() => {
    setPriceBump(true);
    const t = setTimeout(() => setPriceBump(false), 400);
    return () => clearTimeout(t);
  }, [grandTotal]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    try {
      const data = await applyCouponCode(couponInput.trim().toUpperCase());
      setCouponSuccess(data.message || `Saved ₹${data.discount_amount}!`);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      return navigate('/login');
    }
    if (cart.length === 0) return;

    if (!studentName.trim() || !phone.trim()) {
      alert('Please fill in your Student Name and Phone Number for canteen order verification.');
      return;
    }

    if (paymentMethod === 'upi') {
      setShowUpiModal(true);
    } else {
      executeOrderPlacement('pending');
    }
  };

  const executeOrderPlacement = async (paymentStatus = 'pending') => {
    setLoading(true);
    try {
      const itemsPayload = cart.map((i) => ({
        food_item: i.id,
        quantity: i.quantity,
      }));

      const payload = {
        items: itemsPayload,
        student_name: studentName,
        student_id: studentId,
        department,
        year,
        phone,
        pickup_location: pickupLocation,
        special_instructions: specialInstructions,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        coupon_code: coupon ? coupon.code : '',
      };

      const res = await API.post('/orders/create/', payload);
      sound.playOrderPlaced();
      clearCart();
      setShowUpiModal(false);
      setPlacedOrder(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  // SUCCESS CONFIRMATION SCREEN
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-16 animate-fade-up">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 text-white text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-2.5 shadow-inner animate-bounce">
              ✓
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Order Placed Successfully!</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">Your order has been transmitted directly to the kitchen queue.</p>
          </div>

          <div className="p-4 sm:p-10 space-y-5 sm:space-y-6">
            {/* Digital Token Slip */}
            <div className="border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center relative overflow-hidden shadow-inner">
              <span className="text-[10px] xs:text-xs uppercase font-extrabold text-orange-600 tracking-widest bg-orange-100 px-3 py-1 rounded-full inline-block">
                Digital Canteen Token
              </span>
              
              <div className="text-5xl xs:text-6xl sm:text-7xl font-black text-orange-600 tracking-wider my-2.5 sm:my-3 font-mono">
                #{placedOrder.token_number}
              </div>

              <p className="text-xs sm:text-sm font-bold text-gray-800 break-words">
                Order ID: <span className="font-mono text-orange-700">{placedOrder.order_id}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Pickup Point: <strong className="text-gray-700">{placedOrder.pickup_location}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Estimated Prep Time: <strong className="text-emerald-600">~{placedOrder.estimated_prep_time || 15} minutes</strong>
              </p>
            </div>

            {/* Order Summary details */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-2 text-xs sm:text-sm text-gray-600">
              <div className="flex justify-between font-bold text-gray-800 border-b border-gray-200 pb-2 mb-2">
                <span>Item</span>
                <span>Qty & Price</span>
              </div>
              {placedOrder.items?.map((it) => (
                <div key={it.id} className="flex justify-between gap-2">
                  <span className="truncate">{it.food_name} x {it.quantity}</span>
                  <span className="font-semibold text-gray-900 shrink-0">₹{(parseFloat(it.price) * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm sm:text-base text-gray-900">
                <span>Total Paid / Due</span>
                <span className="text-orange-600">₹{parseFloat(placedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/my-orders')}
                className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 min-h-[44px] rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                Track Live Status →
              </button>

              <button
                onClick={handlePrintSlip}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3.5 min-h-[44px] rounded-2xl transition flex items-center justify-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4" /> Print Token Slip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART SCREEN WITH ANIMATED STEAM & ILLUSTRATION
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center animate-fade-up">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-gray-100/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] space-y-5 relative overflow-hidden">
          <div className="relative inline-block mx-auto mb-2">
            <div className="text-6xl sm:text-7xl animate-float">🥣</div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-orange-400 text-sm animate-steam">
              ♨️
            </div>
            <div className="w-16 h-3 bg-gray-200/60 rounded-full mx-auto mt-2 blur-xs" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Your Canteen Cart is Empty</h2>
          <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Hungry between lectures? Browse our fresh South Indian dosas, chicken biryani, burgers, and iced cold beverages!
          </p>
          <div className="pt-4">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold px-8 py-4 min-h-[48px] rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition transform active:scale-95 text-sm group"
            >
              <span>Explore Delicious Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 lg:pb-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Review Cart & Checkout 🛒
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Review your items, apply student discount coupons, and confirm order details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Cart Items & Customer Info Form */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          {/* Cart Items List */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Your Food Items ({cart.length})
              </h2>
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 font-semibold p-1"
              >
                Clear Cart
              </button>
            </div>

            <div className="p-4 sm:p-6 divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="py-3.5 sm:py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-200 hover:bg-orange-50/30 p-2 rounded-2xl">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                      alt={item.name}
                      className="w-14 h-14 xs:w-16 xs:h-16 rounded-2xl object-cover border border-gray-100 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-3.5 h-3.5 border-2 rounded-xs flex items-center justify-center shrink-0 ${
                              item.is_veg ? 'border-green-600' : 'border-red-600'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug truncate">
                            {item.name}
                          </h4>
                        </div>
                        {/* Mobile remove button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="sm:hidden p-2 text-gray-400 hover:text-red-500 rounded-lg active:scale-90 transition-transform"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-orange-600 font-bold mt-0.5">₹{item.price} each</p>
                    </div>
                  </div>

                  {/* Quantity and Line Total with Tactile Scale */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-17 sm:pl-0">
                    <div className="flex items-center bg-gray-50 border border-gray-200/80 rounded-xl p-1 shadow-2xs">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-white rounded-lg transition active:scale-75 shadow-xs"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-black text-sm text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition active:scale-75 shadow-xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-black text-gray-900 text-sm sm:text-base sm:w-20 text-right font-mono">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Desktop remove button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="hidden sm:block p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition active:scale-90"
                      title="Remove dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Checkout Form */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-4 sm:p-8 space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Student & Pickup Details
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Required for canteen order token generation and verification at the counter.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-[11px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Student ID / Roll No
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS2026-042"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-white cursor-pointer"
                >
                  <option value="Computer Science & Engg">Computer Science & Engg</option>
                  <option value="Electronics & Comm Engg">Electronics & Comm Engg</option>
                  <option value="Mechanical Engg">Mechanical Engg</option>
                  <option value="Civil Engg">Civil Engg</option>
                  <option value="Management Studies">Management Studies</option>
                  <option value="Faculty / Staff">Faculty / Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Canteen Pickup Location
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:border-orange-500 focus:bg-white cursor-pointer"
                >
                  <option value="Main Canteen Counter 1 (Meals & Thali)">
                    Main Canteen Counter 1 (Meals & Thali)
                  </option>
                  <option value="Canteen Counter 2 (Fast Food & Snacks)">
                    Canteen Counter 2 (Fast Food & Snacks)
                  </option>
                  <option value="Counter 3 (Beverages & Fresh Juice Desk)">
                    Counter 3 (Beverages & Fresh Juice Desk)
                  </option>
                  <option value="Library Cafeteria Kiosk Desk">
                    Library Cafeteria Kiosk Desk
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Special Cooking Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy, less oil, no onion, hot sambar..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary, Coupon & Payment Mode */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6 lg:sticky lg:top-24">
          
          {/* Coupon Code Box */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-4 sm:p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-500" />
              Apply Student Coupon Code
            </h3>

            {coupon ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-emerald-800 text-sm">{coupon.code}</span>
                  <p className="text-xs text-emerald-600">Saved ₹{discount.toFixed(2)} with this promo!</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 min-h-[40px] flex items-center"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try: WELCOME10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3.5 sm:px-4 py-2.5 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 min-h-[44px] rounded-xl text-xs transition shrink-0"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-xs text-red-500 font-medium mt-2">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-emerald-600 font-medium mt-2">{couponSuccess}</p>}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-4 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              Select Payment Method
            </h3>

            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod('counter')}
                className={`p-3.5 min-h-[52px] rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'counter'
                    ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-bold'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'counter'}
                  onChange={() => setPaymentMethod('counter')}
                  className="accent-orange-500 w-4 h-4 shrink-0"
                />
                <div>
                  <p className="text-xs sm:text-sm">Pay at Canteen Counter</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-normal">Cash or Card at pickup time</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('upi')}
                className={`p-3.5 min-h-[52px] rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'upi'
                    ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-bold'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="accent-orange-500 w-4 h-4 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm">Instant UPI / QR Code</p>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold">Fast</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-normal">GPay, PhonePe, Paytm QR scanner</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3.5 min-h-[52px] rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'wallet'
                    ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-bold'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                  className="accent-orange-500 w-4 h-4 shrink-0"
                />
                <div>
                  <p className="text-xs sm:text-sm">Campus Smart Wallet</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-normal">Linked college student ID card balance</p>
                </div>
              </label>
            </div>
          </div>

          {/* Financial Breakdown & Place Order CTA */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-4 sm:p-6 space-y-4">
            <h3 className="text-sm sm:text-base font-black text-gray-900 border-b border-gray-100 pb-3">
              Order Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- ₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs">
                <span>Canteen GST (5%)</span>
                <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span>Token Handling Fee</span>
                <span className="font-bold text-emerald-600 uppercase">FREE</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-sm sm:text-base font-extrabold text-gray-900">Final Payable Amount</span>
              <span className={`text-xl sm:text-2xl font-black text-orange-600 font-mono transition-transform ${priceBump ? 'animate-price-bump scale-110' : ''}`}>
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 min-h-[48px] rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition transform active:scale-95 disabled:bg-orange-300 flex items-center justify-center gap-2 text-sm sm:text-base btn-ripple group"
            >
              {loading ? (
                'Processing Order...'
              ) : (
                <>
                  <span>Place Order • ₹{grandTotal.toFixed(2)}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Campus Canteen Order Guarantee
            </div>
          </div>

        </div>

      </div>

      {/* Sticky Mobile Checkout Bar at Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 animate-slide-up">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)
          </span>
          <span className={`text-lg xs:text-xl font-black text-orange-600 font-mono transition-transform ${priceBump ? 'animate-price-bump scale-110' : ''}`}>
            ₹{grandTotal.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleCheckoutClick}
          disabled={loading}
          className="flex-1 max-w-xs bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3 px-4 min-h-[44px] rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-1.5 text-xs xs:text-sm"
        >
          {loading ? 'Processing...' : 'Place Order Now'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* UPI QR Payment Modal */}
      {showUpiModal && (
        <UPIPaymentModal
          totalAmount={grandTotal}
          onConfirm={() => executeOrderPlacement('paid')}
          onCancel={() => setShowUpiModal(false)}
        />
      )}
    </div>
  );
}
