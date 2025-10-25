import express from "express";
import * as webhookRouterModule from "./infrastructure/http/express/routes/webhookRoutes.js";
import protocoloRouter from "./infrastructure/http/express/routes/protocoloRoutes.js";

const app = express();

const webhookRouter = webhookRouterModule.default || webhookRouterModule;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/webhooks", webhookRouter);
app.use("/protocolo", protocoloRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

export default app;
