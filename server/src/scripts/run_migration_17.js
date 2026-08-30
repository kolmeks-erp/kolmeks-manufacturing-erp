const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function runMigration17() {
  console.log('--- Verifying Migration 17: Finance & Accounting Foundation Schema ---');
  try {
    // 1. Check chart_of_accounts table
    const { data: accounts, error: acctErr } = await supabaseAdmin
      .from('chart_of_accounts')
      .select('id, account_code, account_name, account_type')
      .limit(10);
    
    if (acctErr && acctErr.code === '42P01') {
      console.log('⚠️ chart_of_accounts table does not exist in Supabase database yet.');
      console.log('👉 Please execute 17_finance_accounting_schema.sql in Supabase SQL Editor.');
    } else if (acctErr) {
      console.error('Error verifying chart_of_accounts:', acctErr.message);
    } else {
      console.log('✅ chart_of_accounts table verified successfully! Seeded accounts count:', accounts ? accounts.length : 0);
    }

    // 2. Check financial_periods table
    const { data: periods, error: perErr } = await supabaseAdmin
      .from('financial_periods')
      .select('id, period_name, status')
      .limit(5);

    if (!perErr) {
      console.log('✅ financial_periods table verified successfully! Seeded periods:', periods ? periods.map(p => `${p.period_name} (${p.status})`).join(', ') : 'none');
    }

  } catch (err) {
    console.error('Migration 17 runner check error:', err);
  }
}

runMigration17();
