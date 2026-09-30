import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  Star,
  Flame,
  Award,
  ChevronRight,
  Percent,
  CheckCircle,
  Users,
  Coffee,
  Heart
} from 'lucide-react';
import API from '../api/axios';
import FoodCard from '../components/FoodCard';

export default function Home() {
  const [specials, setSpecials] = useState([]);
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/categories/'),
      API.get('/foods/?available=true'),
    ])
      .then(([catRes, foodRes]) => {
        setCategories(catRes.data);
        const allFoods = foodRes.data;
        setSpecials(allFoods.filter((f) => f.is_special).slice(0, 4));
        setPopular(allFoods.filter((f) => f.is_popular || f.rating >= 4.7).slice(0, 8));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-slate-50 pt-8 sm:pt-16 pb-14 sm:pb-28 border-b border-orange-100/60">
        {/* Decorative background blurs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-300/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200 px-4 py-1.5 rounded-full text-xs font-bold text-orange-700 shadow-xs max-w-full truncate hover:scale-102 transition-transform cursor-default">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-spin" />
                <span className="truncate">Next-Gen Smart College Canteen Experience</span>
              </div>

              <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.08] break-words">
                Order Fresh. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 drop-shadow-xs">
                  Eat Happy.
                </span>{' '}
                <br />
                Skip The Queue!
              </h1>

              <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Never waste your lunch break standing in crowded canteen lines again. Order online from your phone, receive a live digital token, and collect hot food right on time.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm sm:text-base px-8 py-4 min-h-[48px] rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 group btn-ripple"
                >
                  <span>Browse Full Menu</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <Link
                  to="/offers"
                  className="w-full sm:w-auto bg-white/90 hover:bg-white text-gray-800 border-2 border-gray-200/90 hover:border-orange-300 font-bold text-sm sm:text-base px-7 py-4 min-h-[48px] rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Percent className="w-4 h-4 text-orange-500" />
                  <span>Student Offers (20% Off)</span>
                </Link>
              </div>

              {/* Key Trust Stats with Hover Glow */}
              <div className="pt-6 border-t border-gray-200/80 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto lg:mx-0">
                <div className="p-3 bg-white/70 backdrop-blur-xs sm:bg-transparent rounded-2xl border border-gray-100/60 sm:border-0 hover:scale-105 transition-transform">
                  <p className="text-2xl xs:text-3xl font-black text-gray-900">4.9★</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-0.5">Campus Rating</p>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-xs sm:bg-transparent rounded-2xl border border-gray-100/60 sm:border-0 hover:scale-105 transition-transform">
                  <p className="text-2xl xs:text-3xl font-black text-orange-600">~12m</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-0.5">Avg Prep Time</p>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-xs sm:bg-transparent rounded-2xl border border-gray-100/60 sm:border-0 hover:scale-105 transition-transform">
                  <p className="text-2xl xs:text-3xl font-black text-emerald-600">100%</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-0.5">Fresh & Clean</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0 animate-fade-up delay-150">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background glow */}
                <div className="absolute -top-8 -left-8 w-56 sm:w-80 h-56 sm:h-80 bg-orange-400/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 -right-8 w-56 sm:w-80 h-56 sm:h-80 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />

                {/* Main Hero Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800"
                    alt="Dum Biryani Special"
                    className="w-full h-64 xs:h-72 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[9px] xs:text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-2 inline-block shadow-sm">
                      🔥 Chef's Daily Special
                    </span>
                    <h3 className="text-xl xs:text-2xl sm:text-3xl font-black mb-1.5 leading-snug">Hyderabadi Chicken Biryani</h3>
                    <p className="text-xs text-slate-200 mb-3.5 line-clamp-1 xs:line-clamp-2">Slow-cooked with saffron, caramelised onions & fragrant spices.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl xs:text-3xl font-black text-amber-400 font-mono">₹140</span>
                      <Link
                        to="/menu?category=Biryani%20&%20Rice"
                        className="bg-white text-gray-900 font-extrabold text-xs px-5 py-2.5 min-h-[44px] flex items-center justify-center rounded-xl hover:bg-orange-500 hover:text-white transition shadow-lg active:scale-95"
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Token Badge */}
                <div className="absolute -bottom-4 left-2 sm:-bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-gray-100/90 items-center gap-3 animate-float hidden xs:flex">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg sm:text-xl font-bold shrink-0 shadow-2xs">
                    ✓
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Live Kitchen Token
                    </span>
                    <p className="text-sm sm:text-base font-black text-gray-900 leading-tight">Token #4829 Ready!</p>
                    <p className="text-[10px] sm:text-[11px] text-emerald-600 font-bold">Pick up Counter 1</p>
                  </div>
                </div>

                {/* Floating Discount Tag */}
                <div className="absolute top-2 right-2 sm:-top-5 sm:-right-5 bg-gradient-to-br from-orange-500 to-amber-500 text-white p-3 sm:p-4 rounded-2xl shadow-xl rotate-3 hidden xs:block hover:rotate-0 transition-transform duration-300">
                  <span className="text-[10px] sm:text-xs font-bold block uppercase tracking-wider opacity-90">Student Code</span>
                  <span className="text-sm sm:text-lg font-black block tracking-wider font-mono">WELCOME10</span>
                  <span className="text-[9px] sm:text-[10px] block opacity-95">10% Instant Off</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Explore Canteen Delicacies
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1">
              Food Categories 🍽️
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group w-fit min-h-[44px]"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/menu?category=${encodeURIComponent(c.name)}`}
              className="group bg-white p-3.5 xs:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-orange-200 shadow-xs hover:shadow-lg transition-all duration-200 text-center flex flex-col items-center justify-between"
            >
              <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-orange-50 group-hover:bg-orange-500 text-xl xs:text-2xl flex items-center justify-center transition-colors mb-2 xs:mb-3 group-hover:scale-110 transform">
                {c.icon || '🍛'}
              </div>
              <h3 className="font-extrabold text-xs xs:text-sm text-gray-800 group-hover:text-orange-600 transition truncate max-w-full">
                {c.name}
              </h3>
              <span className="text-[10px] xs:text-[11px] text-gray-400 mt-1">
                {c.items_count || 'Fresh'} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Specials */}
      {specials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> Hot Picks
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Today's Special Dishes ⭐
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Specially curated and freshly cooked by our campus chefs for today.
              </p>
            </div>
            <Link
              to="/menu"
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 w-fit min-h-[44px]"
            >
              See full menu <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {specials.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </section>
      )}

      {/* Promotional Discount Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-6 sm:p-12 text-white shadow-xl shadow-orange-500/15">
          <div className="max-w-2xl relative z-10 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5" /> Exclusive College Offer
            </div>
            <h3 className="text-2xl xs:text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Get Up to 20% Off Your Next Campus Treat!
            </h3>
            <p className="text-slate-100 text-xs sm:text-base leading-relaxed">
              Use code <strong className="bg-white text-orange-600 px-2 py-0.5 rounded-md font-mono font-black">CAMPUS20</strong> at checkout on orders above ₹150. Valid for all college students & faculty members.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <Link
                to="/offers"
                className="bg-white text-gray-900 font-extrabold text-xs sm:text-sm px-6 py-3.5 min-h-[44px] rounded-xl hover:bg-orange-50 hover:text-orange-600 transition shadow flex items-center justify-center"
              >
                Claim Coupon Codes
              </Link>
              <Link
                to="/menu"
                className="bg-black/20 hover:bg-black/30 border border-white/30 text-white font-bold text-xs sm:text-sm px-6 py-3.5 min-h-[44px] rounded-xl transition flex items-center justify-center"
              >
                Order & Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Food Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Campus Favorites
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1">
              Most Popular Dishes 🔥
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Top rated meals, snacks, and beverages ordered most by students this week.
            </p>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group w-fit min-h-[44px]"
          >
            <span>Explore All 18+ Dishes</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between h-80">
                <div className="h-48 w-full skeleton-shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-1/3 rounded-md skeleton-shimmer" />
                  <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 w-16 rounded-md skeleton-shimmer" />
                    <div className="h-9 w-20 rounded-xl skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {popular.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Our Smart Canteen */}
      <section className="bg-white py-12 sm:py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Smart Campus Dining
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1">
              Why Students Love CampusBite 🚀
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              Engineered to save precious break time and provide healthy, fresh food effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100/80 hover:bg-white hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mb-4">
                ⏳
              </div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mb-1.5">Zero Waiting Queues</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Order before your lecture ends. Food is freshly prepped so you only walk up and pick it up.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100/80 hover:bg-white hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4">
                🎫
              </div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mb-1.5">Digital Token System</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Automated 4-digit token generated instantly. Clear sound chimes and notifications when ready.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100/80 hover:bg-white hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                🥗
              </div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mb-1.5">Fresh & Hygienic</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                100% campus certified fresh produce and ingredients prepared daily by verified chefs.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100/80 hover:bg-white hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4">
                💳
              </div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mb-1.5">Instant UPI & Counter Pay</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Support for Pay at Counter, Google Pay, PhonePe, Paytm QR scanner, and student discounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Reviews & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Verified Reviews
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1">
            What Students Are Saying 💬
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed mb-4">
                "The Masala Dosa is super crispy and ordering through the token system means I get my food in 5 minutes flat between back-to-back lectures!"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
              <span className="text-2xl">👩‍🎓</span>
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">Priya Ananya</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400">B.Tech CSE, 3rd Year</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed mb-4">
                "Hyderabadi Chicken Biryani is top tier! We order for our group during project hackathons and use the coupon codes to save money."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
              <span className="text-2xl">🧑‍💻</span>
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">Rohan Varma</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400">B.Tech ECE, Final Year</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed mb-4">
                "The cold coffee and brownie combo is legendary. The instant token notification alert is super helpful so you know exactly when to collect."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
              <span className="text-2xl">👨‍🎓</span>
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">Aditya Nair</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400">Mechanical Engg, 2nd Year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
