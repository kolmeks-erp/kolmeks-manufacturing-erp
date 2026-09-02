require('dotenv').config();
const { supabase } = require('./src/config/supabase');
const http = require('http');

async function runTest() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@kolmeks.com',
    password: 'Kolmekserp@0511'
  });

  if (authError || !authData.session) {
    console.error('CRITICAL: Failed to authenticate admin user:', authError);
    process.exit(1);
  }

  const token = authData.session.access_token;

  function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let resBody = '';
        res.on('data', chunk => resBody += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resBody) });
          } catch(e) {
            resolve({ status: res.statusCode, raw: resBody });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ status: 500, error: err.message });
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  const assetsRes = await makeRequest('/api/maintenance/assets');
  console.log('Assets status:', assetsRes.status);
  const assetId = assetsRes.data?.data?.[0]?.id;
  console.log('Asset ID:', assetId);

  const breakdownRes = await makeRequest('/api/maintenance/breakdowns', 'POST', {
    asset_id: assetId,
    failure_type: 'HYDRAULIC',
    severity: 'MEDIUM',
    description: 'aaaaa'
  });

  console.log('Breakdown POST Status:', breakdownRes.status);
  console.log('Breakdown POST Data:', breakdownRes.data || breakdownRes.raw);

  const claimsRes = await makeRequest('/api/finance/expenses');
  console.log('Expense Claims Status:', claimsRes.status);
  console.log('Expense Claims Raw:', claimsRes.raw || claimsRes.data);

  const kpiRes = await makeRequest('/api/finance/expenses/dashboard/kpis');
  console.log('Expense KPIs Status:', kpiRes.status);
}

runTest();
