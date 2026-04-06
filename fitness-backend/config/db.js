const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fitness_ahora_db',
  password: 'admin',
  port: 5433,
});

module.exports = pool;