import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import { clearApiCache } from '../../services/apiClient';
import '../../assets/css/navbar.css';

function Navbar({ onMenuToggle, title, sidebarOpen = false }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    window.location.href = '/login';
  };

  const handleReload = () => {
    clearApiCache();
    window.location.reload();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
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
    <nav className="navbar">
      <div className="navbar-left">
        {!sidebarOpen && (
          <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <h2 className="navbar-title">{title || 'Dashboard'}</h2>
      </div>
      <div className="navbar-search">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input type="text" placeholder="Search..." />
      </div>
      <div className="navbar-right">
        <button
          type="button"
          className="navbar-reload-btn"
          onClick={handleReload}
          title="Reload"
          aria-label="Reload site"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356m-1.5 0a9 9 0 1 0 2.4 9.7" />
          </svg>
        </button>
        <NotificationBell />
        <div className="navbar-user" ref={dropdownRef}>
          <div className="user-menu-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="user-avatar">{getInitials(user?.name || 'User')}</div>
            <span className="user-name">{user?.name || 'User'}</span>
          </div>
          {dropdownOpen && (
            <div className="user-dropdown open">
              <div className="dropdown-item" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

