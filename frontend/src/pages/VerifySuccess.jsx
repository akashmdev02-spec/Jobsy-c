import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function VerifySuccess() {
  return (
    <div className="auth-page" style={{ minHeight: 'calc(100vh - 70px)' }}>
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ display: 'inline-flex', background: '#dcfce7', color: '#22c55e', padding: '24px', borderRadius: '50%', marginBottom: '24px', animation: 'pulse 2s infinite' }}>
          <CheckCircle size={48} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Email Verified Successfully!</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '32px' }}>
          Thank you for confirming your email address. Your account is now fully active. You can now log in, explore thousands of active job opportunities, or post vacancies.
        </p>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', marginBottom: '32px' }}>
          <ShieldCheck size={24} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Account security activated. Only verified users can access seeker and recruiter workspaces.
          </span>
        </div>

        <Link to="/login" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Proceed to Sign In <ArrowRight size={18} />
        </Link>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>
    </div>
  );
}
