import React from 'react';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Briefcase size={24} /> Jobsy
            </h3>
            <p style={{ maxWidth: '300px', fontSize: '0.875rem', color: '#94a3b8' }}>
              Jobsy is a premium job search portal designed to bridge the gap between talented job seekers and recruiting companies globally.
            </p>
          </div>
          <div className="footer-column">
            <h4>For Seekers</h4>
            <ul>
              <li><a href="/jobs">Browse Jobs</a></li>
              <li><a href="/dashboard">My Applications</a></li>
              <li><a href="/dashboard">Saved Jobs</a></li>
              <li><a href="/profile">My Profile</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>For Recruiters</h4>
            <ul>
              <li><a href="/dashboard">Post a Job</a></li>
              <li><a href="/dashboard">Manage Applications</a></li>
              <li><a href="/dashboard">Manage Companies</a></li>
              <li><a href="/dashboard">Talent Pool</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Contact</h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '8px' }}>support@jobsy-clone.com</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>1-800-123-JOB-PORTAL</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy;{new Date().getFullYear()} Jobsy Inc. Copyright Policy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
