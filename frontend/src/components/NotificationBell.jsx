import { useEffect, useState, useRef } from "react";
import notificationService from "../services/notificationService";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const [items, unread] = await Promise.all([
          notificationService.getUserNotifications(),
          notificationService.getUnreadCount(),
        ]);
        setNotifications(Array.isArray(items) ? items : []);
        setUnreadCount(typeof unread === "number" ? unread : 0);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    }

    fetchNotifications();
  }, []);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      try {
        await notificationService.markAllAsRead();
        setUnreadCount(0);
      } catch {
        // Ignore read-all failures in bell toggle.
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="notification-wrapper" ref={notificationRef}>
      <button 
        className="notification-btn" 
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <h4>Notifications</h4>
          {notifications.length === 0 && <p className="empty-text">No notifications</p>}
          {notifications.slice(0, 6).map((item) => (
            <div key={item.id} className="notification-item">
              <strong>{item.title}</strong>
              <p>{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

