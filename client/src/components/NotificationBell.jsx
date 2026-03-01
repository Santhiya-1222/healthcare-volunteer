import { useState, useEffect, useRef } from "react";
import { HiBell } from "react-icons/hi";
import { getNotifications, markAllAsRead } from "../services/notificationService";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch {
      // ignore
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative text-gray-600 hover:text-primary-600">
        <HiBell className="text-xl" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-primary-600 hover:underline">Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 text-center">No notifications</p>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <div key={n._id} className={`p-3 border-b text-sm ${n.isRead ? "bg-white" : "bg-primary-50"}`}>
                <p className="text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
