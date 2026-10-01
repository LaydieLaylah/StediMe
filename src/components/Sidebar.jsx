import React from 'react';
import {
  Home,
  Target,
  Repeat2,
  UserCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const items = [
  ['/', 'Home', Home],
  ['/challenges', 'Challenges', Target],
  ['/commitments', 'Commitments', Repeat2],
  ['/profile', 'Profile', UserCircle],
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  onSignOut,
}) {
  const nav = useNavigate();

  const handleSignOut = () => {
    onSignOut();
    nav('/login');
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? 76 : 248,
      }}
    >
      <nav>
        {items.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        className="collapse-control"
        onClick={() => setCollapsed(!collapsed)}
        title={
          collapsed ? 'Expand navigation' : 'Collapse navigation'
        }
        aria-label={
          collapsed ? 'Expand navigation' : 'Collapse navigation'
        }
      >
        {collapsed ? (
          <PanelLeftOpen size={18} />
        ) : (
          <PanelLeftClose size={18} />
        )}
      </button>

      <div className="sidebar-bottom">
        <button
          className="nav-item"
          onClick={handleSignOut}
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}