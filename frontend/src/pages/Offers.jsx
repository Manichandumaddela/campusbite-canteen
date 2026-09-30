import { useState, useEffect } from 'react';
import { Tag, Copy, Check, Sparkles, Percent, Gift, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    API.get('/coupons/')
      .then((r) => setCoupons(r.data))
      .catch((err) => console.error(err));
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Campus Specials
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Offers & Student Discounts 🎟️
        </h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
          Save on your daily meals, group treats, and exam fuel with exclusive promo coupons.
        </p>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-up">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="relative bg-white rounded-3xl p-5 sm:p-6 border-2 border-dashed border-orange-200/90 shadow-sm hover:shadow-xl hover:border-orange-400 transition-all duration-300 flex flex-col justify-between overflow-hidden transform hover:-translate-y-1.5"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black uppercase px-3 py-1 rounded-lg shadow-2xs">
                {c.discount_percent}% Discount
              </span>
              <Gift className="w-5 h-5 text-orange-400" />
            </div>

            {/* Code Box */}
            <div className="my-3 sm:my-4 text-center bg-orange-50/60 p-4 rounded-2xl border border-orange-100">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">
                Coupon Code
              </span>
              <span className="font-mono font-black text-2xl text-orange-600 tracking-wider">
                {c.code}
              </span>
            </div>

            {/* Description & Rules */}
            <div className="space-y-1 text-xs text-gray-600 mb-5">
              <p className="font-semibold text-gray-800 text-sm">{c.description || 'Special campus discount'}</p>
              <p className="text-gray-400">Min. order amount: ₹{parseFloat(c.min_order).toFixed(0)}</p>
              <p className="text-gray-400">Max. discount cap: ₹{parseFloat(c.max_discount).toFixed(0)}</p>
            </div>

            {/* Copy Button */}
            <button
              onClick={() => handleCopy(c.code)}
              className="w-full bg-slate-900 hover:bg-orange-500 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm min-h-[44px]"
            >
              {copiedCode === c.code ? (
                <>
                  <Check className="w-4 h-4 text-green-400" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Coupon Code
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Campus Treat Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-500/15">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-black">Ready to apply your discount?</h3>
          <p className="text-orange-100 text-sm max-w-md">
            Add items to your cart, paste the coupon code during checkout, and watch your total drop!
          </p>
        </div>

        <Link
          to="/menu"
          className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 font-black text-sm px-7 py-3.5 rounded-2xl shadow transition whitespace-nowrap flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span>Order Food Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
