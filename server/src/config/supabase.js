const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseJwksUrl = process.env.SUPABASE_JWKS_URL;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('⚠️ Warning: SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY is missing in environment variables.');
}

// Client for general public/anonymous queries
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key'
);

// Privileged admin client for server-side trusted operations
const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseSecretKey || 'placeholder-secret-key'
);

module.exports = {
  supabase,
  supabaseAdmin,
  supabaseJwksUrl,
};
