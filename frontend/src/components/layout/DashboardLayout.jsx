import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/globals.css';
import '../../assets/css/dashboard.css';

function DashboardLayout({ children, title }) {
  const { user } = useAuth();
  const SIDEBAR_STATE_KEY = 'campusone.sidebar.open.desktop';

  const getIsMobile = () => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const getInitialSidebarOpen = () => {
    if (getIsMobile()) {
      return false;
    }

    if (typeof window === 'undefined') {
      return true;
    }

    const saved = window.localStorage.getItem(SIDEBAR_STATE_KEY);
    if (saved === null) {
      return true;
    }

    return saved === 'true';
  };

  const [isMobile, setIsMobile] = useState(getIsMobile());
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarOpen());

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const userRole = user?.role || 'ADMIN';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        return;
      }

      const saved = window.localStorage.getItem(SIDEBAR_STATE_KEY);
      setSidebarOpen(saved === null ? true : saved === 'true');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    window.localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarOpen));
  }, [isMobile, sidebarOpen]);

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      <Sidebar role={userRole} isOpen={sidebarOpen} onClose={closeSidebar} isMobile={isMobile} />
      <Navbar onMenuToggle={toggleSidebar} title={title} sidebarOpen={sidebarOpen} />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;

