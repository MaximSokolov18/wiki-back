const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'wiki',
  password: 'admin',
  port: 5433,
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};