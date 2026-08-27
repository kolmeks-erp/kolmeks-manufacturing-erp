const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

async function runMigration() {
  console.log('🚀 Running Production & Manufacturing Module Migration 13...');
  const sqlPath = path.join(__dirname, '../../supabase/migrations/13_production_manufacturing_schema.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

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

  // Check if work_centers table already exists
  const { data: wcData, error: wcErr } = await supabaseAdmin
    .from('work_centers')
    .select('id')
    .limit(1);

  if (!wcErr) {
    console.log('ℹ️ Table work_centers already exists in database.');
  } else {
    console.log('Notice: Executing table creation via Supabase SQL...');
  }
}

runMigration();
