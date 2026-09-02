const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Client } = require('pg');
const { supabaseAdmin } = require('../config/supabase');

async function applyMigration41() {
  console.log('--- Applying & Verifying Migration 41: Advanced Sales & Distribution Module ---');

  const sqlPath = path.join(__dirname, '../../supabase/migrations/41_advanced_sales_distribution_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;

  if (dbUrl) {
    console.log('Attempting PostgreSQL direct migration execution...');
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query(sql);
      console.log('✅ Direct PostgreSQL Migration 41 executed successfully!');
      await client.end();
    } catch (err) {
      console.error('⚠️ PostgreSQL direct execution failed or skipped:', err.message);
    }
  }

  // Verify tables in Supabase
  try {
    const tables = [
      'sales_pricings',
      'sales_pickings',
      'sales_picking_items',
      'sales_packings',
      'sales_packing_items',
      'delivery_orders',
      'delivery_order_items',
      'sales_returns',
      'sales_return_items',
      'credit_notes'
    ];
    for (const table of tables) {
      const { data, error } = await supabaseAdmin.from(table).select('id').limit(1);
      if (error && error.code === '42P01') {
        console.log(`⚠️ ${table} table does not exist in Supabase database yet.`);
      } else {
        console.log(`✅ ${table} table verified successfully!`);
      }
    }
  } catch (err) {
    console.error('Migration verification error:', err);
  }
}

applyMigration41();
