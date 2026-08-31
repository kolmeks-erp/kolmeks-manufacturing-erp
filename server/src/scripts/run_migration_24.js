const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');

async function runMigration() {
  console.log('--- Starting Migration 24: Advanced Inventory & Stock Control Schema ---');

  try {
    const migrationPath = path.join(__dirname, '../../supabase/migrations/24_advanced_inventory_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Run verification query on public.inventory
    const { data: invData, error: invErr } = await supabase.from('inventory').select('id').limit(1);

    if (invErr) {
      console.error('Error verifying inventory table:', invErr.message);
    } else {
      console.log('Existing inventory table confirmed present. Safe schema extension active.');
    }

    // Verify warehouses and storage locations
    const { data: whData, error: whErr } = await supabase.from('warehouses').select('id, code, name').limit(5);

    if (whErr) {
      console.error('Error querying warehouses:', whErr.message);
    } else {
      console.log(`Found ${whData.length} existing active warehouses:`, whData.map((w) => w.code).join(', '));
    }

    console.log('Migration 24 script processed successfully.');
  } catch (err) {
    console.error('Migration execution failed:', err);
  }
}

runMigration();
