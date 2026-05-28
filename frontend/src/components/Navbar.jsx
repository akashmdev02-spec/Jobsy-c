import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Briefcase, Search, Bookmark, User, LogOut, LayoutDashboard, PlusCircle, Building } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <Briefcase size={28} style={{ stroke: 'url(#blue-indigo-gradient)' }} />
          <span>Jobsy</span>
          
          {/* SVG Gradient definition for lucide icon */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <linearGradient id="blue-indigo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </svg>
        </Link>

        <ul className="nav-menu">
          <li>
            <NavLink to="/jobs" className={({ active }) => active ? 'nav-link active' : 'nav-link'}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={16} /> Explore Jobs
              </span>
            </NavLink>
          </li>
          
          {user && user.role === 'JOB_SEEKER' && (
            <>
              <li>
                <NavLink to="/dashboard" className={({ active }) => active ? 'nav-link active' : 'nav-link'}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutDashboard size={16} /> Seeker Dashboard
                  </span>
                </NavLink>
              </li>
            </>
          )}

          {user && user.role === 'RECRUITER' && (
            <>
              <li>
                <NavLink to="/dashboard" className={({ active }) => active ? 'nav-link active' : 'nav-link'}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutDashboard size={16} /> Recruiter Dashboard
                  </span>
                </NavLink>
              </li>
            </>
          )}

          {user && user.role === 'ADMIN' && (
            <>
              <li>
                <NavLink to="/dashboard" className={({ active }) => active ? 'nav-link active' : 'nav-link'}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutDashboard size={16} /> Admin Panel
                  </span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                  <User size={16} />
                  <span>{user.fullName}</span>
                  <span className="profile-role-tag" style={{ fontSize: '0.7rem', textTransform: 'lowercase', padding: '1px 5px' }}>
                    {user.role === 'RECRUITER' ? 'recruiter' : user.role === 'ADMIN' ? 'admin' : 'seeker'}
                  </span>
                </div>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
                <LogOut size={16} /> Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
