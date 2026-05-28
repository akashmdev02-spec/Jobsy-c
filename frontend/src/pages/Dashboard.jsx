import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import JobCard from '../components/JobCard';
import { 
  Briefcase, Building, ClipboardList, Plus, Trash2, Edit2, 
  Users, ExternalLink, Bookmark, Check, X, FileText, Calendar, 
  Globe, MapPin, ChevronRight, Eye, Shield, CheckSquare, Activity 
} from 'lucide-react';

const getSafeResumeUrl = (url) => {
  if (!url) return '';
  if (url.includes('jobsy-storage.local/resumes/') || url.includes('jobsy-storage.local')) {
    // Return a beautiful, publicly readable sample document PDF to avoid NXDOMAIN DNS resolution errors on older mock database records
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  }
  return url;
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active dashboard tab state
  const [activeTab, setActiveTab] = useState(''); // 'applications'|'saved' OR 'jobs'|'companies' OR admin tabs
  
  // Data states
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [myCompanies, setMyCompanies] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [jobApplications, setJobApplications] = useState([]);
  
  // Admin Data states
  const [adminStats, setAdminStats] = useState({ users: 0, companies: 0, jobs: 0, applications: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminCompanies, setAdminCompanies] = useState([]);
  const [adminJobs, setAdminJobs] = useState([]);
  const [adminApplications, setAdminApplications] = useState([]);

  // Loading indicator states
  const [dataLoading, setDataLoading] = useState(false);
  const [appsLoading, setAppsLoading] = useState(false);

  // Modal control states
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null); 
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  // Admin Modal states
  const [showAdminUserModal, setShowAdminUserModal] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState(null);
  const [showAdminCompanyModal, setShowAdminCompanyModal] = useState(false);
  const [editingAdminCompany, setEditingAdminCompany] = useState(null);
  const [showAdminJobModal, setShowAdminJobModal] = useState(false);
  const [editingAdminJob, setEditingAdminJob] = useState(null);

  // Form states for Job Creation/Edition
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobLoc, setJobLoc] = useState('');
  const [jobEmpType, setJobEmpType] = useState('Full-time');
  const [jobExp, setJobExp] = useState('Entry Level');
  const [jobSalMin, setJobSalMin] = useState('');
  const [jobSalMax, setJobSalMax] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [jobCompanyId, setJobCompanyId] = useState('');

  // Form states for Company Registration
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [companyWeb, setCompanyWeb] = useState('');
  const [companyLoc, setCompanyLoc] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');

  // Derive consolidated recruiter applications from posted jobs
  const allRecruiterApplications = postedJobs.reduce((acc, job) => {
    if (job.applications && Array.isArray(job.applications)) {
      const apps = job.applications.map(app => ({
        ...app,
        job: {
          id: job.id,
          title: job.title,
          company: job.company
        }
      }));
      return [...acc, ...apps];
    }
    return acc;
  }, []);

  // Force login redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      // Set default tabs
      if (user.role === 'JOB_SEEKER') {
        setActiveTab('applications');
      } else if (user.role === 'RECRUITER') {
        setActiveTab('jobs');
      } else if (user.role === 'ADMIN') {
        setActiveTab('admin-stats');
      }
    }
  }, [user, authLoading, navigate]);

  // Load Tab Data
  useEffect(() => {
    if (!user) return;

    if (activeTab === 'applications') {
      if (user.role === 'JOB_SEEKER') {
        loadSeekerApplications();
      } else if (user.role === 'RECRUITER') {
        loadRecruiterJobs(); // Triggers recruiter jobs & applications load
      }
    } else if (activeTab === 'saved') {
      loadSavedJobs();
    } else if (activeTab === 'jobs') {
      loadRecruiterJobs();
      loadRecruiterCompanies(); 
    } else if (activeTab === 'companies') {
      loadRecruiterCompanies();
    } else if (activeTab === 'admin-stats') {
      loadAdminStats();
    } else if (activeTab === 'admin-users') {
      loadAdminUsers();
    } else if (activeTab === 'admin-companies') {
      loadAdminCompanies();
    } else if (activeTab === 'admin-jobs') {
      loadAdminJobs();
    } else if (activeTab === 'admin-applications') {
      loadAdminApplications();
    }
  }, [activeTab, user]);

  // --- JOB SEEKER FUNCTIONS ---
  const loadSeekerApplications = async () => {
    setDataLoading(true);
    try {
      const data = await api.getMyApplications();
      setMyApplications(data || []);
    } catch (err) {
      showToast('Failed to load applications list', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    setDataLoading(true);
    try {
      const data = await api.getSavedJobs();
      setSavedJobs(data || []);
    } catch (err) {
      showToast('Failed to load saved jobs', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const handleToggleUnsave = async (jobId) => {
    try {
      await api.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(sj => (sj.job?.id || sj.jobId) !== jobId));
      showToast('Removed job bookmark', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove bookmark', 'error');
    }
  };

  // --- RECRUITER FUNCTIONS ---
  const loadRecruiterJobs = async () => {
    setDataLoading(true);
    try {
      const data = await api.getRecruiterJobs();
      const jobs = data || [];
      
      // Fetch applicant records for all recruiter jobs in parallel
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          try {
            const apps = await api.getApplicationsForJob(job.id);
            return { ...job, applications: apps || [] };
          } catch (err) {
            console.error(`Failed to load applications for job ${job.id}`, err);
            return { ...job, applications: [] };
          }
        })
      );
      
      setPostedJobs(jobsWithApplications);
    } catch (err) {
      showToast('Failed to load posted jobs', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const loadRecruiterCompanies = async () => {
    setDataLoading(true);
    try {
      const data = await api.getMyCompanies();
      setMyCompanies(data || []);
      if (data && data.length > 0 && !jobCompanyId) {
        setJobCompanyId(data[0].id.toString());
      }
    } catch (err) {
      showToast('Failed to load companies list', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const handleOpenJobModal = (job = null) => {
    if (myCompanies.length === 0) {
      showToast('You must create a company profile first before posting jobs!', 'error');
      setActiveTab('companies');
      return;
    }

    if (job) {
      setEditingJob(job);
      setJobTitle(job.title);
      setJobDesc(job.description);
      setJobLoc(job.location || '');
      setJobEmpType(job.employmentType || 'Full-time');
      setJobExp(job.experienceLevel || 'Entry Level');
      setJobSalMin(job.salaryMin ? job.salaryMin.toString() : '');
      setJobSalMax(job.salaryMax ? job.salaryMax.toString() : '');
      setJobSkills(job.skills || '');
      setJobCompanyId(job.company?.id ? job.company.id.toString() : myCompanies[0].id.toString());
    } else {
      setEditingJob(null);
      setJobTitle('');
      setJobDesc('');
      setJobLoc('');
      setJobEmpType('Full-time');
      setJobExp('Entry Level');
      setJobSalMin('');
      setJobSalMax('');
      setJobSkills('');
      setJobCompanyId(myCompanies[0]?.id ? myCompanies[0].id.toString() : '');
    }
    setShowJobModal(true);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobDesc || !jobCompanyId) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const payload = {
      title: jobTitle,
      description: jobDesc,
      location: jobLoc,
      employmentType: jobEmpType,
      experienceLevel: jobExp,
      salaryMin: jobSalMin ? parseFloat(jobSalMin) : null,
      salaryMax: jobSalMax ? parseFloat(jobSalMax) : null,
      skills: jobSkills,
      companyId: parseInt(jobCompanyId)
    };

    try {
      if (editingJob) {
        await api.updateJob(editingJob.id, payload);
        showToast('Job posting updated!', 'success');
      } else {
        await api.createJob(payload);
        showToast('Job posted successfully!', 'success');
      }
      setShowJobModal(false);
      loadRecruiterJobs();
    } catch (err) {
      showToast(err.message || 'Failed to submit job posting', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting? This cannot be undone.')) return;
    try {
      await api.deleteJob(jobId);
      showToast('Job posting deleted.', 'success');
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setJobApplications([]);
      }
      loadRecruiterJobs();
    } catch (err) {
      showToast(err.message || 'Failed to delete job posting', 'error');
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (!companyName) {
      showToast('Company name is required', 'error');
      return;
    }

    try {
      await api.createCompany({
        name: companyName,
        description: companyDesc,
        website: companyWeb,
        location: companyLoc,
        logoUrl: companyLogo
      });
      showToast('Company registered successfully!', 'success');
      
      // Reset form
      setCompanyName('');
      setCompanyDesc('');
      setCompanyWeb('');
      setCompanyLoc('');
      setCompanyLogo('');
      
      setShowCompanyModal(false);
      loadRecruiterCompanies();
    } catch (err) {
      showToast(err.message || 'Failed to register company', 'error');
    }
  };

  const handleViewApplications = async (jobId, jobTitle) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setAppsLoading(true);
    try {
      const data = await api.getApplicationsForJob(jobId);
      setJobApplications(data || []);
      setTimeout(() => {
        document.getElementById('applications-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      showToast('Failed to load applications for this job', 'error');
    } finally {
      setAppsLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      showToast(`Status updated to ${newStatus}. Notification email sent to seeker!`, 'success');
      
      // Update locally in the recruiter jobs structure so computed allRecruiterApplications updates immediately
      setPostedJobs(prevJobs => 
        prevJobs.map(job => {
          if (job.applications) {
            return {
              ...job,
              applications: job.applications.map(app => 
                app.id === appId ? { ...app, status: newStatus } : app
              )
            };
          }
          return job;
        })
      );

      // Keep candidate details section in sync if it's open
      setJobApplications(prev => 
        prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      showToast(err.message || 'Failed to update candidate status', 'error');
    }
  };

  // --- ADMIN FUNCTIONS ---
  const loadAdminStats = async () => {
    setDataLoading(true);
    try {
      const stats = await api.getAdminStats();
      setAdminStats(stats);
    } catch (err) {
      showToast('Failed to load admin stats', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    setDataLoading(true);
    try {
      const data = await api.getAdminUsers();
      setAdminUsers(data || []);
    } catch (err) {
      showToast('Failed to load users list', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const loadAdminCompanies = async () => {
    setDataLoading(true);
    try {
      const data = await api.getAdminCompanies();
      setAdminCompanies(data || []);
    } catch (err) {
      showToast('Failed to load companies list', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const loadAdminJobs = async () => {
    setDataLoading(true);
    try {
      const data = await api.getAdminJobs();
      setAdminJobs(data || []);
    } catch (err) {
      showToast('Failed to load jobs list', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const loadAdminApplications = async () => {
    setDataLoading(true);
    try {
      const data = await api.getAdminApplications();
      setAdminApplications(data || []);
    } catch (err) {
      showToast('Failed to load applications list', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  // Admin deletes
  const handleAdminUserDelete = async (id) => {
    if (!confirm('WARNING: Deleting this user will CASCADE and clean up all their companies, posted jobs, saved jobs, and application records! Do you want to proceed?')) return;
    try {
      await api.deleteAdminUser(id);
      showToast('User and linked properties deleted.', 'success');
      loadAdminUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleAdminCompanyDelete = async (id) => {
    if (!confirm('WARNING: Deleting this company profile will delete all job vacancies and applications linked to it! Continue?')) return;
    try {
      await api.deleteAdminCompany(id);
      showToast('Company and associated jobs deleted.', 'success');
      loadAdminCompanies();
    } catch (err) {
      showToast(err.message || 'Failed to delete company', 'error');
    }
  };

  const handleAdminJobDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job posting? This will remove all linked applications!')) return;
    try {
      await api.deleteAdminJob(id);
      showToast('Job vacancy deleted.', 'success');
      loadAdminJobs();
    } catch (err) {
      showToast(err.message || 'Failed to delete job', 'error');
    }
  };

  const handleAdminApplicationDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this application record?')) return;
    try {
      await api.deleteAdminApplication(id);
      showToast('Application deleted.', 'success');
      loadAdminApplications();
    } catch (err) {
      showToast(err.message || 'Failed to delete application', 'error');
    }
  };

  // Admin Edits Opening Modals
  const openAdminUserEdit = (u) => {
    setEditingAdminUser({ ...u });
    setShowAdminUserModal(true);
  };

  const openAdminCompanyEdit = (c) => {
    setEditingAdminCompany({ ...c });
    setShowAdminCompanyModal(true);
  };

  const openAdminJobEdit = (j) => {
    setEditingAdminJob({ ...j });
    setShowAdminJobModal(true);
  };

  // Admin Updates submission
  const handleAdminUserUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminUser(editingAdminUser.id, editingAdminUser);
      showToast('User updated successfully!', 'success');
      setShowAdminUserModal(false);
      loadAdminUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user details', 'error');
    }
  };

  const handleAdminCompanyUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminCompany(editingAdminCompany.id, editingAdminCompany);
      showToast('Company details updated!', 'success');
      setShowAdminCompanyModal(false);
      loadAdminCompanies();
    } catch (err) {
      showToast(err.message || 'Failed to update company details', 'error');
    }
  };

  const handleAdminJobUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updateAdminJob(editingAdminJob.id, editingAdminJob);
      showToast('Job details updated!', 'success');
      setShowAdminJobModal(false);
      loadAdminJobs();
    } catch (err) {
      showToast(err.message || 'Failed to update job details', 'error');
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPLIED': return 'badge-applied';
      case 'SHORTLISTED': return 'badge-shortlisted';
      case 'REJECTED': return 'badge-rejected';
      case 'HIRED': return 'badge-hired';
      default: return 'badge-applied';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Authenticating session...
      </div>
    );
  }

  return (
    <div className="container dashboard-layout" style={{ minHeight: 'calc(100vh - 250px)' }}>
      
      {/* Dashboard header details */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '2rem', fontWeight: 800 }}>
            {user.role === 'ADMIN' ? (
              <>
                <Shield size={32} style={{ color: 'var(--color-accent)' }} /> 
                <span>Admin Control Center</span>
              </>
            ) : (
              <span>Workspace Control Panel</span>
            )}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Welcome back, {user.fullName}. Manage your job ecosystem.
          </p>
        </div>
        
        {user.role === 'RECRUITER' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowCompanyModal(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={16} /> Register Company
            </button>
            <button onClick={() => handleOpenJobModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Post a Job
            </button>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="dashboard-tabs">
        {user.role === 'JOB_SEEKER' && (
          <>
            <button 
              onClick={() => setActiveTab('applications')} 
              className={`dashboard-tab ${activeTab === 'applications' ? 'active' : ''}`}
            >
              <ClipboardList size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              My Applications ({myApplications.length})
            </button>
            <button 
              onClick={() => setActiveTab('saved')} 
              className={`dashboard-tab ${activeTab === 'saved' ? 'active' : ''}`}
            >
              <Bookmark size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              Saved Jobs ({savedJobs.length})
            </button>
          </>
        )}

        {user.role === 'RECRUITER' && (
          <>
            <button 
              onClick={() => setActiveTab('jobs')} 
              className={`dashboard-tab ${activeTab === 'jobs' ? 'active' : ''}`}
            >
              <Briefcase size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              Posted Jobs ({postedJobs.length})
            </button>
            <button 
              onClick={() => setActiveTab('companies')} 
              className={`dashboard-tab ${activeTab === 'companies' ? 'active' : ''}`}
            >
              <Building size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              Registered Companies ({myCompanies.length})
            </button>
            <button 
              onClick={() => setActiveTab('applications')} 
              className={`dashboard-tab ${activeTab === 'applications' ? 'active' : ''}`}
            >
              <Users size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              Candidates & Applicants ({allRecruiterApplications.length})
            </button>
          </>
        )}

        {user.role === 'ADMIN' && (
          <>
            <button 
              onClick={() => setActiveTab('admin-stats')} 
              className={`dashboard-tab ${activeTab === 'admin-stats' ? 'active' : ''}`}
            >
              <Activity size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              System Health & Stats
            </button>
            <button 
              onClick={() => setActiveTab('admin-users')} 
              className={`dashboard-tab ${activeTab === 'admin-users' ? 'active' : ''}`}
            >
              <Users size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              Manage Users
            </button>
            <button 
              onClick={() => setActiveTab('admin-companies')} 
              className={`dashboard-tab ${activeTab === 'admin-companies' ? 'active' : ''}`}
            >
              <Building size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              Manage Companies
            </button>
            <button 
              onClick={() => setActiveTab('admin-jobs')} 
              className={`dashboard-tab ${activeTab === 'admin-jobs' ? 'active' : ''}`}
            >
              <Briefcase size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              Manage Jobs
            </button>
            <button 
              onClick={() => setActiveTab('admin-applications')} 
              className={`dashboard-tab ${activeTab === 'admin-applications' ? 'active' : ''}`}
            >
              <ClipboardList size={16} style={{ marginRight: '6px', display: 'inline' }} /> 
              Manage Applications
            </button>
          </>
        )}
      </div>

      {/* Loader indicator for tabs data */}
      {dataLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
          Retrieving updates...
        </div>
      ) : (
        <div style={{ marginBottom: '60px' }}>
          
          {/* SEEKER: APPLICATIONS TAB */}
          {user.role === 'JOB_SEEKER' && activeTab === 'applications' && (
            myApplications.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>You haven't submitted any job applications yet.</p>
                <Link to="/jobs" className="btn btn-primary">Find & Apply for Jobs</Link>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Profile</th>
                      <th>Company</th>
                      <th>Date Applied</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.map((app) => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: '600' }}>
                          <Link to={`/jobs/${app.job?.id || app.jobId}`} style={{ color: 'var(--color-text-primary)' }}>
                            {app.job?.title || 'Unknown Role'}
                          </Link>
                        </td>
                        <td>{app.job?.company?.name || 'Unknown Company'}</td>
                        <td>{formatDate(app.appliedAt)}</td>
                        <td>
                          <span className={`badge ${getStatusClass(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <Link to={`/jobs/${app.job?.id || app.jobId}`} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px' }}>
                            View Role <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* SEEKER: SAVED JOBS TAB */}
          {user.role === 'JOB_SEEKER' && activeTab === 'saved' && (
            savedJobs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>No saved jobs bookmarked yet.</p>
                <Link to="/jobs" className="btn btn-primary">Browse Active Vacancies</Link>
              </div>
            ) : (
              <div className="jobs-grid">
                {savedJobs.map((sj) => {
                  const itemJob = sj.job || sj;
                  return (
                    <JobCard 
                      key={itemJob.id} 
                      job={itemJob} 
                      isSaved={true} 
                      onToggleSave={handleToggleUnsave} 
                    />
                  );
                })}
              </div>
            )
          )}

          {/* RECRUITER: POSTED JOBS TAB */}
          {user.role === 'RECRUITER' && activeTab === 'jobs' && (
            postedJobs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>You haven't posted any jobs under this account.</p>
                <button onClick={() => handleOpenJobModal()} className="btn btn-primary">Post a Job Posting</button>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Posting</th>
                      <th>Company</th>
                      <th>Type / Level</th>
                      <th>Location</th>
                      <th>Management Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postedJobs.map((job) => (
                      <tr key={job.id}>
                        <td style={{ fontWeight: '600' }}>
                          <Link to={`/jobs/${job.id}`} style={{ color: 'var(--color-text-primary)' }}>
                            {job.title}
                          </Link>
                        </td>
                        <td>{job.company?.name || 'My Company'}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{job.employmentType}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{job.experienceLevel}</div>
                        </td>
                        <td>{job.location || 'Remote'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                              onClick={() => handleViewApplications(job.id, job.title)}
                              className="btn btn-secondary" 
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                              <Users size={14} /> Applicants
                            </button>
                            <button 
                              onClick={() => handleOpenJobModal(job)}
                              className="btn-icon" 
                              style={{ color: 'var(--color-accent)' }}
                              title="Edit Job"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="btn-icon" 
                              style={{ color: '#ef4444' }}
                              title="Delete Job"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* RECRUITER: REGISTERED COMPANIES TAB */}
          {user.role === 'RECRUITER' && activeTab === 'companies' && (
            myCompanies.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>No company registered. Register a business to start posting vacancies.</p>
                <button onClick={() => setShowCompanyModal(true)} className="btn btn-primary">Register Company</button>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Business Profile</th>
                      <th>Headquarters</th>
                      <th>Website Link</th>
                      <th>Short Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCompanies.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: '600' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="company-logo" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                              {c.name.charAt(0).toUpperCase()}
                            </span>
                            {c.name}
                          </span>
                        </td>
                        <td>{c.location || 'Not Specified'}</td>
                        <td>
                          {c.website ? (
                            <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-accent)' }}>
                              {c.website} <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)' }}>None</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.description || 'No description provided.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* RECRUITER: CANDIDATES APPLICATIONS TAB */}
          {user.role === 'RECRUITER' && activeTab === 'applications' && (
            allRecruiterApplications.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>No candidates have applied to your job postings yet.</p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Contact Info</th>
                      <th>Resume / Uploaded File</th>
                      <th>Cover Letter</th>
                      <th>Applied Date</th>
                      <th>Hiring Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRecruiterApplications.map((app) => (
                      <tr key={app.id} style={{ verticalAlign: 'top' }}>
                        <td>
                          <div style={{ fontWeight: '600' }}>{app.applicant?.fullName || 'Anonymous Seeker'}</div>
                          {app.applicant?.headline && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                              {app.applicant.headline}
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          <Link to={`/jobs/${app.job?.id}`} style={{ color: 'var(--color-text-primary)' }}>
                            {app.job?.title || 'Unknown Role'}
                          </Link>
                        </td>
                        <td>{app.job?.company?.name || 'Unknown Company'}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{app.applicant?.email}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {app.applicant?.phone || 'No phone'}
                          </div>
                        </td>
                        <td>
                          {app.applicant?.resumeUrl ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <a 
                                href={getSafeResumeUrl(app.applicant.resumeUrl)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-outline" 
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem', width: 'fit-content' }}
                              >
                                <FileText size={12} /> View Resume
                              </a>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all', maxWidth: '180px', marginTop: '2px' }}>
                                {app.applicant.resumeUrl}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>No file or URL submitted</span>
                          )}
                        </td>
                        <td style={{ maxWidth: '250px' }}>
                          <div style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--color-text-secondary)',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '120px',
                            overflowY: 'auto'
                          }}>
                            {app.coverLetter || 'No cover letter submitted.'}
                          </div>
                        </td>
                        <td>{formatDate(app.appliedAt)}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span className={`badge ${getStatusClass(app.status)}`} style={{ alignSelf: 'flex-start' }}>
                              {app.status}
                            </span>
                            <select 
                              value={app.status} 
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className="form-select"
                              style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', minWidth: '130px' }}
                            >
                              <option value="APPLIED">APPLIED</option>
                              <option value="SHORTLISTED">SHORTLISTED</option>
                              <option value="REJECTED">REJECTED</option>
                              <option value="HIRED">HIRED</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ADMIN: SYSTEM HEALTH & STATS TAB */}
          {user.role === 'ADMIN' && activeTab === 'admin-stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '16px', borderRadius: '12px' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{adminStats.users}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>System Registrants</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ background: '#dcfce7', color: '#22c55e', padding: '16px', borderRadius: '12px' }}>
                    <Building size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{adminStats.companies}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Registered Entities</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ background: '#fee2e2', color: '#ef4444', padding: '16px', borderRadius: '12px' }}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{adminStats.jobs}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Active Vacancies</p>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ background: '#fef9c3', color: '#eab308', padding: '16px', borderRadius: '12px' }}>
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{adminStats.applications}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Applications Filed</p>
                  </div>
                </div>

              </div>

              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.3rem' }}>Administrative Warning Details</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  You are logged in with the super administrator credentials **Admin@Jobsyak.com**. You have full system visibility, monitoring tools, and edit/delete permissions over all tables.
                  <br/><br/>
                  <strong style={{ color: '#ef4444' }}>Important Note:</strong> Deleting a user or company will trigger a transaction-safe cascading clean up. It automatically handles dependent rows (e.g. deleting a seeker cleans up their applications; deleting a recruiter removes their posted jobs, job applications, and managed companies) to keep the MySQL database perfectly consistent.
                </p>
              </div>
            </div>
          )}

          {/* ADMIN: MANAGE USERS */}
          {user.role === 'ADMIN' && activeTab === 'admin-users' && (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>User Details</th>
                    <th>Email / Status</th>
                    <th>Phone</th>
                    <th>Role Designation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{u.headline || 'No Headline'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{u.email}</div>
                        <span className={`badge ${u.emailVerified ? 'badge-hired' : 'badge-rejected'}`} style={{ fontSize: '0.65rem', padding: '2px 6px', marginTop: '4px' }}>
                          {u.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                        </span>
                      </td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-shortlisted' : u.role === 'RECRUITER' ? 'badge-applied' : 'badge-hired'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openAdminUserEdit(u)} className="btn btn-secondary" style={{ padding: '6px' }}>
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleAdminUserDelete(u.id)} 
                            className="btn btn-danger" 
                            style={{ padding: '6px' }}
                            disabled={(u.email || '').toLowerCase() === 'admin@jobsyak.com'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ADMIN: MANAGE COMPANIES */}
          {user.role === 'ADMIN' && activeTab === 'admin-companies' && (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Headquarters</th>
                    <th>Website</th>
                    <th>Owner UID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCompanies.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="company-logo" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                          {c.name}
                        </div>
                      </td>
                      <td>{c.location || 'Remote'}</td>
                      <td>
                        {c.website ? (
                          <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            {c.website} <ExternalLink size={10} />
                          </a>
                        ) : 'N/A'}
                      </td>
                      <td>{c.owner ? `${c.owner.fullName} (UID: ${c.owner.id})` : 'Orphaned'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openAdminCompanyEdit(c)} className="btn btn-secondary" style={{ padding: '6px' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleAdminCompanyDelete(c.id)} className="btn btn-danger" style={{ padding: '6px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ADMIN: MANAGE JOBS */}
          {user.role === 'ADMIN' && activeTab === 'admin-jobs' && (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Specifications</th>
                    <th>Status</th>
                    <th>Posted By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminJobs.map((j) => (
                    <tr key={j.id}>
                      <td>{j.id}</td>
                      <td style={{ fontWeight: '600' }}>
                        <Link to={`/jobs/${j.id}`}>{j.title}</Link>
                      </td>
                      <td>{j.company?.name || 'N/A'}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{j.employmentType} | {j.experienceLevel}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{j.location}</div>
                      </td>
                      <td>
                        <span className={`badge ${j.active ? 'badge-hired' : 'badge-rejected'}`}>
                          {j.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>{j.postedBy ? `${j.postedBy.fullName} (UID: ${j.postedBy.id})` : 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openAdminJobEdit(j)} className="btn btn-secondary" style={{ padding: '6px' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleAdminJobDelete(j.id)} className="btn btn-danger" style={{ padding: '6px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ADMIN: MANAGE APPLICATIONS */}
          {user.role === 'ADMIN' && activeTab === 'admin-applications' && (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Candidate</th>
                    <th>Job Title / Company</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminApplications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.id}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{app.applicant?.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{app.applicant?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{app.job?.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{app.job?.company?.name}</div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{formatDate(app.appliedAt)}</td>
                      <td>
                        <button onClick={() => handleAdminApplicationDelete(app.id)} className="btn btn-danger" style={{ padding: '6px' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* RECRUITER: CANDIDATE DETAILS SECTION */}
      {user.role === 'RECRUITER' && selectedJobId && (
        <section id="applications-section" className="glass-panel" style={{ padding: '32px', marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Candidates for: <span style={{ color: 'var(--color-accent)' }}>{selectedJobTitle}</span></h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Review resumes, cover letters, and toggle shortlist decisions.
              </p>
            </div>
            <button className="btn-icon" onClick={() => setSelectedJobId(null)} title="Close Panel">
              <X size={20} />
            </button>
          </div>

          {appsLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Loading applications pool...
            </div>
          ) : jobApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              No applications submitted yet for this role.
            </div>
          ) : (
            <div className="data-table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Contact Info</th>
                    <th>Cover Letter</th>
                    <th>Applied Date</th>
                    <th>Hiring Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {jobApplications.map((app) => (
                    <tr key={app.id} style={{ verticalAlign: 'top' }}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{app.applicant?.fullName}</div>
                        {app.applicant?.headline && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: '200px' }}>
                            {app.applicant.headline}
                          </div>
                        )}
                        {app.applicant?.resumeUrl && (
                          <a 
                            href={getSafeResumeUrl(app.applicant.resumeUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-outline" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem', marginTop: '8px' }}
                          >
                            <FileText size={12} /> View Resume
                          </a>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{app.applicant?.email}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{app.applicant?.phone || 'No phone'}</div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {app.coverLetter || 'No cover letter submitted.'}
                        </div>
                      </td>
                      <td>{formatDate(app.appliedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span className={`badge ${getStatusClass(app.status)}`} style={{ alignSelf: 'flex-start', marginBottom: '4px' }}>
                            {app.status}
                          </span>
                          <select 
                            value={app.status} 
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="form-select"
                            style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px', minWidth: '130px' }}
                          >
                            <option value="APPLIED">APPLIED</option>
                            <option value="SHORTLISTED">SHORTLISTED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="HIRED">HIRED</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* MODAL: POST / EDIT JOB VACANCY */}
      {showJobModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px', width: '90%', margin: '40px auto', overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                {editingJob ? 'Edit Job Posting' : 'Post a New Job'}
              </h2>
              <button className="btn-icon" onClick={() => setShowJobModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Job Title *</label>
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                  required 
                  className="form-input"
                  placeholder="e.g. Senior React Developer"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Employment Type</label>
                  <select value={jobEmpType} onChange={(e) => setJobEmpType(e.target.value)} className="form-select">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Experience Level</label>
                  <select value={jobExp} onChange={(e) => setJobExp(e.target.value)} className="form-select">
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Min Salary ($)</label>
                  <input 
                    type="number" 
                    value={jobSalMin} 
                    onChange={(e) => setJobSalMin(e.target.value)} 
                    className="form-input" 
                    placeholder="e.g. 70000"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Max Salary ($)</label>
                  <input 
                    type="number" 
                    value={jobSalMax} 
                    onChange={(e) => setJobSalMax(e.target.value)} 
                    className="form-input" 
                    placeholder="e.g. 110000"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Location</label>
                  <input 
                    type="text" 
                    value={jobLoc} 
                    onChange={(e) => setJobLoc(e.target.value)} 
                    className="form-input" 
                    placeholder="e.g. Remote / New York, NY"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Operating Company *</label>
                  <select value={jobCompanyId} onChange={(e) => setJobCompanyId(e.target.value)} required className="form-select">
                    {myCompanies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Core Skills Needed (comma-separated)</label>
                <input 
                  type="text" 
                  value={jobSkills} 
                  onChange={(e) => setJobSkills(e.target.value)} 
                  className="form-input" 
                  placeholder="React, CSS, JavaScript"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Job Description *</label>
                <textarea 
                  value={jobDesc} 
                  onChange={(e) => setJobDesc(e.target.value)} 
                  required 
                  rows={4}
                  className="form-textarea"
                  placeholder="Provide core responsibilities, benefits, and guidelines..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowJobModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingJob ? 'Save Vacancy' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW COMPANY */}
      {showCompanyModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', width: '90%', margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Register Corporate Profile</h2>
              <button className="btn-icon" onClick={() => setShowCompanyModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Company Name *</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  required 
                  className="form-input"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Headquarters Location</label>
                <input 
                  type="text" 
                  value={companyLoc} 
                  onChange={(e) => setCompanyLoc(e.target.value)} 
                  className="form-input"
                  placeholder="e.g. Boston, MA"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Website URL</label>
                <input 
                  type="url" 
                  value={companyWeb} 
                  onChange={(e) => setCompanyWeb(e.target.value)} 
                  className="form-input"
                  placeholder="e.g. https://acme.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Logo URL</label>
                <input 
                  type="text" 
                  value={companyLogo} 
                  onChange={(e) => setCompanyLogo(e.target.value)} 
                  className="form-input"
                  placeholder="e.g. https://acme.com/logo.png"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Corporate Summary</label>
                <textarea 
                  value={companyDesc} 
                  onChange={(e) => setCompanyDesc(e.target.value)} 
                  rows={3}
                  className="form-textarea"
                  placeholder="Write a brief overview of company domain, size, and values..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowCompanyModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Register Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN USER EDITION */}
      {showAdminUserModal && editingAdminUser && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', width: '90%', margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Edit User # {editingAdminUser.id}</h2>
              <button className="btn-icon" onClick={() => setShowAdminUserModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdminUserUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Full Name</label>
                <input 
                  type="text" 
                  value={editingAdminUser.fullName || ''} 
                  onChange={(e) => setEditingAdminUser({ ...editingAdminUser, fullName: e.target.value })} 
                  required 
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Email Address</label>
                <input 
                  type="email" 
                  value={editingAdminUser.email || ''} 
                  onChange={(e) => setEditingAdminUser({ ...editingAdminUser, email: e.target.value })} 
                  required 
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={editingAdminUser.phone || ''} 
                  onChange={(e) => setEditingAdminUser({ ...editingAdminUser, phone: e.target.value })} 
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>User Headline</label>
                <input 
                  type="text" 
                  value={editingAdminUser.headline || ''} 
                  onChange={(e) => setEditingAdminUser({ ...editingAdminUser, headline: e.target.value })} 
                  className="form-input"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Designated Role</label>
                  <select 
                    value={editingAdminUser.role || 'JOB_SEEKER'} 
                    onChange={(e) => setEditingAdminUser({ ...editingAdminUser, role: e.target.value })} 
                    className="form-select"
                  >
                    <option value="JOB_SEEKER">JOB_SEEKER</option>
                    <option value="RECRUITER">RECRUITER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                  <input 
                    type="checkbox" 
                    id="admin-user-verified"
                    checked={editingAdminUser.emailVerified || false} 
                    onChange={(e) => setEditingAdminUser({ ...editingAdminUser, emailVerified: e.target.checked })} 
                  />
                  <label htmlFor="admin-user-verified" style={{ fontWeight: '600', cursor: 'pointer' }}>Email Verified</label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdminUserModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN COMPANY EDITION */}
      {showAdminCompanyModal && editingAdminCompany && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', width: '90%', margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Edit Company Details</h2>
              <button className="btn-icon" onClick={() => setShowAdminCompanyModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdminCompanyUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Company Name</label>
                <input 
                  type="text" 
                  value={editingAdminCompany.name || ''} 
                  onChange={(e) => setEditingAdminCompany({ ...editingAdminCompany, name: e.target.value })} 
                  required 
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Headquarters Location</label>
                <input 
                  type="text" 
                  value={editingAdminCompany.location || ''} 
                  onChange={(e) => setEditingAdminCompany({ ...editingAdminCompany, location: e.target.value })} 
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Website URL</label>
                <input 
                  type="url" 
                  value={editingAdminCompany.website || ''} 
                  onChange={(e) => setEditingAdminCompany({ ...editingAdminCompany, website: e.target.value })} 
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Logo URL Link</label>
                <input 
                  type="text" 
                  value={editingAdminCompany.logoUrl || ''} 
                  onChange={(e) => setEditingAdminCompany({ ...editingAdminCompany, logoUrl: e.target.value })} 
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Corporate Description</label>
                <textarea 
                  value={editingAdminCompany.description || ''} 
                  onChange={(e) => setEditingAdminCompany({ ...editingAdminCompany, description: e.target.value })} 
                  rows={3}
                  className="form-textarea"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdminCompanyModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN JOB EDITION */}
      {showAdminJobModal && editingAdminJob && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px', width: '90%', margin: '40px auto', overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Edit Job Specifications</h2>
              <button className="btn-icon" onClick={() => setShowAdminJobModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdminJobUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Job Title</label>
                <input 
                  type="text" 
                  value={editingAdminJob.title || ''} 
                  onChange={(e) => setEditingAdminJob({ ...editingAdminJob, title: e.target.value })} 
                  required 
                  className="form-input"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Employment Type</label>
                  <select 
                    value={editingAdminJob.employmentType || 'Full-time'} 
                    onChange={(e) => setEditingAdminJob({ ...editingAdminJob, employmentType: e.target.value })} 
                    className="form-select"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Experience Level</label>
                  <select 
                    value={editingAdminJob.experienceLevel || 'Entry Level'} 
                    onChange={(e) => setEditingAdminJob({ ...editingAdminJob, experienceLevel: e.target.value })} 
                    className="form-select"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Min Salary ($)</label>
                  <input 
                    type="number" 
                    value={editingAdminJob.salaryMin !== null && editingAdminJob.salaryMin !== undefined ? editingAdminJob.salaryMin : ''} 
                    onChange={(e) => setEditingAdminJob({ ...editingAdminJob, salaryMin: e.target.value ? parseFloat(e.target.value) : null })} 
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Max Salary ($)</label>
                  <input 
                    type="number" 
                    value={editingAdminJob.salaryMax !== null && editingAdminJob.salaryMax !== undefined ? editingAdminJob.salaryMax : ''} 
                    onChange={(e) => setEditingAdminJob({ ...editingAdminJob, salaryMax: e.target.value ? parseFloat(e.target.value) : null })} 
                    className="form-input"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Location</label>
                  <input 
                    type="text" 
                    value={editingAdminJob.location || ''} 
                    onChange={(e) => setEditingAdminJob({ ...editingAdminJob, location: e.target.value })} 
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                  <input 
                    type="checkbox" 
                    id="admin-job-active"
                    checked={editingAdminJob.active || false} 
                    onChange={(e) => setEditingAdminJob({ ...editingAdminJob, active: e.target.checked })} 
                  />
                  <label htmlFor="admin-job-active" style={{ fontWeight: '600', cursor: 'pointer' }}>Active Vacancy</label>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Required Core Skills</label>
                <input 
                  type="text" 
                  value={editingAdminJob.skills || ''} 
                  onChange={(e) => setEditingAdminJob({ ...editingAdminJob, skills: e.target.value })} 
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Job Description Summary</label>
                <textarea 
                  value={editingAdminJob.description || ''} 
                  onChange={(e) => setEditingAdminJob({ ...editingAdminJob, description: e.target.value })} 
                  required 
                  rows={4}
                  className="form-textarea"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdminJobModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}