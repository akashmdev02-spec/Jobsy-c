import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Bookmark, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JobCard({ job, isSaved, onToggleSave, hideSaveButton = false }) {
  const { user } = useAuth();
  
  // Format salary
  const formatSalary = (min, max) => {
  const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);

  if (!min && !max) return 'Not Disclosed';
  if (min && max) return `${formatINR(min)} - ${formatINR(max)}`;
  return min ? `${formatINR(min)}+` : `Up to ${formatINR(max)}`;
};

  // Split skills
  const skillsArray = job.skills 
    ? job.skills.split(',').map(s => s.trim()).filter(Boolean) 
    : [];

  const initialOfCompany = job.company && job.company.name 
    ? job.company.name.charAt(0).toUpperCase() 
    : 'J';

  return (
    <div className="job-card">
      <div>
        <div className="job-card-header">
          <div className="company-logo">
            {initialOfCompany}
          </div>
          <div className="job-card-title-group">
            <Link to={`/jobs/${job.id}`}>
              <h3>{job.title}</h3>
            </Link>
            <div className="job-card-company">{job.company?.name || 'Unknown Company'}</div>
          </div>
        </div>

        <div className="job-card-details">
          <div className="job-card-detail-item">
            <MapPin size={14} />
            <span>{job.location || 'Remote'}</span>
          </div>
          <div className="job-card-detail-item">
            <Briefcase size={14} />
            <span>{job.employmentType || 'Full-time'}</span>
          </div>
          {job.experienceLevel && (
            <div className="job-card-detail-item">
              <Calendar size={14} />
              <span>{job.experienceLevel}</span>
            </div>
          )}
        </div>

        {skillsArray.length > 0 && (
          <div className="job-card-skills">
            {skillsArray.slice(0, 4).map((skill, index) => (
              <span key={index} className="skill-chip">{skill}</span>
            ))}
            {skillsArray.length > 4 && (
              <span className="skill-chip">+{skillsArray.length - 4} more</span>
            )}
          </div>
        )}
      </div>

      <div className="job-card-footer">
        <div className="job-card-salary">
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.95rem' }}>
            
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && user.role === 'JOB_SEEKER' && !hideSaveButton && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(job.id);
              }} 
              className="btn-icon"
              title={isSaved ? "Unsave Job" : "Save Job"}
              style={{ color: isSaved ? '#2563eb' : '#94a3b8' }}
            >
              <Bookmark size={20} fill={isSaved ? '#2563eb' : 'none'} />
            </button>
          )}
          <Link to={`/jobs/${job.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
