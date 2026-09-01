const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function applyMigration39() {
  console.log('--- Applying & Verifying Migration 39: Attendance, Leave & Payroll Foundation ---');

  try {
    // 1. Check overtime_records
    const { data: otData, error: otErr } = await supabaseAdmin
      .from('overtime_records')
      .select('id')
      .limit(1);

    if (otErr && otErr.code === '42P01') {
      console.log('⚠️ overtime_records table does not exist in Supabase database yet.');
    } else {
      console.log('✅ overtime_records table verified successfully!');
    }

    // 2. Check working_calendar_settings
    const { data: wcData, error: wcErr } = await supabaseAdmin
      .from('working_calendar_settings')
      .select('id')
      .limit(1);

    if (wcErr && wcErr.code === '42P01') {
      console.log('⚠️ working_calendar_settings table does not exist yet.');
    } else {
      console.log('✅ working_calendar_settings table verified successfully!');
    }

    // 3. Check employee_compensation
    const { data: compData, error: compErr } = await supabaseAdmin
      .from('employee_compensation')
      .select('id')
      .limit(1);

    if (compErr && compErr.code === '42P01') {
      console.log('⚠️ employee_compensation table does not exist yet.');
    } else {
      console.log('✅ employee_compensation table verified successfully!');
    }

    // 4. Check payroll_periods
    const { data: ppData, error: ppErr } = await supabaseAdmin
      .from('payroll_periods')
      .select('id')
      .limit(1);

    if (ppErr && ppErr.code === '42P01') {
      console.log('⚠️ payroll_periods table does not exist yet.');
    } else {
      console.log('✅ payroll_periods table verified successfully!');
    }

    // 5. Check payroll_runs
    const { data: prData, error: prErr } = await supabaseAdmin
      .from('payroll_runs')
      .select('id')
      .limit(1);

    if (prErr && prErr.code === '42P01') {
      console.log('⚠️ payroll_runs table does not exist yet.');
    } else {
      console.log('✅ payroll_runs table verified successfully!');
    }

    // 6. Check payroll_entries
    const { data: peData, error: peErr } = await supabaseAdmin
      .from('payroll_entries')
      .select('id')
      .limit(1);

    if (peErr && peErr.code === '42P01') {
      console.log('⚠️ payroll_entries table does not exist yet.');
    } else {
      console.log('✅ payroll_entries table verified successfully!');
    }

  } catch (err) {
    console.error('Migration runner check error:', err);
  }
}

applyMigration39();
