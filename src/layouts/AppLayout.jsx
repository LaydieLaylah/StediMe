import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import MobileDrawer from '../components/MobileDrawer';
import { signOut } from '../services/store';
import { useStore } from '../hooks/useStore';

const section = (path) => {
  if (path.startsWith('/challenges')) return 'Challenges';
  if (path.startsWith('/commitments')) return 'Commitments';
  if (path.startsWith('/profile')) return 'Profile';

  return 'Home';
};

export default function AppLayout() {
  const location = useLocation();
  const { store, refresh } = useStore();

  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setDrawer(false);
  }, [location.pathname]);

  const logout = () => {
    signOut();
    refresh();
  };

  return (
    <div className="app">
      <Topbar
        section={section(location.pathname)}
        onMenu={() => setDrawer(true)}
        user={store.user}
      />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onSignOut={logout}
      />

      <MobileDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        onSignOut={logout}
      />

      <main
        className="main"
        style={{
          '--sidebar-width': `${collapsed ? 76 : 248}px`,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}