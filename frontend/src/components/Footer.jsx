import { Link } from 'react-router-dom';
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Mission */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Campus<span className="text-orange-500">Bite</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The modern college canteen experience. Skip long lunchtime queues, order freshly prepared meals with live digital tokens, and pick up right on time.
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold bg-orange-500/10 px-3 py-2 rounded-xl border border-orange-500/20 w-fit">
              <ShieldCheck className="w-4 h-4" /> 100% Hygienic Campus Certified
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-orange-400 transition">Full Canteen Menu</Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-orange-400 transition">Coupons & Student Discounts</Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-orange-400 transition">Live Token Tracking</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400 transition">View Cart & Checkout</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Timings */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">
              Service Hours
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Breakfast & Beverages</p>
                  <p className="text-xs text-slate-400">8:00 AM – 11:30 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Lunch & Thali Service</p>
                  <p className="text-xs text-slate-400">12:00 PM – 3:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Snacks & Evening Dinner</p>
                  <p className="text-xs text-slate-400">4:00 PM – 8:30 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Campus Help & Location */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">
              Campus Canteen Desk
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Central Dining Complex, Ground Floor, Academic Block B</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>+91 98765 43210 / Ext 402</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>canteen@campus.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusBite Smart College Canteen Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for <span className="text-orange-400 font-semibold">B.Tech Final Year Project Demonstration</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
