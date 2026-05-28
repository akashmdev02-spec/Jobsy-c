import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import JobCard from '../components/JobCard';
import { Search, MapPin, Briefcase, ArrowRight, TrendingUp, Users, Building2 } from 'lucide-react';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [latestJobs, setLatestJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load latest jobs and saved jobs list
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Load latest jobs (page 0, size 6)
        const jobPage = await api.getJobs({ page: 0, size: 6 });
        setLatestJobs(jobPage.content || []);

        // Load saved jobs if seeker is logged in
        if (user && user.role === 'JOB_SEEKER') {
          const saved = await api.getSavedJobs();
          setSavedJobIds(new Set(saved.map(sj => sj.job?.id || sj.jobId)));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (keyword) query.append('q', keyword);
    if (location) query.append('location', location);
    navigate(`/jobs?${query.toString()}`);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/jobs?q=${encodeURIComponent(categoryName)}`);
  };

  const handleToggleSave = async (jobId) => {
    try {
      if (savedJobIds.has(jobId)) {
        await api.unsaveJob(jobId);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        showToast('Job removed from saved list', 'success');
      } else {
        await api.saveJob(jobId);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        showToast('Job saved successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle save status', 'error');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">Discover Your Next Career Breakthrough</h1>
          <p className="hero-subtitle">Explore thousands of curated listings, connect with top companies, and fast-track your future.</p>

          <form onSubmit={handleSearchSubmit} className="search-container">
            <div className="search-field">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Job title, keywords, or skills..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            
            <div className="search-field">
              <MapPin size={20} />
              <input 
                type="text" 
                placeholder="City, state, or 'Remote'..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
              Find Jobs
            </button>
          </form>

          {/* Quick chips */}
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>Popular Searches:</span>
            {['React', 'Java', 'Remote', 'Product Manager', 'Data Analyst'].map((tech) => (
              <button 
                key={tech} 
                onClick={() => handleCategoryClick(tech)}
                className="skill-chip"
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px' }}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Info Stats Cards */}
      <section style={{ padding: '60px 0 20px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '16px', borderRadius: '12px' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>12,000+ Active Jobs</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Updated daily with premium career openings.</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: '#dcfce7', color: '#22c55e', padding: '16px', borderRadius: '12px' }}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>500+ Top Companies</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Directly hiring verified roles on our platform.</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: '#fef9c3', color: '#eab308', padding: '16px', borderRadius: '12px' }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Role-based Portals</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Dedicated modules for seekers and recruiters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="jobs-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Latest Job Openings</h2>
              <p className="section-subtitle">Discover some of the newest opportunities posted recently</p>
            </div>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)', fontWeight: '600' }}>
              Explore All Jobs <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
              Loading opportunities...
            </div>
          ) : latestJobs.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>No jobs posted yet.</p>
              {user && user.role === 'RECRUITER' && (
                <Link to="/dashboard" className="btn btn-primary">Post the First Job</Link>
              )}
            </div>
          ) : (
            <div className="jobs-grid">
              {latestJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  isSaved={savedJobIds.has(job.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
