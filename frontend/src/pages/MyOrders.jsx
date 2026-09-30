import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Bell,
  Printer,
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { sound } from '../utils/sound';

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '🔵' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready for Pickup', icon: '🔔' },
  { key: 'completed', label: 'Completed', icon: '✅' },
];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' vs 'past'
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const previousStatuses = useRef({});

  const fetchOrders = () => {
    API.get('/orders/my/')
      .then((r) => {
        const list = r.data || [];
        // Check if any order turned 'ready'
        list.forEach((ord) => {
          const oldSt = previousStatuses.current[ord.id];
          if (oldSt && oldSt !== 'ready' && ord.status === 'ready') {
            sound.playOrderReady();
          }
          previousStatuses.current[ord.id] = ord.status;
        });
        setOrders(list);
      })
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter((o) =>
    ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ['completed', 'cancelled'].includes(o.status)
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleReorder = (order) => {
    order.items?.forEach((it) => {
      addToCart({
        id: it.food_item,
        name: it.food_name,
        price: it.price,
        image: it.food_image,
        is_veg: it.is_veg,
      }, it.quantity);
    });
    navigate('/cart');
  };

  const getStepIndex = (status) => {
    const idx = statusSteps.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" /> Real-time Canteen Tracking
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Order Status & History 📦
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor kitchen progress and present your token at the counter.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchOrders();
          }}
          className="bg-white hover:bg-gray-50 border border-gray-200/80 text-gray-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-xs w-fit"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs: Active vs Past Orders */}
      <div className="grid grid-cols-2 xs:flex bg-gray-100 p-1.5 rounded-2xl w-full xs:w-fit gap-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3 xs:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition text-center min-h-[40px] ${
            activeTab === 'active'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-3 xs:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition text-center min-h-[40px] ${
            activeTab === 'past'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-32 rounded-md skeleton-shimmer" />
                <div className="h-10 w-24 rounded-2xl skeleton-shimmer" />
              </div>
              <div className="h-8 w-full rounded-xl skeleton-shimmer" />
              <div className="h-16 w-full rounded-2xl skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-10 animate-fade-up">
          <div className="text-6xl mb-3 animate-float">🧾</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {activeTab === 'active' ? 'No Active Orders Right Now' : 'No Past Orders Recorded'}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">
            {activeTab === 'active'
              ? 'Order your favorite snacks or meals and track their live kitchen preparation.'
              : 'Your previous completed canteen orders will be listed here.'}
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-7 py-3.5 min-h-[44px] rounded-xl shadow-md shadow-orange-500/25 transition active:scale-95"
          >
            Order Food Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);
            const isReady = order.status === 'ready';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md ${
                  isReady ? 'border-purple-300 ring-4 ring-purple-100' : 'border-gray-100'
                }`}
              >
                {/* Order Top Bar: ID, Date, Token */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
                        Order ID
                      </span>
                      <span className="font-mono font-black text-gray-900 text-base sm:text-lg">
                        {order.order_id || `#${order.id}`}
                      </span>
                      <p className="text-[11px] text-gray-400">
                        {new Date(order.created_at).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Token Number Card */}
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-2xl text-center shadow-md shadow-orange-500/20">
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
                        Pickup Token
                      </span>
                      <span className="font-mono font-black text-xl sm:text-2xl leading-none">
                        #{order.token_number}
                      </span>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition hidden sm:block"
                      title="Print Token Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Real-time Order Progress Stepper */}
                {order.status !== 'cancelled' ? (
                  <div className="p-4 sm:p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Kitchen Progress
                      </span>
                      <span
                        className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                          isReady
                            ? 'bg-purple-100 text-purple-700 animate-pulse'
                            : order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {order.status === 'ready' ? '🟣 Ready for Pickup!' : order.status}
                      </span>
                    </div>

                    {/* Mobile Vertical Progress Tracker (< md screens) */}
                    <div className="md:hidden py-2 space-y-0 relative">
                      {statusSteps.map((step, idx) => {
                        const isPassed = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const isLast = idx === statusSteps.length - 1;

                        return (
                          <div key={step.key} className="flex items-start gap-3.5 relative pb-5 last:pb-1">
                            {/* Vertical connecting line */}
                            {!isLast && (
                              <div
                                className={`absolute left-5 top-10 bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-300 ${
                                  idx < currentStepIdx ? 'bg-orange-500' : 'bg-gray-200'
                                }`}
                              />
                            )}

                            {/* Large Status Indicator */}
                            <div
                              className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-base font-bold transition-all relative z-10 ${
                                isCurrent
                                  ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-105 shadow-md shadow-orange-500/30'
                                  : isPassed
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-400 border border-gray-200'
                              }`}
                            >
                              <span>{step.icon}</span>
                            </div>

                            {/* Step Description */}
                            <div className="flex-1 pt-1.5">
                              <div className="flex items-center justify-between">
                                <h4
                                  className={`text-sm font-bold leading-tight ${
                                    isCurrent ? 'text-orange-600' : isPassed ? 'text-gray-900' : 'text-gray-400'
                                  }`}
                                >
                                  {step.label}
                                </h4>
                                {isCurrent && (
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {idx === 0 && 'Order received by canteen server'}
                                {idx === 1 && 'Kitchen confirmed and queued'}
                                {idx === 2 && 'Chef is freshly preparing your meal'}
                                {idx === 3 && 'Order packed and at pickup counter'}
                                {idx === 4 && 'Token collected and fulfilled'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Horizontal Stepper Bar (>= md screens) */}
                    <div className="hidden md:block relative max-w-2xl mx-auto py-4">
                      <div className="relative flex justify-between items-center">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                        <div
                          className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500"
                          style={{
                            width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%`,
                          }}
                        />

                        {statusSteps.map((step, idx) => {
                          const isPassed = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step.key} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-transform ${
                                  isCurrent
                                    ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110 shadow-md'
                                    : isPassed
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                              >
                                <span>{step.icon}</span>
                              </div>
                              <span
                                className={`text-xs font-bold mt-2 text-center whitespace-nowrap ${
                                  isCurrent
                                    ? 'text-orange-600'
                                    : isPassed
                                    ? 'text-gray-800'
                                    : 'text-gray-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {isReady && (
                      <div className="mt-4 sm:mt-6 bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center text-purple-900 font-bold text-xs sm:text-sm">
                        🎉 Please present Token #{order.token_number} at{' '}
                        <strong className="underline">{order.pickup_location || 'Main Counter'}</strong> to collect your food!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 text-red-700 text-xs font-bold text-center">
                    ❌ This order was cancelled. Please check with the canteen counter.
                  </div>
                )}

                {/* Items Summary and Actions */}
                <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                  
                  {/* Items List */}
                  <div className="space-y-2 flex-1 w-full">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Items Ordered
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                      {order.items?.map((it) => (
                        <div key={it.id} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                          <span className="font-semibold text-gray-900 truncate">{it.food_name}</span>
                          <span className="text-xs text-gray-400 shrink-0">×{it.quantity}</span>
                          <span className="text-xs text-gray-500 font-medium shrink-0">
                            (₹{(parseFloat(it.price) * it.quantity).toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.special_instructions && (
                      <p className="text-xs text-gray-500 italic mt-2">
                        Note: "{order.special_instructions}"
                      </p>
                    )}
                  </div>

                  {/* Pricing and Reorder */}
                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Total Amount ({order.payment_method?.toUpperCase()})
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-gray-900">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      className="bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-800 font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center gap-1.5 shadow-xs min-h-[44px]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Reorder</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
