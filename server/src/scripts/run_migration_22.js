const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function runMigration22() {
  console.log('--- Verifying Migration 22: Expense Management & Reimbursement Schema ---');
  try {
    // 1. Check expense_categories table
    const { data: categories, error: catErr } = await supabaseAdmin
      .from('expense_categories')
      .select('id, code, name, default_account_id')
      .limit(10);
    
    if (catErr && catErr.code === '42P01') {
      console.log('⚠️ expense_categories table does not exist in Supabase database yet.');
      console.log('👉 Please execute 22_expense_management_schema.sql in Supabase SQL Editor.');
    } else if (catErr) {
      console.error('Error verifying expense_categories:', catErr.message);
    } else {
      console.log('✅ expense_categories table verified successfully! Categories count:', categories ? categories.length : 0);
    }

    // 2. Check expense_claims table
    const { data: claims, error: claimErr } = await supabaseAdmin
      .from('expense_claims')
      .select('id, claim_number, status')
      .limit(5);

    if (!claimErr) {
      console.log('✅ expense_claims table verified successfully! Seeded/Existing claims:', claims ? claims.length : 0);
    } else if (claimErr && claimErr.code === '42P01') {
      console.log('⚠️ expense_claims table does not exist yet.');
    }

    // 3. Check reimbursements table
    const { data: reimbursements, error: reimbErr } = await supabaseAdmin
      .from('reimbursements')
      .select('id, reimbursement_number, status')
      .limit(5);

    if (!reimbErr) {
      console.log('✅ reimbursements table verified successfully!');
    } else if (reimbErr && reimbErr.code === '42P01') {
      console.log('⚠️ reimbursements table does not exist yet.');
    }

  } catch (err) {
    console.error('Migration 22 runner check error:', err);
  }
}

runMigration22();