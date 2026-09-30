import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingCart,
  User,
  ShieldCheck,
  LogOut,
  Menu as MenuIcon,
  X,
  Sparkles,
  Ticket,
  Clock,
  Heart,
  ChevronDown,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, setIsCartDrawerOpen, cartBump } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const isActive = (path) => location.pathname === path;

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)] transition-all w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-108 group-hover:rotate-3 transition transform shrink-0">
                <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 truncate">
                    Campus<span className="text-orange-500">Bite</span>
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 bg-orange-100/80 text-orange-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-orange-200/50">
                    <Sparkles className="w-2.5 h-2.5 text-orange-500" /> Smart Canteen
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium hidden sm:block tracking-wide">
                  Order Fresh • Skip The Line
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links (>= md) */}
            <div className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 ${
                  isActive('/')
                    ? 'text-orange-600 bg-white shadow-xs scale-102'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 ${
                  isActive('/menu')
                    ? 'text-orange-600 bg-white shadow-xs scale-102'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                Food Menu
              </Link>
              <Link
                to="/offers"
                className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  isActive('/offers')
                    ? 'text-orange-600 bg-white shadow-xs scale-102'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-orange-500" />
                Offers
              </Link>
              {user && (
                <Link
                  to="/my-orders"
                  className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/my-orders')
                      ? 'text-orange-600 bg-white shadow-xs scale-102'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Track Orders
                </Link>
              )}
              {user?.is_staff && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-black transition-all duration-200 flex items-center gap-1.5 ${
                    isActive('/admin')
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-200/80 text-slate-800 hover:bg-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right Action Icons & Mobile Controls */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
              
              {/* Live Notifications (Desktop & Mobile) */}
              {user && <NotificationDropdown />}

              {/* Shopping Cart Button with Fly-Target ID & Bump Animation */}
              <button
                id="nav-cart-btn"
                onClick={() => {
                  if (location.pathname === '/cart') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setIsCartDrawerOpen(true);
                  }
                }}
                className={`relative p-2.5 min-w-[44px] min-h-[44px] text-gray-700 hover:text-orange-600 hover:bg-orange-50/80 rounded-2xl transition-all duration-200 flex items-center justify-center active:scale-95 ${
                  cartBump ? 'text-orange-600 bg-orange-50 ring-2 ring-orange-400/40' : ''
                }`}
                aria-label="View Shopping Cart"
              >
                <ShoppingCart className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${cartBump ? 'scale-115 text-orange-600' : ''}`} />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-[11px] font-black rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-md border-2 border-white transition-all ${
                      cartBump ? 'animate-badge-pop scale-125 ring-2 ring-orange-300' : 'animate-pulse-subtle'
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Desktop Profile / Sign In (Hidden on Mobile) */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 min-h-[44px] rounded-2xl border border-gray-200/80 hover:border-orange-300 hover:bg-orange-50/50 transition active:scale-98"
                    aria-label="User Profile"
                  >
                    <span className="text-xl leading-none">
                      {user.profile?.avatar || '👨‍🎓'}
                    </span>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-gray-800 leading-tight">
                        {user.first_name || user.username}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {user.profile?.student_id || (user.is_staff ? 'Staff Admin' : 'Student')}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900">{user.get_full_name || user.username}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                      >
                        <User className="w-4 h-4" />
                        Student Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                      >
                        <Clock className="w-4 h-4" />
                        Order History & Tokens
                      </Link>
                      {user.is_staff && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-orange-600 font-bold text-sm px-3 py-2 min-h-[44px] flex items-center rounded-xl transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm px-4 py-2 min-h-[44px] flex items-center rounded-xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition transform hover:-translate-y-0.5"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Hamburger Button (Always >= 44px) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 min-w-[44px] min-h-[44px] text-gray-700 hover:text-orange-600 rounded-2xl hover:bg-gray-100 md:hidden transition flex items-center justify-center"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-orange-600" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Off-Canvas / Slide-over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs xs:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left z-10">
            <div>
              {/* Drawer Header */}
              <div className="p-4 xs:p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <span className="font-black text-lg text-gray-900">
                    Campus<span className="text-orange-500">Bite</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition flex items-center justify-center"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Greeting Card in Drawer */}
              {user ? (
                <div className="p-4 bg-orange-50/60 border-b border-orange-100/60 flex items-center gap-3">
                  <span className="text-3xl p-1 bg-white rounded-2xl shadow-xs">
                    {user.profile?.avatar || '👨‍🎓'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                    </p>
                    <p className="text-xs text-orange-700 font-semibold truncate">
                      {user.profile?.student_id || (user.is_staff ? 'Admin Staff' : 'Student')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-orange-50/40 border-b border-orange-100/60 space-y-2">
                  <p className="text-xs text-gray-600 font-medium">Welcome to CampusBite!</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-white border border-gray-200 text-gray-800 font-bold text-xs py-2.5 min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <LogIn className="w-3.5 h-3.5 text-orange-500" />
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-orange-500 text-white font-bold text-xs py-2.5 min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {/* Drawer Links */}
              <div className="p-3 space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-2xl text-sm font-bold transition ${
                    isActive('/') ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 shrink-0" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-2xl text-sm font-bold transition ${
                    isActive('/menu') ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Food Menu</span>
                </Link>

                <Link
                  to="/offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-2xl text-sm font-bold transition ${
                    isActive('/offers') ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span>Discounts & Offers</span>
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 min-h-[44px] rounded-2xl text-sm font-bold transition ${
                    isActive('/cart') ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    <span>My Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-black">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {user && (
                  <>
                    <div className="pt-2 pb-1 px-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Student Account
                      </span>
                    </div>

                    <Link
                      to="/my-orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-2xl text-sm font-bold transition ${
                        isActive('/my-orders') ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      <Clock className="w-4 h-4 shrink-0 text-blue-500" />
                      <span>Track Orders & History</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-2xl text-sm font-bold transition ${
                        isActive('/profile') ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      <User className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Student Profile</span>
                    </Link>
                  </>
                )}

                {user?.is_staff && (
                  <>
                    <div className="pt-2 pb-1 px-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Staff Administration
                      </span>
                    </div>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-2xl text-sm font-bold transition ${
                        isActive('/admin') ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Drawer Footer with Sign Out */}
            {user && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-2xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
