import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import JobCard from '../components/JobCard';
import { Search, MapPin, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  // State matching API query fields
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  
  // Results
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Sync state with URL params on mount/param change
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setLocation(searchParams.get('location') || '');
    setType(searchParams.get('type') || '');
    setCurrentPage(parseInt(searchParams.get('page')) || 0);
  }, [searchParams]);

  // Fetch jobs
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const res = await api.getJobs({
          q,
          location,
          type,
          page: currentPage,
          size: 10
        });
        
        setJobs(res.content || []);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);

        // Load saved jobs list for seeker
        if (user && user.role === 'JOB_SEEKER') {
          const saved = await api.getSavedJobs();
          setSavedJobIds(new Set(saved.map(sj => sj.job?.id || sj.jobId)));
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
        showToast('Error loading jobs. Please check your network.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [q, location, type, currentPage, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams(0);
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);
    
    // Update url
    const newParams = new URLSearchParams(searchParams);
    if (selectedType) {
      newParams.set('type', selectedType);
    } else {
      newParams.delete('type');
    }
    newParams.set('page', '0'); // reset page
    setSearchParams(newParams);
  };

  const updateUrlParams = (pageIndex) => {
    const newParams = new URLSearchParams();
    if (q) newParams.set('q', q);
    if (location) newParams.set('location', location);
    if (type) newParams.set('type', type);
    newParams.set('page', pageIndex.toString());
    setSearchParams(newParams);
  };

  const handlePageChange = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
      updateUrlParams(pageIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    setQ('');
    setLocation('');
    setType('');
    setCurrentPage(0);
    setSearchParams({});
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
      showToast(err.message || 'Failed to save job', 'error');
    }
  };

  return (
    <div className="container">
      <div className="search-page-layout">
        
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> Filters
            </h2>
            {(q || location || type) && (
              <button 
                onClick={handleClearFilters} 
                className="btn-outline" 
                style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
              >
                Clear All
              </button>
            )}
          </div>

          <form onSubmit={handleSearchSubmit}>
            <div className="filter-group">
              <label className="form-label" htmlFor="jobs-search-q">Keywords</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  id="jobs-search-q"
                  className="form-input" 
                  placeholder="Job title or skills..." 
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="form-label" htmlFor="jobs-search-location">Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  id="jobs-search-location"
                  className="form-input" 
                  placeholder="City or Remote..." 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }}>
              Apply Filters
            </button>
          </form>

          <div className="filter-group">
            <h3 className="filter-title">Employment Type</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'All Types', value: '' },
                { label: 'Full-time', value: 'Full-time' },
                { label: 'Part-time', value: 'Part-time' },
                { label: 'Contract', value: 'Contract' },
                { label: 'Internship', value: 'Internship' }
              ].map((item) => (
                <label key={item.label} className="checkbox-label" style={{ fontWeight: type === item.value ? '600' : 'normal' }}>
                  <input 
                    type="radio" 
                    name="employmentType"
                    value={item.value}
                    checked={type === item.value}
                    onChange={handleTypeChange}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Available Jobs</h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                Found {totalElements} {totalElements === 1 ? 'job opportunity' : 'job opportunities'}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
              Searching for matched roles...
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>No jobs match your search filters.</p>
              <button onClick={handleClearFilters} className="btn btn-secondary">Clear Search Filters</button>
            </div>
          ) : (
            <>
              <div className="jobs-grid" style={{ gridTemplateColumns: '1fr' }}>
                {jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    isSaved={savedJobIds.has(job.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="pagination-btn"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx)}
                      className={`pagination-btn ${currentPage === idx ? 'active' : ''}`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="pagination-btn"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
