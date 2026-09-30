import { useState } from 'react';
import { Star, Clock, Heart, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import FoodDetailModal from './FoodDetailModal';

export default function FoodCard({ food }) {
  const { addToCart, favorites, toggleFavorite } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [added, setAdded] = useState(false);

  const isFav = favorites?.has?.(food.id);

  const getImageUrl = (item) => {
    return item.display_image || item.image_url || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    addToCart(food, 1, rect);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(food.id);
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group bg-white rounded-3xl border border-gray-100/90 hover:border-orange-300/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(249,115,22,0.16)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer transform hover:-translate-y-2 will-change-transform"
      >
        {/* Card Image and Badges */}
        <div className="relative h-44 xs:h-48 sm:h-52 w-full overflow-hidden bg-slate-100 shrink-0">
          <img
            src={getImageUrl(food)}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top badges: Veg/Non-Veg & Category */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center justify-center w-5 h-5 border-2 rounded-sm bg-white shadow-xs ${
                food.is_veg ? 'border-green-600' : 'border-red-600'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${food.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
            </span>

            {food.is_special && (
              <span className="bg-amber-500 text-white text-[9px] xs:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                Special
              </span>
            )}
          </div>

          {/* Favorite button (min 44px tap target area) */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-sm backdrop-blur-sm transition transform hover:scale-110"
            title="Add to favorites"
            aria-label="Add to favorites"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>

          {/* Availability badge */}
          {(!food.is_available || food.stock_quantity <= 0) && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold text-[10px] xs:text-xs uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                Sold Out
              </span>
            </div>
          )}

          {/* Bottom badge on image: Prep time */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] xs:text-xs font-semibold px-2 py-0.5 rounded-lg shadow-xs">
              <Clock className="w-3 h-3 text-orange-500" />
              {food.preparation_time || 15}m
            </span>
          </div>

          {/* Rating */}
          <div className="absolute bottom-2.5 right-2.5">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] xs:text-xs font-bold px-2 py-0.5 rounded-lg shadow-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {food.rating || '4.5'}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3.5 xs:p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] xs:text-[11px] font-bold text-orange-600 uppercase tracking-wider truncate">
                {food.category_name}
              </span>
              {food.original_price && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                  {Math.round(((food.original_price - food.price) / food.original_price) * 100)}% OFF
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base lg:text-lg group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
              {food.name}
            </h3>

            <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 sm:mb-4">
              {food.description || 'Freshly prepared upon your order in the canteen kitchen.'}
            </p>
          </div>

          {/* Price and Add button */}
          <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-50 gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-base xs:text-lg sm:text-xl font-black text-gray-900">
                  ₹{food.price}
                </span>
                {food.original_price && (
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                    ₹{food.original_price}
                  </span>
                )}
              </div>
              <span className="text-[9px] xs:text-[10px] text-gray-400 font-medium block truncate">Incl. taxes</span>
            </div>

            <button
              onClick={handleAdd}
              disabled={!food.is_available || food.stock_quantity <= 0}
              className={`px-3 xs:px-4 py-2 min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs shrink-0 active:scale-95 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : food.is_available && food.stock_quantity > 0
                  ? 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white group-hover:bg-orange-500 group-hover:text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showModal && <FoodDetailModal food={food} onClose={() => setShowModal(false)} />}
    </>
  );
}
