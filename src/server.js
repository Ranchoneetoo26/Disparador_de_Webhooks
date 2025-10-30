console.log("--- server.js: Iniciando ---"); 
import app from "./app.js";
console.log("--- server.js: app importado ---"); 

const PORT = process.env.PORT || 3333;

console.log(`--- server.js: Tentando iniciar na porta ${PORT} ---`); 
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});