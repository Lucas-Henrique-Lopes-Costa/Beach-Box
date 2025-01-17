const express = require("express");
const clientesRoutes = require("./routes/clientes");

const app = express();
const port = 3000;

// Middleware para JSON
app.use(express.json());

// Rotas
app.use("/api/clientes", clientesRoutes);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
