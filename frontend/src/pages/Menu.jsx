import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Sparkles, X, Check } from 'lucide-react';
import API from '../api/axios';
import FoodCard from '../components/FoodCard';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'price_asc', 'price_desc'
  const [maxPrice, setMaxPrice] = useState(200);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Count active filters
  const activeFiltersCount =
    (vegFilter !== 'all' ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (maxPrice < 200 ? 1 : 0) +
    (sortBy !== 'popular' ? 1 : 0);

  // Load categories
  useEffect(() => {
    API.get('/categories/')
      .then((r) => setCategories(r.data))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Sync category param if url changed
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCat(cat);
    }
  }, [searchParams]);

  // Load foods
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCat) params.category = selectedCat;
    if (search.trim()) params.search = search.trim();
    if (vegFilter === 'veg') params.veg = 'true';
    if (vegFilter === 'non-veg') params.veg = 'false';
    if (availableOnly) params.available = 'true';
    if (sortBy) params.sort = sortBy;
    if (maxPrice < 200) params.max_price = maxPrice;

    API.get('/foods/', { params })
      .then((r) => setFoods(r.data))
      .catch((err) => console.error('Failed to load foods:', err))
      .finally(() => setLoading(false));
  }, [selectedCat, search, vegFilter, availableOnly, sortBy, maxPrice]);

  const resetFilters = () => {
    setSelectedCat('');
    setSearch('');
    setVegFilter('all');
    setAvailableOnly(false);
    setSortBy('popular');
    setMaxPrice(200);
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const handleCategorySelect = (catName) => {
    setSelectedCat(catName);
    if (catName) {
      setSearchParams({ category: catName });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 sm:pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Full Campus Kitchen Menu
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Delicious Bites & Meals 🍛
          </h1>
          <p className="text-gray-500 text-xs sm:text-base mt-1">
            Choose from freshly prepared breakfast, meals, snacks, biryanis, and beverages.
          </p>
        </div>

        {/* Mobile & Desktop Search + Filter Trigger */}
        <div className="w-full md:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes (Biryani, Dosa, Coffee)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 min-h-[44px] bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600"
                aria-label="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button (Visible on mobile/tablet < md) */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden relative px-3.5 py-3 min-h-[44px] bg-white border border-gray-200 rounded-2xl text-gray-700 font-bold text-xs flex items-center gap-1.5 shadow-xs hover:border-orange-300 transition"
            aria-label="Open Filter Controls"
          >
            <Filter className="w-4 h-4 text-orange-500" />
            <span className="hidden xs:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-orange-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 min-h-[40px] rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition shadow-xs ${
            !selectedCat
              ? 'bg-orange-500 text-white shadow-orange-500/20'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
          }`}
        >
          All Items ({foods.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategorySelect(c.name)}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[40px] rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 sm:gap-2 shadow-xs ${
              selectedCat === c.name
                ? 'bg-orange-500 text-white shadow-orange-500/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span>{c.icon || '🍽️'}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Desktop Filter and Sorting Toolbar (>= md) */}
      <div className="hidden md:flex bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs flex-wrap items-center justify-between gap-4">
        
        {/* Left: Veg/Non-Veg & Stock Checkbox */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                vegFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                vegFilter === 'veg' ? 'bg-white text-green-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Pure Veg
            </button>
            <button
              onClick={() => setVegFilter('non-veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                vegFilter === 'non-veg' ? 'bg-white text-red-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> Non-Veg
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none bg-gray-50 px-3 py-2 min-h-[38px] rounded-xl border border-gray-200/70 hover:bg-gray-100 transition">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <span>In-Stock Only</span>
          </label>
        </div>

        {/* Right: Max Price & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Max Price slider */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/70 text-xs font-bold text-gray-700">
            <span>Max: ₹{maxPrice}</span>
            <input
              type="range"
              min="20"
              max="200"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedCat || search || vegFilter !== 'all' || availableOnly || maxPrice < 200 || sortBy !== 'popular') && (
            <button
              onClick={resetFilters}
              className="p-2 text-gray-400 hover:text-orange-600 rounded-xl hover:bg-orange-50 transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Mobile Filters Drawer / Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto z-10 animate-slide-up space-y-5">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-gray-900 text-lg">Filters & Sorting</h3>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Food Dietary Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Dietary Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVegFilter('all')}
                  className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold transition flex items-center justify-center ${
                    vegFilter === 'all'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Items
                </button>
                <button
                  type="button"
                  onClick={() => setVegFilter('veg')}
                  className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    vegFilter === 'veg'
                      ? 'bg-green-600 text-white shadow-xs'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  Pure Veg
                </button>
                <button
                  type="button"
                  onClick={() => setVegFilter('non-veg')}
                  className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    vegFilter === 'non-veg'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  Non-Veg
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Sort Dishes By
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'popular', label: '🔥 Most Popular' },
                  { id: 'rating', label: '⭐ Highest Rated' },
                  { id: 'price_asc', label: '💵 Price: Low to High' },
                  { id: 'price_desc', label: '💰 Price: High to Low' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`p-3 min-h-[44px] rounded-xl text-xs font-bold text-left transition border ${
                      sortBy === opt.id
                        ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Stock Toggle */}
            <label className="flex items-center justify-between p-3.5 min-h-[44px] bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer">
              <span className="text-xs font-bold text-gray-800">Show In-Stock Only</span>
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
            </label>

            {/* Max Price Range Slider */}
            <div className="space-y-2 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                <span>Maximum Price:</span>
                <span className="text-orange-600 font-black text-sm">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="py-3 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="py-3 min-h-[44px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Food Cards Grid: 1-2 on mobile, 2-3 on tablet, 4 on desktop */}
      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between h-80">
              <div className="h-44 xs:h-48 sm:h-52 w-full skeleton-shimmer" />
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
      ) : foods.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-gray-100 max-w-md mx-auto my-8 sm:my-12 shadow-xs animate-fade-up">
          <div className="text-5xl sm:text-6xl mb-4 animate-float">🥣</div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Matching Food Items</h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
            We couldn't find any dishes matching your current filter settings. Try adjusting your search, category, or price range.
          </p>
          <button
            onClick={resetFilters}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-7 py-3.5 min-h-[44px] rounded-xl shadow-md shadow-orange-500/25 transition active:scale-95"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-up">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}

    </div>
  );
}
