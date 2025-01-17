const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "caustically-adroit-bug.data-1.use1.tembo.io",
  database: "beach-box",
  password: "SRorljwFz94osiKz",
  port: 5432,
});

module.exports = pool;
