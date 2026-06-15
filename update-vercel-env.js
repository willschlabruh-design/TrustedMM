#!/usr/bin/env node

/**
 * Vercel Environment Variable Updater
 * This script updates the Production DATABASE_URL environment variable
 * Since UI automation is difficult, we'll try accessing the Vercel API directly
 */

const https = require('https');

async function updateVercelEnv() {
  const projectId = 'website';
  const teamId = 'willschla';
  const envKey = 'DATABASE_URL';
  const newValue = 'postgresql://postgres:7HFZoc5EMbMxU8Zu@db.awqglpvcwzblvesmmpkv.supabase.co:5432/postgres?sslmode=require';
  const environment = 'production';

  // Try to get auth token from environment
  const authToken = process.env.VERCEL_TOKEN;
  
  if (!authToken) {
    console.error('❌ VERCEL_TOKEN not found in environment variables');
    console.error('Please set the VERCEL_TOKEN environment variable and try again');
    console.log('\nTo get your token:');
    console.log('1. Go to https://vercel.com/account/tokens');
    console.log('2. Create a new token');
    console.log('3. Set it as VERCEL_TOKEN environment variable');
    return false;
  }

  console.log(`Attempting to update ${envKey} in production environment...`);
  console.log(`Project: ${projectId}, Team: ${teamId}`);

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v9/projects/${projectId}/env?teamId=${teamId}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Successfully updated DATABASE_URL!');
            console.log(JSON.stringify(response, null, 2));
            resolve(true);
          } else {
            console.error(`❌ API Error (${res.statusCode}):`, response);
            resolve(false);
          }
        } catch (e) {
          console.error('Failed to parse response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request failed:', e.message);
      resolve(false);
    });

    const payload = JSON.stringify({
      key: envKey,
      value: newValue,
      target: environment
    });

    req.write(payload);
    req.end();
  });
}

updateVercelEnv().then(success => {
  process.exit(success ? 0 : 1);
});
