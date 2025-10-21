import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import axios from "axios";
import swaggerUi from "swagger-ui-express";
import * as path from "path";
import initializeSiteConfig from "./libs/initializeSiteConfig";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.set("trust proxy", 1);

// rate limit application to avoid spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Trop de requêtes, veuillez réessayer plus tard" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
});

app.use(limiter);

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

app.use("/produit", proxy("http://localhost:2026"));
app.use("/", proxy("http://localhost:2025"));

const port = process.env.PORT || 9090;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Configuration du site initialisé avec succèss !");
  } catch (error) {
    console.error("Configirutaion du site echoué:", error);
  }
});
server.on("error", console.error);
