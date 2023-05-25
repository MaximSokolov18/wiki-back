const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'metelap-wiki-2.c840t5gwj1gp.us-east-1.rds.amazonaws.com',
  database: 'metelap_wiki',
  password: 'pz2004cstu',
  port: 5432,
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};