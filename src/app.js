"use strict";

const express = require("express");
const fs = require("fs");
const yaml = require("js-yaml");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");

const webhookRouter = require("./infrastructure/http/express/routes/webhookRoutes.js");
const protocoloRouter = require("./infrastructure/http/express/routes/protocoloRoutes.js");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/webhooks", webhookRouter);
app.use("/protocolo", protocoloRouter);

try {
  const swaggerDocument = yaml.load(
    fs.readFileSync("./docs/swagger.yml", "utf8")
  );
  app.use("/wb-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.error("Failed to load swagger.yml file:", e);
}

app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("[Erro na Aplicação]:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

console.log("--- app.js: Fim da configuração ---");
module.exports = app;
