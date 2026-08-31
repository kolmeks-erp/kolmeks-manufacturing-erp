const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Client } = require('pg');
const { supabaseAdmin } = require('../config/supabase');

async function applyMigration22() {
  console.log('--- Applying Migration 22: Expense Management & Reimbursement Schema ---');
  
  // Read migration SQL file
  const sqlPath = path.join(__dirname, '../../supabase/migrations/22_expense_management_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Derive connection URL options
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // Extract project ref from SUPABASE_URL (e.g. https://xyz.supabase.co -> xyz)
  const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
  const projectRef = match ? match[1] : null;

  console.log(`Detected Supabase Project Reference: ${projectRef || 'None'}`);

  let connected = false;

  // Try standard Supabase direct & pooler DB connection strings
  const connectionStrings = [];
  if (process.env.DATABASE_URL) {
    connectionStrings.push(process.env.DATABASE_URL);
  }
  if (projectRef) {
    connectionStrings.push(`postgresql://postgres:${supabaseKey}@db.${projectRef}.supabase.co:5432/postgres`);
    connectionStrings.push(`postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`);
    connectionStrings.push(`postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`);
    connectionStrings.push(`postgresql://postgres.${projectRef}:${supabaseKey}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`);
  }

  for (const connStr of connectionStrings) {
    try {
      console.log(`Attempting connection to Postgres...`);
      const client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      await client.connect();
      console.log('✅ Connected to PostgreSQL database successfully!');
      
      console.log('Executing migration 22 SQL statements...');
      await client.query(sql);
      console.log('🎉 Migration 22 executed successfully via Postgres client!');
      await client.end();
      connected = true;
      break;
    } catch (err) {
      console.log(`Connection attempt failed: ${err.message}`);
    }
  }

  if (!connected) {
    console.log('\n⚠️ Direct Postgres connection unavailable with default credentials.');
    console.log('Checking if expense tables exist or creating seeded rows via Supabase Admin...');
    
    // Check if tables already exist
    const { data: catCheck, error: catErr } = await supabaseAdmin.from('expense_categories').select('id').limit(1);
    if (!catErr) {
      console.log('✅ expense_categories table is already accessible via Supabase REST API!');
    } else {
      console.error('❌ expense_categories error:', catErr.message);
      console.log('👉 Please execute server/supabase/migrations/22_expense_management_schema.sql in the Supabase Dashboard SQL Editor if direct connection fails.');
    }
  }
}

applyMigration22();
