const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5001/api';

async function run() {
  console.log('--- Starting E2E API Test ---');
  
  // 1. Register candidate
  console.log('1. Registering Candidate');
  const email = `test.candidate.${Date.now()}@example.com`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Candidate', email, password: 'password123', role: 'candidate' })
  });
  
  if (!registerRes.ok) {
    console.error('Registration failed:', await registerRes.text());
    return;
  }
  
  const { token } = await registerRes.json();
  console.log('Candidate registered, got token.');

  // 1.5 Seed Jobs
  console.log('1.5 Seeding Jobs');
  const seedRes = await fetch(`${BASE_URL}/jobs/seed`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!seedRes.ok) console.error('Seed failed', await seedRes.text());
  
  // 2. Upload resume
  console.log('2. Uploading Resume');
  const formData = new FormData();
  formData.append('resume', fs.createReadStream('./resume.pdf'));
  
  const uploadRes = await fetch(`${BASE_URL}/upload-resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!uploadRes.ok) {
    console.error('Upload failed:', await uploadRes.text());
    return;
  }
  
  const uploadData = await uploadRes.json();
  console.log('Upload success, Resume Data extracted.');
  
  // 3. Get job matches
  console.log('3. Getting Job Matches');
  const matchesRes = await fetch(`${BASE_URL}/jobs/match`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!matchesRes.ok) {
    console.error('Matches failed:', await matchesRes.text());
    return;
  }
  
  const matchesData = await matchesRes.json();
  console.log(`Found ${matchesData.matches.length} job matches.`);
  if (matchesData.matches.length > 0) {
     const topMatch = matchesData.matches[0];
     console.log('Top match:', topMatch.metadata.title);
     
     // 4. Generate Assessment
     console.log('4. Generating Assessment for job:', topMatch.id);
     const assessmentRes = await fetch(`${BASE_URL}/generate-test`, {
         method: 'POST',
         headers: { 
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json'
         },
         body: JSON.stringify({
             jobDescription: topMatch.document
         })
     });
     
     if (!assessmentRes.ok) {
         console.error('Assessment generation failed:', await assessmentRes.text());
         return;
     }
     const assessmentData = await assessmentRes.json();
     console.log('Assessment generated! Questions:', assessmentData.data?.questions?.length || assessmentData.data?.assessment?.questions?.length);
  }
  
  console.log('--- E2E Test Completed Successfully ---');
}

run().catch(console.error);
