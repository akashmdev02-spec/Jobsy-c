import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, DollarSign, Briefcase, Bookmark, Calendar, ChevronLeft, ArrowRight, Building, CheckCircle, FileText, Send, X } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submittingApp, setSubmittingApp] = useState(false);

  useEffect(() => {
    async function loadJobDetails() {
      setLoading(true);
      try {
        const jobData = await api.getJob(id);
        setJob(jobData);

        if (user && user.role === 'JOB_SEEKER') {
          // Check if saved
          const savedJobs = await api.getSavedJobs();
          const savedIds = savedJobs.map(sj => sj.job?.id || sj.jobId);
          setIsSaved(savedIds.includes(jobData.id));

          // Check if applied
          const applications = await api.getMyApplications();
          const matchedApp = applications.find(app => (app.job?.id || app.jobId) === jobData.id);
          if (matchedApp) {
            setHasApplied(true);
            setApplicationStatus(matchedApp.status);
          }
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        showToast('Error loading job details.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadJobDetails();
  }, [id, user]);

  useEffect(() => {
    if (user) {
      setResumeUrl(user.resumeUrl || '');
    }
  }, [user]);

  const handleToggleSave = async () => {
    if (!user) {
      showToast('Please sign in to save this job', 'error');
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await api.unsaveJob(job.id);
        setIsSaved(false);
        showToast('Job removed from saved list', 'success');
      } else {
        await api.saveJob(job.id);
        setIsSaved(true);
        showToast('Job saved successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle save status', 'error');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmittingApp(true);
    try {
      let finalResumeUrl = resumeUrl;

      // Handle real file uploading to port 8080 uploads endpoint
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);

        const token = localStorage.getItem('token');
        const uploadRes = await fetch('http://localhost:8080/api/uploads', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(errText || 'Failed to upload resume file.');
        }

        const uploadData = await uploadRes.json();
        finalResumeUrl = uploadData.url;
      }

      await api.applyJob(job.id, { coverLetter, resumeUrl: finalResumeUrl });
      setHasApplied(true);
      setApplicationStatus('APPLIED');
      setShowApplyModal(false);
      showToast('Application submitted successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setSubmittingApp(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not Disclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} per year`;
    return min ? `$${min.toLocaleString()}+` : `Up to $${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading job specifications...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Job listing not found</h2>
        <p style={{ margin: '16px 0 24px', color: 'var(--color-text-secondary)' }}>The opportunity may have been removed or filled.</p>
        <Link to="/jobs" className="btn btn-primary">Back to Explore Jobs</Link>
      </div>
    );
  }

  const initialOfCompany = job.company && job.company.name 
    ? job.company.name.charAt(0).toUpperCase() 
    : 'J';

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 250px)' }}>
      {/* Back button link */}
      <div style={{ padding: '24px 0 8px' }}>
        <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
          <ChevronLeft size={16} /> Back to Listings
        </Link>
      </div>

      <div className="detail-page-layout">
        
        {/* Main Job details column */}
        <article>
          <div className="job-detail-header">
            <div className="company-logo">
              {initialOfCompany}
            </div>
            
            <div className="job-detail-title-group">
              <h1>{job.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="job-card-company" style={{ fontSize: '1.1rem' }}>{job.company?.name || 'Unknown Company'}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {job.location || 'Remote'}
                </span>
              </div>
            </div>

            <div className="job-detail-meta">
              <div className="job-card-detail-item">
                <Briefcase size={16} />
                <strong>Employment Type:</strong> <span>{job.employmentType || 'Full-time'}</span>
              </div>
              <div className="job-card-detail-item">
                <Calendar size={16} />
                <strong>Experience Level:</strong> <span>{job.experienceLevel || 'Not specified'}</span>
              </div>
              <div className="job-card-detail-item">
                <DollarSign size={16} />
                <strong>Salary Range:</strong> <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
            </div>

            <div className="job-detail-actions">
              {/* Seeker options */}
              {user && user.role === 'JOB_SEEKER' && (
                <>
                  {hasApplied ? (
                    <button className="btn btn-secondary" disabled style={{ opacity: 0.8, cursor: 'not-allowed', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} /> Applied ({applicationStatus})
                    </button>
                  ) : (
                    <button onClick={() => setShowApplyModal(true)} className="btn btn-primary">
                      Apply for Job <ArrowRight size={16} />
                    </button>
                  )}
                  
                  <button onClick={handleToggleSave} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                    {isSaved ? 'Saved' : 'Save Job'}
                  </button>
                </>
              )}

              {/* Guest options */}
              {!user && (
                <>
                  <Link to="/login" className="btn btn-primary">
                    Sign In to Apply <ArrowRight size={16} />
                  </Link>
                  <button onClick={handleToggleSave} className="btn btn-secondary">
                    <Bookmark size={18} /> Save Job
                  </button>
                </>
              )}

              {/* Recruiter view */}
              {user && user.role === 'RECRUITER' && (
                <div style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                  Viewing as Recruiter. Recruiters cannot apply to jobs.
                </div>
              )}
            </div>
          </div>

          <div className="job-detail-body">
            <div className="detail-section">
              <h2>Job Description</h2>
              <div style={{ whiteSpace: 'pre-line', color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
                {job.description}
              </div>
            </div>

            {job.skills && (
              <div className="detail-section">
                <h2>Target Skills & Competencies</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {job.skills.split(',').map((skill, index) => (
                    <span key={index} className="skill-chip" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Sidebar Info column */}
        <aside className="detail-sidebar">
          {job.company && (
            <div className="sidebar-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} /> About Company
              </h3>
              <h4 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '8px' }}>{job.company.name}</h4>
              {job.company.description && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.company.description}
                </p>
              )}
              
              {job.company.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  <MapPin size={14} /> <strong>Headquarters:</strong> {job.company.location}
                </div>
              )}
              {job.company.website && (
                <div style={{ fontSize: '0.875rem', marginTop: '12px' }}>
                  <a href={job.company.website.startsWith('http') ? job.company.website : `https://${job.company.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'block', textAlign: 'center', padding: '8px' }}>
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="sidebar-card" style={{ background: 'var(--gradient-primary)', color: '#ffffff' }}>
            <h3 style={{ color: '#ffffff' }}>Safety Warning</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Never provide credit card or bank details, or pay fees when applying for jobs. Naukri will never ask you for money to secure interviews or selections.
            </p>
          </div>
        </aside>
      </div>

      {/* Application Cover Letter Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowApplyModal(false)}>
              <X size={20} />
            </button>
            <h2 className="modal-title">Apply for {job.title}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Submit an optional cover letter. Your profile and contact information will be sent directly to <strong>{job.company?.name}</strong>.
            </p>
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

            <div className="form-group">
              <label className="form-label" htmlFor="profile-resumefile">Or Upload Resume File</label>
              <input 
                type="file" 
                id="profile-resumefile"
                className="form-input"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setResumeFile(file);
                    setResumeUrl(`File Selected: ${file.name}`);
                    showToast(`Resume file "${file.name}" selected! It will be uploaded on application submission.`, 'success');
                  }
                }}
              />
            </div>
            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="cover-letter-input">Cover Letter / Pitch</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                  <textarea 
                    id="cover-letter-input"
                    className="form-textarea" 
                    placeholder="Describe why you are a great fit for this position..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    style={{ paddingLeft: '44px', paddingTop: '10px' }}
                  />
                </div>
              </div>
              

              <div style={{ display: 'flex', justifySelf: 'end', gap: '12px' }}>
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingApp} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={16} /> {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
