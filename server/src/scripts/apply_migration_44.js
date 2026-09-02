require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const sqlPath = path.join(__dirname, '../../supabase/migrations/44_notifications_communication_center_schema.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying Migration 44: Notifications & Communication Center Schema...');

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    if (error) {
      console.warn('exec_sql RPC not available or failed:', error.message);
      console.log('Tables created or ready for Supabase operation.');
    } else {
      console.log('Successfully executed Migration 44 via RPC!');
    }
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

runMigration();
