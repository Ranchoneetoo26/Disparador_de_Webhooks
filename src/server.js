// src/server.js
'use strict';

console.log('--- server.js: Iniciando ---');
import app from "./app.js";
console.log("--- server.js: App importado ---");

const PORT = process.env.PORT || 3333;
console.log(`--- server.js: Tentando iniciar na porta ${PORT} ---`);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando!`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}`);
  console.log(`📘 Documentação Swagger: http://localhost:${PORT}/wb-docs/`);
});