import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSignUp, handleLogin, handleGetCurrentUser, handleDeleteAccount } from "./routes/auth";
import {
  handleGetExpenses,
  handleCreateExpense,
  handleDeleteExpense,
} from "./routes/expenses";
import { verifyToken } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes (public)
  app.post("/api/auth/signup", handleSignUp);
  app.post("/api/auth/login", handleLogin);

  // Auth routes (protected)
  app.get("/api/auth/me", verifyToken, handleGetCurrentUser);

  // Expense routes (protected)
  app.get("/api/expenses", verifyToken, handleGetExpenses);
  app.post("/api/expenses", verifyToken, handleCreateExpense);
  app.delete("/api/expenses/:id", verifyToken, handleDeleteExpense);

  return app;
}
