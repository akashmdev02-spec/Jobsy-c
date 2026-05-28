import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { User, Phone, Briefcase, FileText, Save } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If auth is done loading and no user, send to login
    if (!loading && !user) {
      navigate('/login');
    }

    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setHeadline(user.headline || '');
      setResumeUrl(user.resumeUrl || '');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) {
      showToast('Full name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.updateMe({
        fullName,
        phone,
        headline,
        resumeUrl,
      });
      await refreshProfile();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Verifying user credentials...
      </div>
    );
  }

  const initialOfUser = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 250px)' }}>
      <div className="profile-layout">
        
        <div className="profile-header">
          <div className="profile-avatar">
            {initialOfUser}
          </div>
          <div className="profile-title-group">
            <h2>{user.fullName}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '8px' }}>{user.email}</p>
            <span className="profile-role-tag">{user.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-fullname">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                id="profile-fullname"
                className="form-input" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="tel" 
                id="profile-phone"
                className="form-input" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          {/* Job seeker specific profile fields */}
          {user.role === 'JOB_SEEKER' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-headline">Professional Headline</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    id="profile-headline"
                    className="form-input" 
                    placeholder="e.g. Senior Java Developer with 5 years experience"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-resumeurl">Resume URL</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="url" 
                    id="profile-resumeurl"
                    className="form-input" 
                    placeholder="e.g. https://drive.google.com/your-resume.pdf"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={saving}
          >
            <Save size={18} /> {saving ? 'Saving changes...' : 'Save Profile Details'}
          </button>
        </form>

      </div>
    </div>
  );
}
