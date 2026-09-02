require('dotenv').config();
const { supabase } = require('./src/config/supabase');
const http = require('http');

async function runE2ETests() {
  console.log('====================================================');
  console.log('  KOLMEKS ERP - END-TO-END SYSTEM INTEGRATION TEST  ');
  console.log('====================================================\n');

  // 1. Authenticate
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@kolmeks.com',
    password: 'Kolmekserp@0511'
  });

  if (authError || !authData.session) {
    console.error('CRITICAL: Failed to authenticate admin user:', authError);
    process.exit(1);
  }

  const token = authData.session.access_token;
  console.log('✓ Authentication successful (JWT token retrieved)\n');

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

  const endpoints = [
    { name: 'Employees List', path: '/api/employees' },
    { name: 'HR Attendance', path: '/api/hr/attendance' },
    { name: 'HR Leave Requests', path: '/api/hr/leave/requests' },
    { name: 'HR Leave Balances', path: '/api/hr/leave/balances' },
    { name: 'HR Overtime Records', path: '/api/hr/overtime' },
    { name: 'Payroll KPI Telemetry', path: '/api/payroll/dashboard/kpis' },
    { name: 'Payroll Periods', path: '/api/payroll/periods' },
    { name: 'Payroll Runs', path: '/api/payroll/runs' },
    { name: 'Quality Inspections', path: '/api/quality/inspections' },
    { name: 'Quality Defect Logs', path: '/api/quality/defects' },
    { name: 'Quality NCR Records', path: '/api/quality/ncr' },
    { name: 'Quality Dashboard KPIs', path: '/api/quality/dashboard/kpis' },
    { name: 'Maintenance Breakdowns', path: '/api/maintenance/breakdowns' },
    { name: 'Maintenance Work Orders', path: '/api/maintenance/work-orders' },
    { name: 'Maintenance Telemetry', path: '/api/maintenance/dashboard/kpis' },
    { name: 'Notifications Unread', path: '/api/notifications/unread-count' },
    { name: 'Global Search (Query: "test")', path: '/api/search?q=test' },
    { name: 'Activity Log Stream', path: '/api/activity' },
    { name: 'Security Overview Telemetry', path: '/api/security/overview' },
    { name: 'System Settings - Locations', path: '/api/settings/locations' },
    { name: 'System Settings - Departments', path: '/api/settings/departments' },
    { name: 'Reports - Overview Telemetry', path: '/api/reports/dashboard' },
  ];

  let passCount = 0;
  let failCount = 0;

  for (const ep of endpoints) {
    const res = await makeRequest(ep.path);
    if (res.status >= 200 && res.status < 300) {
      console.log(`[PASS] ${ep.name} (${ep.path}) -> Status ${res.status}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${ep.name} (${ep.path}) -> Status ${res.status}:`, res.data || res.raw);
      failCount++;
    }
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================\n');
}

runE2ETests();
