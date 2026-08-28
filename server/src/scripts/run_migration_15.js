const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

async function runMigration() {
  console.log('🚀 Checking Maintenance & Asset Management Migration 15...');
  
  // Verify database connection first
  const { data: testData, error: testErr } = await supabaseAdmin
    .from('roles')
    .select('id')
    .limit(1);

  if (testErr) {
    console.error('❌ Database connection failed:', testErr);
    process.exit(1);
  }
  console.log('✅ Supabase Connection Verified.');

  // Check if assets table exists
  const { data: assetData, error: assetErr } = await supabaseAdmin
    .from('assets')
    .select('id')
    .limit(1);

  if (!assetErr) {
    console.log('ℹ️ Table assets exists and is ready.');
  } else {
    console.log('⚠️ Notice: Execute 15_maintenance_asset_management_schema.sql in Supabase SQL editor if not yet executed.');
  }
}

runMigration();
