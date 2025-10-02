import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Auth service API",
    description: "Automatically generated swagger docs",
    version: "1.0.0",
  },
  host: "localhost:2025",
  Sschemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointFiles = ["./routes/auth.router.ts"];

swaggerAutogen()(outputFile, endpointFiles, doc);
