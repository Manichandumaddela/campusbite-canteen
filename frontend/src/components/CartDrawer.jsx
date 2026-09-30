import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
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
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const navigate = useNavigate();
  const [priceBump, setPriceBump] = useState(false);

  // Trigger price highlight bump when grandTotal changes
  useEffect(() => {
    setPriceBump(true);
    const t = setTimeout(() => setPriceBump(false), 400);
    return () => clearTimeout(t);
  }, [grandTotal]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const totalItemsCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left z-10 border-l border-gray-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-white/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-2">
                Your Canteen Cart
                {totalItemsCount > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-black px-2 py-0.5 rounded-full">
                    {totalItemsCount}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">Quick order preview</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-2.5 py-1.5 rounded-xl transition"
                title="Clear entire cart"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition flex items-center justify-center"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-gray-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="relative">
                <div className="text-6xl animate-bounce">🥣</div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-orange-400 text-xs animate-steam">
                  ♨️
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">Your Cart is Empty</h3>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Add some tasty biryani, crispy dosas, cold coffee, or snacks to start your order!
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/menu');
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-6 py-3 min-h-[44px] rounded-xl shadow-md shadow-orange-500/20 transition transform active:scale-95 flex items-center gap-1.5"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex items-center justify-between gap-3 group animate-in fade-in slide-in-from-right-3 duration-200"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0 relative border border-gray-100">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150';
                    }}
                  />
                  <span
                    className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white ${
                      item.is_veg ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    ₹{item.price} each
                  </p>
                  <p className="text-xs font-black text-gray-900 mt-0.5">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls with Pop Animations */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-orange-50 text-gray-600 hover:text-orange-600 shadow-2xs transition active:scale-80"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 text-center text-xs font-black text-gray-900">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-2xs transition active:scale-80"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Billing & CTA */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/70 shrink-0 space-y-3">
            {/* Promo banner note */}
            {coupon ? (
              <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200/80 font-bold">
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5" />
                  Coupon <span className="font-mono">{coupon.code}</span> applied!
                </span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            ) : (
              <Link
                to="/offers"
                onClick={() => setIsCartDrawerOpen(false)}
                className="flex items-center justify-between text-[11px] text-orange-600 bg-orange-50/80 hover:bg-orange-100/80 px-3 py-1.5 rounded-xl border border-orange-200/60 font-semibold transition"
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Have a student coupon code?
                </span>
                <span className="font-bold flex items-center">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            )}

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Student Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span className="font-semibold text-gray-800">₹{tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200/80 flex justify-between items-baseline font-black text-sm sm:text-base text-gray-900">
                <span>Total Amount</span>
                <span
                  className={`text-lg sm:text-xl font-black text-orange-600 transition-transform ${
                    priceBump ? 'scale-110 text-orange-500' : 'scale-100'
                  }`}
                >
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-1">
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm py-3.5 min-h-[44px] rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition transform active:scale-95 flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct kitchen queue • Instant digital token</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
