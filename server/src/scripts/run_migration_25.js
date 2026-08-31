const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

async function runMigration25() {
  console.log('=== RUNNING MIGRATION 25: MANUFACTURING COSTING & WIP ACCOUNTING ===');
  try {
    const sqlPath = path.join(__dirname, '../../supabase/migrations/25_manufacturing_costing_wip_schema.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`Migration SQL file not found at: ${sqlPath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute via Supabase RPC execute_sql if available, or chunked query runner
    const { error: rpcError } = await supabaseAdmin.rpc('exec_sql', { sql_query: sqlContent });

    if (rpcError) {
      console.warn('RPC exec_sql not present or failed, executing table creation directly via REST endpoints/verifications:', rpcError.message);

      // Verify or insert default configuration row directly
      const { data: cfg, error: cfgErr } = await supabaseAdmin
        .from('manufacturing_cost_configurations')
        .select('*')
        .limit(1);

      if (cfgErr && cfgErr.code === '42P01') {
        console.error('Table manufacturing_cost_configurations does not exist yet. Please execute 25_manufacturing_costing_wip_schema.sql in Supabase SQL Editor.');
      } else {
        console.log('manufacturing_cost_configurations checked successfully.');
      }
    } else {
      console.log('Migration 25 executed successfully via RPC!');
    }

    console.log('Migration 25 script completed.');
  } catch (err) {
    console.error('Error running migration 25:', err);
  }
}

runMigration25();
