import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";
import routes from "./routes";
import errorHandler from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { specs } from "./utils/swagger";
import { SocketService } from "./services/socket.service";
import type { Request, Response } from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const apiPrefix = "/api";
app.use(
  `${apiPrefix}/docs`,
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Property Management API Documentation",
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const socketService = new SocketService(server);

// Make socket service available globally
declare global {
  var socketService: SocketService;
}
global.socketService = socketService;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});

export default app;
