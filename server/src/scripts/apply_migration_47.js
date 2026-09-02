const fs = require('fs');
const path = require('path');
const { supabaseAdmin, supabase } = require('../config/supabase');

async function applyMigration47() {
  console.log('--- Applying Migration 47: Advanced Reporting & Analytics Schema ---');
  const sqlPath = path.join(__dirname, '../../supabase/migrations/47_advanced_reporting_analytics_schema.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  const client = supabaseAdmin || supabase;

  const statements = sqlContent
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      if (client.rpc) {
        const { error } = await client.rpc('exec_sql', { sql_query: stmt });
        if (error) {
          console.log(`Statement ${i + 1} execution notice: ${error.message}`);
        }
      }
    } catch (err) {
      console.warn(`Statement ${i + 1} execution error:`, err.message);
    }
  }

  // Verification queries
  const { data: savedData, error: savedErr } = await client.from('saved_reports').select('*').limit(1);
  if (savedErr) {
    console.error('Saved reports table verification failed:', savedErr.message);
  } else {
    console.log('Saved reports table verified successfully.');
  }

  const { data: schedData, error: schedErr } = await client.from('report_schedules').select('*').limit(1);
  if (schedErr) {
    console.error('Report schedules table verification failed:', schedErr.message);
  } else {
    console.log('Report schedules table verified successfully.');
  }

  console.log('--- Migration 47 Application Finished ---');
}

applyMigration47().catch((err) => {
  console.error('Migration 47 script error:', err);
  process.exit(1);
});
