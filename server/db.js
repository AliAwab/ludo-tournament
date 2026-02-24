require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL ERROR: Supabase environment variables are missing.');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const initDb = async () => {
  // Database schema should be initialized via the provided SQL file in Supabase.
  // Admins can be added directly in the 'admins' table or via a secure script.
  console.log('📡 Database connection initialized.');
};

// ── Query helpers (Supabase Async Wrappers) ─────────────────

const dbAll = async (tableName, queryBuilder = (q) => q) => {
  let query = supabase.from(tableName).select('*');
  query = queryBuilder(query);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const dbGet = async (tableName, queryBuilder = (q) => q) => {
  let query = supabase.from(tableName).select('*');
  query = queryBuilder(query);
  const { data, error } = await query.single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
  return data;
};

const dbRun = async (tableName, dataToInsert) => {
  const { data, error } = await supabase.from(tableName).insert(dataToInsert).select();
  if (error) throw error;
  return { lastInsertRowid: data[0].id, data: data[0] };
};

module.exports = { initDb, supabase, dbAll, dbGet, dbRun };
