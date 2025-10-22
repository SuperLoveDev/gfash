import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import router from "./routes/product.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.send({ message: "Welcome to product-service!" });
});

app.use("/api", router);
app.use(errorMiddleware);

const port = process.env.PORT || 2026;
const server = app.listen(port, () => {
  console.log(`Product service is running at http://localhost:${port}/api`);
});
server.on("error", console.error);
