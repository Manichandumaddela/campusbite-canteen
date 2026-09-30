import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';
import { sound } from '../utils/sound';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundMuted, setSoundMuted] = useState(sound.isMuted());
  const previousUnreadCount = useRef(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await API.get('/notifications/');
      const notifs = res.data.notifications || [];
      const count = res.data.unread_count || 0;

      // Check if new unread notification arrived
      if (count > previousUnreadCount.current && previousUnreadCount.current !== 0) {
        const latest = notifs[0];
        if (latest && latest.title.toLowerCase().includes('ready')) {
          sound.playOrderReady();
        } else {
          sound.playNotification();
        }
      }
      previousUnreadCount.current = count;

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      // ignore unauthenticated or network glitches
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.post(`/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.post('/notifications/read-all/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setSoundMuted(isMuted);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
        soundMuted,
        toggleSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
