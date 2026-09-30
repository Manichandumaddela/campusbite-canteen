import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  DollarSign,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Download,
  Printer,
  ChevronRight,
  Filter,
  Check,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Menu as MenuIcon,
  ChefHat,
  UtensilsCrossed,
  Layers,
  Package,
  FileBarChart2,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import API from '../api/axios';
import { sound } from '../utils/sound';

const statuses = ['placed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('orders'); // 'orders', 'foods', 'categories', 'inventory', 'customers', 'reports'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data states
  const [kpis, setKpis] = useState({});
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [categorySales, setCategorySales] = useState([]);

  // Filter & Search states
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Forms
  const [foodForm, setFoodForm] = useState({
    name: '',
    price: '',
    original_price: '',
    description: '',
    category: '',
    image_url: '',
    is_veg: true,
    stock_quantity: 50,
    preparation_time: 15,
  });

  const [catForm, setCatForm] = useState({ name: '', icon: '🍽️' });

  const loadData = async () => {
    try {
      const [analyticsRes, ordersRes, foodsRes, catsRes, custRes] = await Promise.all([
        API.get('/admin/analytics/'),
        API.get('/orders/all/'),
        API.get('/foods/'),
        API.get('/categories/'),
        API.get('/admin/customers/'),
      ]);

      setKpis(analyticsRes.data.kpis || {});
      setTopItems(analyticsRes.data.top_items || []);
      setCategorySales(analyticsRes.data.category_sales || []);
      setOrders(ordersRes.data || []);
      setFoods(foodsRes.data || []);
      setCategories(catsRes.data || []);
      setCustomers(custRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Poll every 8s for live kitchen orders
    const interval = setInterval(() => {
      API.get('/orders/all/').then((r) => setOrders(r.data || []));
      API.get('/admin/analytics/').then((r) => setKpis(r.data.kpis || {}));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await API.patch(`/orders/${id}/status/`, { status: newStatus });
      loadData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleToggleFoodStock = async (id) => {
    try {
      await API.patch(`/foods/${id}/toggle-availability/`);
      loadData();
    } catch (e) {
      alert('Failed to toggle stock');
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/foods/', foodForm);
      setFoodForm({
        name: '',
        price: '',
        original_price: '',
        description: '',
        category: '',
        image_url: '',
        is_veg: true,
        stock_quantity: 50,
        preparation_time: 15,
      });
      loadData();
      alert('Food item added successfully!');
    } catch (err) {
      alert('Failed to create food item.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFood = async (id) => {
    if (window.confirm('Are you sure you want to remove this dish from the menu?')) {
      try {
        await API.delete(`/foods/${id}/`);
        loadData();
      } catch (e) {
        alert('Failed to delete item.');
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/categories/', catForm);
      setCatForm({ name: '', icon: '🍽️' });
      loadData();
      alert('Category added successfully!');
    } catch (e) {
      alert('Failed to add category.');
    }
  };

  const exportCSVReport = () => {
    const headers = ['Order ID', 'Token', 'Student Name', 'Student ID', 'Items', 'Total Amount', 'Payment', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o.order_id,
      o.token_number,
      `"${o.student_name || o.username}"`,
      o.student_id || 'N/A',
      `"${o.items?.map((i) => `${i.food_name} x${i.quantity}`).join('; ')}"`,
      o.total_amount,
      o.payment_method,
      o.status,
      new Date(o.created_at).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Canteen_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'all' ? true : o.status === orderFilter;
    const s = orderSearch.toLowerCase();
    const matchesSearch =
      !s ||
      o.order_id?.toLowerCase().includes(s) ||
      o.token_number?.toLowerCase().includes(s) ||
      o.student_name?.toLowerCase().includes(s) ||
      o.student_id?.toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  const navItems = [
    { id: 'orders', label: 'Live Orders', icon: ChefHat, count: orders.length },
    { id: 'foods', label: 'Menu Items', icon: UtensilsCrossed, count: foods.length },
    { id: 'categories', label: 'Categories', icon: Layers, count: categories.length },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'customers', label: 'Students Roster', icon: Users, count: customers.length },
    { id: 'reports', label: 'Sales Analytics', icon: FileBarChart2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* Mobile Top Header with Hamburger */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 text-gray-700 hover:text-orange-600 rounded-xl hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open Admin Menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5 font-black text-gray-900 text-base">
            <span className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-black">
              CB
            </span>
            <span>Admin Console</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/menu"
            className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl flex items-center gap-1 min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Canteen</span>
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Admin Sidebar (Slide-over on Mobile, Sticky on Desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 xl:w-72 shrink-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-xl font-black text-white shadow-md shadow-orange-500/30">
                🍳
              </div>
              <div>
                <h2 className="font-black text-white text-base leading-tight tracking-tight">CampusBite</h2>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                  Canteen Admin
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition min-h-[44px] ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={exportCSVReport}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
          <Link
            to="/menu"
            className="w-full py-2.5 px-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch to Student Menu</span>
          </Link>
        </div>
      </aside>

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
        
        {/* Top Header Banner for Desktop */}
        <div className="hidden lg:flex items-center justify-between pb-6 border-b border-gray-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Canteen Operations Command Center
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Admin Management Console ⚙️
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Live orders, kitchen queue status, menu catalogue, inventory, and revenue analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-xs font-bold transition flex items-center gap-1.5 shadow-xs min-h-[44px]"
              title="Refresh All Data"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={exportCSVReport}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs min-h-[44px]"
            >
              <Download className="w-4 h-4" /> Export CSV Report
            </button>
          </div>
        </div>

        {/* Responsive KPI Cards Row: 1-col on small phones, 2-col on larger phones/tablets, 4-col on desktop */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Today's Revenue */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Today's Revenue</span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                ₹{kpis.today_revenue?.toFixed(2) || '0.00'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block mt-0.5">
                Lifetime: ₹{kpis.total_revenue?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl font-bold shrink-0">
              ₹
            </div>
          </div>

          {/* Kitchen Queue */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Kitchen Queue</span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-orange-600">
                {kpis.pending_orders || 0}
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-semibold block mt-0.5">
                Ready for pickup: <strong>{kpis.ready_orders || 0}</strong>
              </span>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg sm:text-xl shrink-0">
              👨‍🍳
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                {kpis.total_orders || 0}
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-semibold block mt-0.5">
                Today: <strong>{kpis.today_orders || 0}</strong>
              </span>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg sm:text-xl shrink-0">
              📦
            </div>
          </div>

          {/* Active Customers */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider block">Active Customers</span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">
                {kpis.total_customers || 0}
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-semibold block mt-0.5">
                Menu Items: <strong>{kpis.total_products || 0}</strong>
              </span>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg sm:text-xl shrink-0">
              👥
            </div>
          </div>

        </div>

        {/* TAB 1: LIVE ORDERS MANAGEMENT */}
        {tab === 'orders' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Order Search & Status Filter Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 w-full md:w-auto">
                {['all', 'placed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap min-h-[36px] ${
                      orderFilter === st
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search Order ID, Token, Name..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
                />
              </div>
            </div>

            {/* Mobile Order Cards (< md screens) */}
            <div className="md:hidden space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center text-gray-400 text-xs border border-gray-100">
                  No orders matching the current filter.
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white rounded-3xl border border-gray-100 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <div>
                        <span className="font-mono font-bold text-gray-900 text-sm block">
                          {o.order_id || `#${o.id}`}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-orange-100 text-orange-800 font-mono font-black text-xs px-2.5 py-1 rounded-xl">
                          Token #{o.token_number}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            o.status === 'ready'
                              ? 'bg-purple-100 text-purple-700 animate-pulse'
                              : o.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : o.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{o.student_name || o.username}</p>
                        <p className="text-[11px] text-gray-400">{o.student_id || o.department || 'Student'}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-gray-900 text-base block">
                          ₹{parseFloat(o.total_amount).toFixed(2)}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {o.payment_method} • {o.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-2.5 text-xs text-gray-700 space-y-1">
                      {o.items?.map((it) => (
                        <div key={it.id} className="flex justify-between items-center">
                          <span className="truncate pr-2">• {it.food_name}</span>
                          <span className="font-bold shrink-0">×{it.quantity}</span>
                        </div>
                      ))}
                      {o.special_instructions && (
                        <p className="text-[11px] text-orange-600 font-medium italic pt-1 border-t border-gray-200/60 mt-1">
                          Note: {o.special_instructions}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="flex-1 text-xs font-bold bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 min-h-[44px] focus:outline-none focus:border-orange-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            Status: {s.toUpperCase()}
                          </option>
                        ))}
                      </select>

                      {o.status !== 'cancelled' && o.status !== 'completed' && (
                        <button
                          onClick={() => updateOrderStatus(o.id, 'cancelled')}
                          className="text-red-500 hover:text-red-700 p-2.5 hover:bg-red-50 rounded-xl text-xs font-bold border border-red-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Cancel Order"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Orders Table (>= md screens) */}
            <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50/80 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-4">Order ID & Token</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Items Ordered</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4">Current Status</th>
                      <th className="px-5 py-4">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-gray-400 text-sm">
                          No orders matching the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-orange-50/20 transition">
                          <td className="px-5 py-4">
                            <span className="font-mono font-bold text-gray-900 block">
                              {o.order_id || `#${o.id}`}
                            </span>
                            <span className="bg-orange-100 text-orange-800 font-mono font-black text-xs px-2 py-0.5 rounded-md inline-block mt-0.5">
                              Token #{o.token_number}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-1">
                              {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-900 leading-tight">
                              {o.student_name || o.username}
                            </p>
                            <p className="text-xs text-gray-500">{o.student_id || o.department}</p>
                            {o.phone && <p className="text-[11px] text-gray-400">{o.phone}</p>}
                          </td>

                          <td className="px-5 py-4 max-w-xs">
                            <div className="space-y-1 text-xs">
                              {o.items?.map((it) => (
                                <div key={it.id} className="leading-tight">
                                  • {it.food_name} <strong className="text-gray-900">×{it.quantity}</strong>
                                </div>
                              ))}
                            </div>
                            {o.special_instructions && (
                              <p className="text-[11px] text-orange-600 font-medium italic mt-1">
                                Note: {o.special_instructions}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 font-black text-gray-900 text-base">
                            ₹{parseFloat(o.total_amount).toFixed(2)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                o.payment_status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.payment_status}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                              {o.payment_method}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                                o.status === 'ready'
                                  ? 'bg-purple-100 text-purple-700 animate-pulse'
                                  : o.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : o.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={o.status}
                                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                className="text-xs font-bold bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer shadow-xs min-h-[36px]"
                              >
                                {statuses.map((s) => (
                                  <option key={s} value={s}>
                                    {s.toUpperCase()}
                                  </option>
                                ))}
                              </select>

                              {o.status !== 'cancelled' && o.status !== 'completed' && (
                                <button
                                  onClick={() => updateOrderStatus(o.id, 'cancelled')}
                                  className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg text-xs font-bold"
                                  title="Cancel Order"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MENU ITEMS MANAGEMENT */}
        {tab === 'foods' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Add New Product Form */}
            <form
              onSubmit={handleAddFood}
              className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4"
            >
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                Add New Food Dish to Canteen Menu
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masala Dosa, Paneer Wrap..."
                    value={foodForm.name}
                    onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 50"
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Original Price (₹) (Optional Discount)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 60"
                    value={foodForm.original_price}
                    onChange={(e) => setFoodForm({ ...foodForm, original_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Dietary Classification
                  </label>
                  <select
                    value={foodForm.is_veg}
                    onChange={(e) => setFoodForm({ ...foodForm, is_veg: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
                  >
                    <option value="true">Pure Vegetarian (🟢)</option>
                    <option value="false">Non-Vegetarian (🔴)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={foodForm.stock_quantity}
                    onChange={(e) => setFoodForm({ ...foodForm, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={foodForm.image_url}
                    onChange={(e) => setFoodForm({ ...foodForm, image_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    value={foodForm.preparation_time}
                    onChange={(e) => setFoodForm({ ...foodForm, preparation_time: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Description & Ingredients
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Freshly prepared with..."
                    value={foodForm.description}
                    onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition min-h-[44px]"
                >
                  {loading ? 'Adding Dish...' : 'Publish Dish to Menu'}
                </button>
              </div>
            </form>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={food.display_image || food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                      alt={food.name}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm leading-tight truncate">{food.name}</h4>
                      <p className="text-orange-600 font-black text-sm">₹{food.price}</p>
                      <span className="text-[10px] text-gray-400 block truncate">{food.category_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleFoodStock(food.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition min-h-[36px] ${
                        food.is_available && food.stock_quantity > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {food.is_available && food.stock_quantity > 0 ? 'In Stock' : 'Out'}
                    </button>

                    <button
                      onClick={() => handleDeleteFood(food.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {tab === 'categories' && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddCategory}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                required
                placeholder="Category Name (e.g. South Indian, Ice Creams, Pizza)"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 min-h-[44px]"
              />
              <input
                type="text"
                placeholder="Emoji (e.g. 🍕, 🍦, ☕)"
                value={catForm.icon}
                onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                className="w-full sm:w-28 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center min-h-[44px]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition min-h-[44px]"
              >
                Add Category
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs text-center space-y-1"
                >
                  <span className="text-3xl block">{c.icon || '🍽️'}</span>
                  <h4 className="font-bold text-gray-900 text-sm truncate">{c.name}</h4>
                  <p className="text-xs text-gray-400">{c.items_count || 0} active dishes</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY & STOCK */}
        {tab === 'inventory' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 text-base">Low Stock Alerts Management</h3>
                <p className="text-xs text-amber-700 leading-relaxed mt-1">
                  Dishes with fewer than 10 portions remaining in the kitchen are flagged here for priority resupply.
                </p>
              </div>
            </div>

            {/* Mobile View for Inventory (< md screens) */}
            <div className="md:hidden space-y-3">
              {foods.map((f) => (
                <div
                  key={f.id}
                  className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{f.name}</h4>
                    <span className="text-xs text-gray-400 block">{f.category_name} • ₹{f.price}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block mt-1 ${
                        f.stock_quantity <= 10
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {f.stock_quantity} left in kitchen
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleFoodStock(f.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition min-h-[40px] shrink-0 ${
                      f.is_available
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {f.is_available ? 'Set Out' : 'Set Available'}
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md screens) */}
            <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-[11px] font-black uppercase text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Food Item</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock Portions</th>
                    <th className="px-6 py-4">Quick Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {foods.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-gray-900">{f.name}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{f.category_name}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">₹{f.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-md ${
                            f.stock_quantity <= 10
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {f.stock_quantity} left
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleFoodStock(f.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[36px] ${
                            f.is_available
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {f.is_available ? 'Mark Out of Stock' : 'Mark Available'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 5: STUDENTS ROSTER */}
        {tab === 'customers' && (
          <div className="space-y-4">
            {/* Mobile View for Students (< md screens) */}
            <div className="md:hidden space-y-3">
              {customers.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center text-gray-400 text-xs border border-gray-100">
                  No student records found.
                </div>
              ) : (
                customers.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{c.name}</h4>
                        <span className="text-xs text-gray-400">@{c.username}</span>
                      </div>
                      <span className="font-mono font-bold text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                        {c.student_id || 'N/A'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      <p>{c.department || 'General'}</p>
                      <p className="text-[11px] text-gray-400">{c.email} {c.phone && `• ${c.phone}`}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                      <span className="font-bold text-gray-700">{c.orders_count} orders</span>
                      <span className="font-black text-orange-600">₹{c.total_spent?.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (>= md screens) */}
            <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 text-[11px] font-black uppercase text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Roll No & Dept</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Total Orders</th>
                      <th className="px-6 py-4">Lifetime Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-400">
                          No student records found.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900 block">{c.name}</span>
                            <span className="text-xs text-gray-400">@{c.username}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-gray-800 text-xs block">
                              {c.student_id || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">{c.department || 'General'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-600 block">{c.email}</span>
                            <span className="text-xs text-gray-400">{c.phone}</span>
                          </td>
                          <td className="px-6 py-4 font-black text-gray-900">
                            {c.orders_count} orders
                          </td>
                          <td className="px-6 py-4 font-black text-orange-600">
                            ₹{c.total_spent?.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SALES REPORTS & ANALYTICS (RESPONSIVE CHARTS) */}
        {tab === 'reports' && (
          <div className="space-y-6">
            
            {/* Responsive Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Responsive Bar Chart: Top Selling Dishes */}
              <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-gray-900 text-base">Top Selling Dishes</h3>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Volume Ranking
                  </span>
                </div>

                {topItems.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No order data recorded yet.</p>
                ) : (
                  <div className="space-y-3.5 pt-2">
                    {(() => {
                      const maxQty = Math.max(...topItems.map((i) => i.total_qty || 1), 1);
                      return topItems.map((item, idx) => {
                        const pct = Math.round((item.total_qty / maxQty) * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-800 truncate max-w-[200px]">
                                {idx + 1}. {item.food_item__name}
                              </span>
                              <span className="font-black text-orange-600">
                                {item.total_qty} sold
                              </span>
                            </div>
                            {/* Fluid Responsive Bar Chart Visual */}
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Responsive Category Revenue Breakdown & Progress */}
              <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-gray-900 text-base">Sales by Category</h3>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Revenue Share
                  </span>
                </div>

                {categorySales.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No category sales recorded yet.</p>
                ) : (
                  <div className="space-y-3.5 pt-2">
                    {(() => {
                      const totalRev = categorySales.reduce(
                        (acc, curr) => acc + parseFloat(curr.total_revenue || 0),
                        0
                      ) || 1;

                      return categorySales.map((cat, idx) => {
                        const rev = parseFloat(cat.total_revenue || 0);
                        const pct = Math.min(100, Math.round((rev / totalRev) * 100));
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-800 truncate">
                                {cat.food_item__category__name} ({pct}%)
                              </span>
                              <div className="text-right">
                                <span className="font-black text-gray-900">
                                  ₹{rev.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-1.5">
                                  ({cat.total_qty} items)
                                </span>
                              </div>
                            </div>
                            {/* Fluid Responsive Category Bar */}
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

            </div>

            {/* Quick Export Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-5 sm:p-7 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-base sm:text-lg">Download Full Financial Audit</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Export complete order history, student details, payment breakdowns, and dates in CSV format.
                </p>
              </div>
              <button
                onClick={exportCSVReport}
                className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 min-h-[44px] shadow-lg shadow-orange-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV Audit</span>
              </button>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
