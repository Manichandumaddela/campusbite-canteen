import { useState, useEffect } from 'react';
import { User, Phone, Mail, Building, GraduationCap, Check, Save, Clock, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Link } from 'react-router-dom';

const avatars = ['👨‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🎓', '🍜', '🍔', '🍕'];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [studentId, setStudentId] = useState(user?.profile?.student_id || '');
  const [department, setDepartment] = useState(user?.profile?.department || 'Computer Science & Engg');
  const [year, setYear] = useState(user?.profile?.year || 'Final Year (4th)');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.profile?.avatar || '👨‍🎓');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [ordersStats, setOrdersStats] = useState({ totalOrders: 0, totalSpent: 0 });

  useEffect(() => {
    API.get('/orders/my/')
      .then((r) => {
        const list = r.data || [];
        const spent = list
          .filter((o) => o.status !== 'cancelled')
          .reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0);
        setOrdersStats({
          totalOrders: list.length,
          totalSpent: spent,
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        student_id: studentId,
        department,
        year,
        avatar: selectedAvatar,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-orange-500/15 flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
        <div className="text-5xl sm:text-6xl bg-white/20 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-white/30 shrink-0">
          {selectedAvatar}
        </div>
        <div className="flex-1 w-full">
          <h1 className="text-2xl sm:text-3xl font-black break-words">
            {firstName || user?.username} {lastName}
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm font-medium mt-1">
            Roll No: <span className="font-mono font-bold text-white">{studentId || 'Not Assigned'}</span> • {department}
          </p>
          <div className="grid grid-cols-2 xs:flex items-center justify-center sm:justify-start gap-4 mt-4 pt-3 border-t border-white/20 text-xs font-bold">
            <div>
              <span className="opacity-80 block text-[10px] tracking-wider uppercase">TOTAL ORDERS</span>
              <span className="text-xl sm:text-2xl font-black text-white">{ordersStats.totalOrders}</span>
            </div>
            <div className="hidden xs:block h-6 w-px bg-white/20" />
            <div>
              <span className="opacity-80 block text-[10px] tracking-wider uppercase">LIFETIME SPENT</span>
              <span className="text-xl sm:text-2xl font-black text-white">₹{ordersStats.totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Nav Card to Orders */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-5 shadow-xs flex flex-col xs:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center xs:text-left">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Need to track your food?</h4>
            <p className="text-xs text-gray-500">View real-time kitchen queue & pickup tokens</p>
          </div>
        </div>
        <Link
          to="/my-orders"
          className="w-full xs:w-auto px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-2xl text-xs transition text-center min-h-[44px] flex items-center justify-center"
        >
          View My Orders
        </Link>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-8">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between pb-5 border-b border-gray-100 mb-6 gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Student Profile Information</h2>
            <p className="text-xs text-gray-400">Update your personal details for quick checkout and digital tokens.</p>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1 w-fit">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Choose Profile Avatar
            </label>
            <div className="grid grid-cols-4 xs:grid-cols-8 gap-2">
              {avatars.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-full aspect-square rounded-2xl text-2xl flex items-center justify-center transition min-h-[44px] ${
                    selectedAvatar === av
                      ? 'bg-orange-100 border-2 border-orange-500 scale-105 shadow-sm'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Student ID / Roll No
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Year of Study
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white min-h-[44px]"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="Final Year (4th)">Final Year (4th)</option>
                <option value="Faculty / Staff">Faculty / Staff</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                College Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
