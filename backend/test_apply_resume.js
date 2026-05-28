const http = require('http');

const seekerEmail = `seeker_${Date.now()}@yopmail.com`;
const seekerPassword = 'password123';
const resumeUrlValue = 'https://drive.google.com/file/d/12345/view?usp=sharing';
const coverLetterValue = 'This is a premium cover letter pitching my Spring Boot & React skills.';

function makeRequest(options, payload = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });
    req.on('error', reject);
    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

async function run() {
  try {
    console.log('[STEP 1] Registering a new Job Seeker account...');
    const regRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'John Doe Seeker',
      email: seekerEmail,
      password: seekerPassword,
      role: 'JOB_SEEKER',
      phone: '9998887770'
    });
    
    const userId = regRes.body.userId;
    console.log(`Seeker registered. UserID: ${userId}`);

    console.log('[STEP 2] Logging in as Admin to verify the Seeker...');
    const adminLoginRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'Admin@Jobsyak.com',
      password: 'luciferak'
    });
    
    const adminToken = adminLoginRes.body.token;

    const verifyRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/users/${userId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      emailVerified: true
    });
    console.log(`Seeker verified. Status: ${verifyRes.statusCode}`);

    console.log('[STEP 3] Logging in as the verified Seeker...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: seekerEmail, password: seekerPassword });
    
    const seekerToken = loginRes.body.token;
    console.log(`Seeker logged in!`);

    console.log('[STEP 4] Fetching all active jobs to apply to...');
    const jobsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/jobs?page=0&size=10',
      method: 'GET'
    });
    
    const firstJob = jobsRes.body.content[0];
    if (!firstJob) {
      console.log('No jobs found to apply to. Please run test_post_job.js first.');
      return;
    }
    console.log(`Applying to Job: "${firstJob.title}" (ID: ${firstJob.id})`);

    console.log('[STEP 5] Seeker submitting application with Resume URL and Cover Letter...');
    const applyRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: `/api/applications/jobs/${firstJob.id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${seekerToken}`
      }
    }, {
      coverLetter: coverLetterValue,
      resumeUrl: resumeUrlValue
    });
    
    console.log('Apply Response Status:', applyRes.statusCode);
    console.log('Apply Response Body Cover Letter:', applyRes.body.coverLetter);

    console.log('[STEP 6] Checking if the seeker\'s profile table was updated with the Resume URL...');
    const profileRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/users/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${seekerToken}`
      }
    });

    console.log('User Profile fetched Resume URL:', profileRes.body.resumeUrl);

    if (profileRes.body.resumeUrl === resumeUrlValue) {
      console.log('\n==== SUCCESS: APPLICANT DATA LINKED & SAVED TO SQL USER PROFILE TABLE SUCCESSFULLY! ====\n');
    } else {
      console.log('\n==== FAILURE: USER PROFILE RESUME_URL WAS NOT UPDATED! ====\n');
    }

  } catch (err) {
    console.error('Test error:', err);
  }
}

run();
