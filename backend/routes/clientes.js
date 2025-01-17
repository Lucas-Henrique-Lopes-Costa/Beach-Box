const express = require(".pnpm/express@4.21.2/node_modules/express");
const pool = require("../db/pool");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.nome, c.telefone, 
             array_agg(ce.endereco) AS enderecos
      FROM "beach-box"."Cliente" c
      LEFT JOIN "beach-box"."ClienteEndereco" ce ON c.id = ce."idCliente"
      GROUP BY c.id, c.nome, c.telefone;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).send("Erro no servidor");
  }
});

module.exports = router;
