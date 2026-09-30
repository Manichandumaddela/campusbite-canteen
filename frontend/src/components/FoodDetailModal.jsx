import { useState, useEffect } from 'react';
import { X, Star, Clock, Heart, ShoppingBag, Plus, Minus, MessageSquare, Send, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function FoodDetailModal({ food, onClose }) {
  const { addToCart, favorites, toggleFavorite } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isFav = favorites?.has?.(food.id);

  useEffect(() => {
    API.get(`/foods/${food.id}/reviews/`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingReviews(false));
  }, [food.id]);

  const handleAddToCart = (e) => {
    const rect = e?.currentTarget?.getBoundingClientRect?.();
    addToCart(food, quantity, rect);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review!');
      return;
    }
    if (!userComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await API.post(`/foods/${food.id}/reviews/`, {
        rating: userRating,
        comment: userComment,
      });
      setReviews([res.data, ...reviews.filter((r) => r.user !== user.id)]);
      setUserComment('');
      alert('Review posted successfully!');
    } catch (err) {
      alert('Failed to post review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getImageUrl = (item) => {
    return item.display_image || item.image_url || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-gray-100 animate-slide-up sm:animate-modal-scale">
        
        {/* Header Image & Action Bar */}
        <div className="relative h-52 xs:h-60 sm:h-72 w-full bg-slate-100 shrink-0">
          <img
            src={getImageUrl(food)}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
          
          {/* Close button (44px tap target) */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
            aria-label="Close food details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Favorite button (44px tap target) */}
          <button
            onClick={() => toggleFavorite(food.id)}
            className="absolute top-3 left-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md backdrop-blur-md transition"
            aria-label="Save to favorites"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>

          {/* Badges on image */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 border-2 rounded-sm bg-white shrink-0 ${
                    food.is_veg ? 'border-green-600' : 'border-red-600'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${food.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
                </span>
                <span className="text-[10px] xs:text-xs bg-white/90 backdrop-blur-md text-gray-800 font-bold px-2.5 py-0.5 rounded-full shadow-xs truncate">
                  {food.category_name}
                </span>
              </div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white drop-shadow-md truncate">
                {food.name}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xl xs:text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-md">
                ₹{food.price}
              </span>
              {food.original_price && (
                <p className="text-[10px] xs:text-xs text-slate-300 line-through">₹{food.original_price}</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 border-b border-gray-100 pb-3 sm:pb-4">
            <div className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{food.rating}</span>
              <span className="text-gray-400 font-normal">({reviews.length})</span>
            </div>

            <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full font-medium">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>~{food.preparation_time || 15} mins</span>
            </div>

            <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full font-medium">
              <span>Stock:</span>
              <span className={`font-bold ${food.stock_quantity > 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                {food.stock_quantity > 0 ? `${food.stock_quantity} left` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description & Recipe</h4>
            <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">
              {food.description || 'Prepared fresh with high quality ingredients in the college canteen kitchen.'}
            </p>
          </div>

          {/* Customer Reviews Section */}
          <div className="border-t border-gray-100 pt-5 sm:pt-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                Student Reviews ({reviews.length})
              </h4>
            </div>

            {/* Submit Review form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-orange-50/50 p-3.5 sm:p-4 rounded-2xl border border-orange-100 mb-5">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-700">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setUserRating(s)}
                        className="p-1 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-orange-100/50 focus:outline-none transition"
                        aria-label={`Rate ${s} stars`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            s <= userRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Write your feedback (e.g. delicious, spicy, crispy)..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post Review
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-gray-400 italic mb-4">Log in to leave a review and rating.</p>
            )}

            {/* Reviews List */}
            <div className="space-y-2.5">
              {loadingReviews ? (
                <div className="text-xs text-gray-400">Loading feedback...</div>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No reviews yet. Be the first to review this dish!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.avatar || '👨‍🎓'}</span>
                        <span className="text-xs font-bold text-gray-800">{r.user_name || r.username}</span>
                      </div>
                      <div className="flex items-center text-amber-400 text-xs">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 pl-7 break-words leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer: Responsive Quantity & Full-Width Add to Cart */}
        <div className="p-3.5 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <span className="text-xs font-bold text-gray-500 sm:hidden">Quantity:</span>
            <div className="flex items-center border border-gray-200 bg-white rounded-2xl overflow-hidden p-1 shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 min-w-[40px] flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xl transition"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-gray-800 text-base">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 min-w-[40px] flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xl transition"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!food.is_available || food.stock_quantity <= 0}
            className={`w-full sm:flex-1 py-3.5 px-6 min-h-[48px] rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 ${
              added
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : food.is_available && food.stock_quantity > 0
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" /> Added to Cart!
              </>
            ) : food.is_available && food.stock_quantity > 0 ? (
              <>
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <span className="truncate">Add {quantity} to Cart • ₹{(food.price * quantity).toFixed(2)}</span>
              </>
            ) : (
              'Currently Unavailable'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
