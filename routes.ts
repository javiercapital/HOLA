import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSimulationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Save simulation
  app.post("/api/simulations", async (req, res) => {
    try {
      const validatedData = insertSimulationSchema.parse(req.body);
      const simulation = await storage.createSimulation(validatedData);
      res.json(simulation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Get simulation
  app.get("/api/simulations/:id", async (req, res) => {
    try {
      const simulation = await storage.getSimulation(req.params.id);
      if (!simulation) {
        res.status(404).json({ error: "Simulation not found" });
        return;
      }
      res.json(simulation);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
