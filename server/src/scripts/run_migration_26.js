const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

async function runMigration26() {
  console.log('=== RUNNING MIGRATION 26: PRODUCTION PLANNING & SCHEDULING ===');
  try {
    const sqlPath = path.join(__dirname, '../../supabase/migrations/26_production_planning_scheduling_schema.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`Migration SQL file not found at: ${sqlPath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute via Supabase RPC exec_sql if available
    const { error: rpcError } = await supabaseAdmin.rpc('exec_sql', { sql_query: sqlContent });

    if (rpcError) {
      console.warn('RPC exec_sql note:', rpcError.message);

      // Verify table accessibility
      const { data: plans, error: planErr } = await supabaseAdmin
        .from('production_plans')
        .select('id')
        .limit(1);

      if (planErr && planErr.code === '42P01') {
        console.error('Table production_plans does not exist yet. Please execute 26_production_planning_scheduling_schema.sql in Supabase SQL Editor.');
      } else {
        console.log('production_plans table checked successfully.');
      }
    } else {
      console.log('Migration 26 executed successfully via RPC!');
    }

    console.log('Migration 26 script completed.');
  } catch (err) {
    console.error('Error running migration 26:', err);
  }
}

runMigration26();
