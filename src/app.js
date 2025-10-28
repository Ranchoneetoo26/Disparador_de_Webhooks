import express from "express";
import * as webhookRouterModule from "./infrastructure/http/express/routes/webhookRoutes.js";
import protocoloRouter from "./infrastructure/http/express/routes/protocoloRoutes.js";

import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";

const app = express();

const webhookRouter = webhookRouterModule.default || webhookRouterModule;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/webhooks", webhookRouter);
app.use("/protocolo", protocoloRouter);

try {
  const swaggerDocument = yaml.load(
    fs.readFileSync("./docs/Swagger.yml", "utf8")
  );
  app.use("/wb-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.error("Failed to load swagger.yml file:", e);
}

app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

console.log("--- app.js: Fim da configuração ---");
export default app;
