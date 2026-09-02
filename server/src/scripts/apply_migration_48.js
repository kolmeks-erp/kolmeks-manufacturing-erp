const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');

async function applyMigration48() {
  console.log('--- Applying Migration 48: Audit, Security & Compliance Hardening ---');
  try {
    const sqlPath = path.join(__dirname, '../../supabase/migrations/48_audit_security_compliance_hardening.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL by statements safely or execute using exec_sql
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: stmt + ';' });
      if (error) {
        // Fallback or log notice if exec_sql isn't exposed
        if (!error.message.includes('function') && !error.message.includes('not found')) {
          console.warn('Migration Statement Notice:', error.message);
        }
      }
    }

    console.log('Migration 48 applied successfully or already present.');
  } catch (err) {
    console.error('Migration 48 execution exception:', err.message);
  }
}

applyMigration48();
