"use strict";

require('dotenv').config();

console.log("--- server.js: Iniciando ---");
const app = require("./app.js");
console.log("--- server.js: App importado ---");

const PORT = process.env.PORT || 3333;
console.log(`--- server.js: Tentando iniciar na porta ${PORT} ---`);

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`🚀 Server running on port ${PORT}`);
=======
  console.log(`🚀 Servidor rodando!`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}`);
  console.log(`📘 Documentação Swagger: http://localhost:${PORT}/wb-docs/`);
>>>>>>> 147c0084fb6ff328823fc70425debc9e25fd26ed
});