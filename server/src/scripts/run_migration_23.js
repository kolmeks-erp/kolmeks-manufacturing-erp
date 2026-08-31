const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function runMigration23() {
  console.log('--- Verifying Migration 23: Fixed Asset Finance & Depreciation Schema ---');
  try {
    // 1. Check fixed_asset_categories table
    const { data: categories, error: catErr } = await supabaseAdmin
      .from('fixed_asset_categories')
      .select('id, code, name, default_useful_life_months')
      .limit(10);
    
    if (catErr && catErr.code === '42P01') {
      console.log('⚠️ fixed_asset_categories table does not exist in Supabase database yet.');
      console.log('👉 Please execute 23_fixed_asset_finance_schema.sql in Supabase SQL Editor.');
    } else if (catErr) {
      console.error('Error verifying fixed_asset_categories:', catErr.message);
    } else {
      console.log('✅ fixed_asset_categories table verified successfully! Categories count:', categories ? categories.length : 0);
    }

    // 2. Check fixed_assets table
    const { data: assets, error: assetErr } = await supabaseAdmin
      .from('fixed_assets')
      .select('id, asset_number, status')
      .limit(5);

    if (!assetErr) {
      console.log('✅ fixed_assets table verified successfully! Seeded/Existing assets:', assets ? assets.length : 0);
    } else if (assetErr && assetErr.code === '42P01') {
      console.log('⚠️ fixed_assets table does not exist yet.');
    }

    // 3. Check depreciation_runs table
    const { data: depRuns, error: depErr } = await supabaseAdmin
      .from('depreciation_runs')
      .select('id, run_number, status')
      .limit(5);

    if (!depErr) {
      console.log('✅ depreciation_runs table verified successfully!');
    } else if (depErr && depErr.code === '42P01') {
      console.log('⚠️ depreciation_runs table does not exist yet.');
    }

    // 4. Check fixed_asset_transfers table
    const { data: transfers, error: xferErr } = await supabaseAdmin
      .from('fixed_asset_transfers')
      .select('id, transfer_number')
      .limit(5);

    if (!xferErr) {
      console.log('✅ fixed_asset_transfers table verified successfully!');
    } else if (xferErr && xferErr.code === '42P01') {
      console.log('⚠️ fixed_asset_transfers table does not exist yet.');
    }

    // 5. Check fixed_asset_disposals table
    const { data: disposals, error: dispErr } = await supabaseAdmin
      .from('fixed_asset_disposals')
      .select('id, disposal_number')
      .limit(5);

    if (!dispErr) {
      console.log('✅ fixed_asset_disposals table verified successfully!');
    } else if (dispErr && dispErr.code === '42P01') {
      console.log('⚠️ fixed_asset_disposals table does not exist yet.');
    }

  } catch (err) {
    console.error('Migration 23 runner check error:', err);
  }
}

runMigration23();
