const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

async function runMigration16() {
  console.log('--- Verifying Migration 16: HR Operations & Attendance Schema ---');
  try {
    // Check if shifts table exists
    const { data: shifts, error } = await supabaseAdmin.from('shifts').select('id, shift_code, name').limit(5);
    
    if (error && error.code === '42P01') {
      console.log('⚠️ shifts table does not exist in Supabase database yet.');
      console.log('👉 Please execute 16_hr_operations_schema.sql in Supabase SQL Editor.');
    } else if (error) {
      console.error('Error verifying shifts table:', error.message);
    } else {
      console.log('✅ shifts table verified successfully! Seeded shifts count:', shifts ? shifts.length : 0);
    }
  } catch (err) {
    console.error('Migration runner check error:', err);
  }
}

runMigration16();
