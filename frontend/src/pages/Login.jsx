import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      if (data.user?.is_staff) {
        navigate('/admin');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Invalid credentials. Please verify your username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'student') {
      setForm({ username: 'student', password: 'student123' });
    } else {
      setForm({ username: 'admin', password: 'admin123' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-b from-orange-50/50 via-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        
        {/* Quick Demo Credentials Panel */}
        <div className="bg-white rounded-3xl p-5 border border-orange-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-600">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Instant Demo Logins (1-Click Fill)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="bg-orange-50 hover:bg-orange-100 border border-orange-200/80 text-orange-800 p-2.5 rounded-2xl text-xs font-bold transition text-left"
            >
              <span className="block font-black">👨‍🎓 Student Account</span>
              <span className="text-[10px] text-orange-600 block opacity-90">student / student123</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 p-2.5 rounded-2xl text-xs font-bold transition text-left"
            >
              <span className="block font-black">🛡️ Admin Account</span>
              <span className="text-[10px] text-slate-600 block opacity-90">admin / admin123</span>
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <form
          onSubmit={submit}
          className="bg-white p-5 xs:p-7 sm:p-10 rounded-3xl shadow-xl border border-gray-100 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Sign In to CampusBite
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              Access live menu, token tracking, and student discounts.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition transform active:scale-95 disabled:bg-orange-300 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-orange-600 font-bold hover:underline">
              Register as Student
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
