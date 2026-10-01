import React from 'react';
import {
  Home,
  Target,
  Repeat2,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const items = [
  ['/', 'Home', Home],
  ['/challenges', 'Challenges', Target],
  ['/commitments', 'Commitments', Repeat2],
  ['/profile', 'Profile', UserCircle],
];

export default function MobileDrawer({
  open,
  onClose,
  onSignOut,
}) {
  const nav = useNavigate();

  if (!open) {
    return null;
  }

  const handleSignOut = () => {
    onSignOut();
    nav('/login');
    onClose();
  };

  return (
    <>
      <div
        className="mobile-menu-backdrop"
        onClick={onClose}
      />

      <div className="mobile-menu">
        <div className="mobile-menu-header">
          <strong>Navigation</strong>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          {items.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mobile-menu-spacer" />

        <button
          className="nav-item"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );
}