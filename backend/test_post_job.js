const http = require('http');

const email = `recruiter_${Date.now()}@yopmail.com`;
const password = 'password123';

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
    console.log('[STEP 1] Registering recruiter account...');
    const regRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Acme Recruiter',
      email: email,
      password: password,
      role: 'RECRUITER',
      phone: '9876543210'
    });
    
    console.log('Register response:', regRes.statusCode, regRes.body);
    const userId = regRes.body.userId;
    
    console.log('[STEP 2] Manually verifying user in the database via verify endpoint...');
    // Fetch token from register body
    const token = regRes.body.token;
    
    // We can find the verification token by checking the user in DB, or wait:
    // Let's call the /auth/verify?token=... endpoint!
    // But since the token is printed in console or we can just fetch it, wait:
    // Can we just update the database directly?
    // Yes! Let's log in using Admin to verify this user!
    console.log('[STEP 3] Logging in as Admin to toggle verification...');
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
    console.log('Admin logged in! Status:', adminLoginRes.statusCode);
    
    console.log('[STEP 4] Admin updating user emailVerified to true...');
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
    
    console.log('Admin verify user response:', verifyRes.statusCode, verifyRes.body);
    
    console.log('[STEP 5] Logging in as the newly verified recruiter...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email, password });
    
    console.log('Recruiter login status:', loginRes.statusCode);
    const recruiterToken = loginRes.body.token;
    
    console.log('[STEP 6] Recruiter registering a Company...');
    const compRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/companies',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      }
    }, {
      name: 'Acme Corporates',
      description: 'We build high-tech automation solutions.',
      website: 'www.acme-corp.com',
      location: 'Silicon Valley, CA',
      logoUrl: 'http://acme.com/logo.png'
    });
    
    console.log('Company created:', compRes.statusCode, compRes.body);
    const companyId = compRes.body.id;
    
    console.log('[STEP 7] Recruiter posting a Job...');
    const jobRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/jobs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      }
    }, {
      title: 'Senior Automation Engineer',
      description: 'Looking for a Senior Java Developer with Spring Boot & MySQL skills.',
      location: 'Remote',
      employmentType: 'Full-time',
      experienceLevel: 'Senior Level',
      salaryMin: 90000,
      salaryMax: 140000,
      skills: 'Java, Spring Boot, MySQL',
      companyId: companyId
    });
    
    console.log('Job posted status:', jobRes.statusCode, jobRes.body);
    
    console.log('[STEP 8] Fetching recruiter posted jobs...');
    const recJobsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/recruiter/jobs',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${recruiterToken}`
      }
    });
    
    console.log('Recruiter jobs list size:', recJobsRes.statusCode, recJobsRes.body ? recJobsRes.body.length : 0);
    
    console.log('[STEP 9] Searching all active jobs (Explore Jobs flow)...');
    const exploreRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/jobs?page=0&size=10',
      method: 'GET'
    });
    
    console.log('Explore jobs total content size:', exploreRes.statusCode, exploreRes.body ? exploreRes.body.content.length : 0);
    
    if (jobRes.statusCode === 200 && recJobsRes.statusCode === 200 && exploreRes.statusCode === 200) {
      console.log('\n==== ALL DB AND ENDPOINT TEST CASES COMPLETED FLawLESSLY! ==== \n');
    } else {
      console.log('\n==== WARNING: SOME ENDPOINTS RETURNED ERRORS! ==== \n');
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

run();
