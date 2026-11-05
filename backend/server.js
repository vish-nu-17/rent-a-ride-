import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import adminRoute from "./routes/adminRoute.js";
import vendorRoute from "./routes/venderRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { cloudinaryConfig } from "./utils/cloudinaryConfig.js";
import { initPostgres } from "./db/postgres.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const App = express();
const port = process.env.PORT || 3000;

App.use(express.json());
App.use(cookieParser());

const allowedOrigins = [
  "https://rent-a-ride-two.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

App.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

App.use("*", cloudinaryConfig);
App.use("/api/user", userRoute);
App.use("/api/auth", authRoute);
App.use("/api/admin", adminRoute);
App.use("/api/vendor", vendorRoute);

App.get("/api/health", (req, res) => {
  res.json({
    succes: true,
    message: "server running",
    postgres: true,
  });
});

App.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "internal server error";
  return res.status(statusCode).json({
    succes: false,
    message,
    statusCode,
  });
});

async function start() {
  await initPostgres();
  console.log("connected to local PostgreSQL");
  App.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
