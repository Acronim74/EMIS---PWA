const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    global: { fetch } // для стабильной работы в Node.js
  }
);

module.exports = supabase;
