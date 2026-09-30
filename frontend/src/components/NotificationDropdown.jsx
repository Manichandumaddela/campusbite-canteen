import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Volume2, VolumeX, Clock, ChevronRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, soundMuted, toggleSound } = useNotifications();
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-700 hover:text-orange-600 rounded-full hover:bg-orange-50 transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-3 w-auto sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 text-sm sm:text-base">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] sm:text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                title={soundMuted ? 'Unmute alerts' : 'Mute alerts'}
              >
                {soundMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold px-2.5 py-1.5 rounded-xl hover:bg-orange-50 transition flex items-center gap-1 min-h-[36px]"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`p-3.5 hover:bg-orange-50/50 cursor-pointer transition flex items-start gap-3 ${
                    !n.is_read ? 'bg-orange-50/30' : ''
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 ${
                      !n.is_read ? 'bg-orange-500 ring-4 ring-orange-100' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm break-words ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="text-[10px] text-orange-600 hover:text-orange-800 font-bold uppercase tracking-wider shrink-0 p-1 rounded hover:bg-orange-100 transition"
                          title="Mark as read"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed break-words">{n.message}</p>
                    <span className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 shrink-0" />
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 pt-2.5 border-t border-gray-100">
            <Link
              to="/my-orders"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1 min-h-[40px] rounded-xl hover:bg-orange-50 transition"
            >
              Track Active Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
