const fs = require('fs');
const path = require('path');
const { supabaseAdmin, supabase } = require('../config/supabase');

async function applyMigration46() {
  console.log('--- Applying Migration 46: System Admin & Organization Settings Schema ---');
  const sqlPath = path.join(__dirname, '../../supabase/migrations/46_system_admin_organization_settings_schema.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  const client = supabaseAdmin || supabase;

  // Split SQL commands by semicolon
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
          // If exec_sql RPC doesn't exist, try alternative or log statement
          console.log(`Statement ${i + 1} execution notice: ${error.message}`);
        }
      }
    } catch (err) {
      console.warn(`Statement ${i + 1} execution error:`, err.message);
    }
  }

  // Verification queries
  const { data: orgData, error: orgErr } = await client.from('organization_settings').select('*').limit(1);
  if (orgErr) {
    console.error('Organization settings table verification failed:', orgErr.message);
  } else {
    console.log('Organization Settings initialized successfully:', orgData?.[0]?.org_name || 'Ready');
  }

  const { data: locData, error: locErr } = await client.from('locations').select('code, name, country');
  if (locErr) {
    console.error('Locations table verification failed:', locErr.message);
  } else {
    console.log(`Locations initialized (${locData?.length || 0} active locations):`, locData?.map(l => l.code).join(', '));
  }

  const { data: numData, error: numErr } = await client.from('numbering_sequences').select('entity_type, prefix');
  if (numErr) {
    console.error('Numbering sequences table verification failed:', numErr.message);
  } else {
    console.log(`Numbering sequences initialized (${numData?.length || 0} sequences):`, numData?.map(n => n.prefix).join(', '));
  }

  console.log('--- Migration 46 Application Finished ---');
}

applyMigration46().catch((err) => {
  console.error('Migration 46 script error:', err);
  process.exit(1);
});
