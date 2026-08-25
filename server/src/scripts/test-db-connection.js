const dbService = require('../services/db.service');

async function testConnection() {
  console.log('🔍 Testing Kolmeks Supabase Database Connection...');
  const result = await dbService.checkDatabaseHealth();
  console.log('--------------------------------------------------');
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('--------------------------------------------------');

  if (result.connected) {
    console.log('✅ Database Connection Test Passed.');
  } else {
    console.log('⚠️ Database Connection Test Failed or Pending Configuration:');
    console.log(`   Message: ${result.message}`);
    console.log('   Ensure SUPABASE_URL and SUPABASE_SECRET_KEY / SUPABASE_PUBLISHABLE_KEY are set in server/.env.');
  }
}

testConnection();
