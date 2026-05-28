import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('JOB_SEEKER'); // JOB_SEEKER or RECRUITER
  const [loadingForm, setLoadingForm] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoadingForm(true);
    try {
      await register(fullName, email, password, role, phone);
      showToast('Account created successfully! A confirmation link has been sent to your email. Please verify your email before logging in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Registration failed. Try a different email.', 'error');
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join us to find your next opportunity or post jobs</p>
        </div>

        <div className="auth-toggle-role">
          <button 
            type="button"
            className={`role-btn ${role === 'JOB_SEEKER' ? 'active' : ''}`}
            onClick={() => setRole('JOB_SEEKER')}
          >
            Job Seeker
          </button>
          <button 
            type="button"
            className={`role-btn ${role === 'RECRUITER' ? 'active' : ''}`}
            onClick={() => setRole('RECRUITER')}
          >
            Recruiter
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-fullname">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#94a3b8' 
                }} 
              />
              <input 
                type="text" 
                id="register-fullname"
                className="form-input" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#94a3b8' 
                }} 
              />
              <input 
                type="email" 
                id="register-email"
                className="form-input" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password (min 6 characters) *</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#94a3b8' 
                }} 
              />
              <input 
                type="password" 
                id="register-password"
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-phone">Phone Number (Optional)</label>
            <div style={{ position: 'relative' }}>
              <Phone 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#94a3b8' 
                }} 
              />
              <input 
                type="tel" 
                id="register-phone"
                className="form-input" 
                placeholder="+1 (555) 000-0000" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loadingForm}
          >
            {loadingForm ? (
              <span>Registering...</span>
            ) : (
              <>
                <UserPlus size={18} /> Register as {role === 'JOB_SEEKER' ? 'Seeker' : 'Recruiter'}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
