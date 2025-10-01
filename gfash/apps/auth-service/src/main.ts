import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

const port = process.env.PORT || 2025;
const server = app.listen(port, () => {
  console.log(`Auth service is running at http://localhost:${port}/api`);
});

server.on("error", (err) => {
  console.log("Server error:", err);
});
