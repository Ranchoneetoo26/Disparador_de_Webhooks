console.log("--- server.js: Iniciando ---"); // <-- Adicione aqui
import app from "./app.js";
console.log("--- server.js: app importado ---"); // <-- Adicione aqui

const PORT = process.env.PORT || 3333;

console.log(`--- server.js: Tentando iniciar na porta ${PORT} ---`); // <-- Adicione aqui
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
