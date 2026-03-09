import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/globals.css';
import '../../assets/css/dashboard.css';

function DashboardLayout({ children, title }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const userRole = user?.role || 'ADMIN';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      <Sidebar role={userRole} isOpen={sidebarOpen} onClose={closeSidebar} />
      <Navbar onMenuToggle={toggleSidebar} title={title} />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;

