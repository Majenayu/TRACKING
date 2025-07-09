import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationDataSchema, insertRsaKeyPairSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Store encrypted location data
  app.post("/api/location", async (req, res) => {
    try {
      const locationData = insertLocationDataSchema.parse(req.body);
      const result = await storage.storeLocationData(locationData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  // Get latest location data for a sender
  app.get("/api/location/:senderId", async (req, res) => {
    try {
      const { senderId } = req.params;
      const locationData = await storage.getLatestLocationData(senderId);
      
      if (!locationData) {
        return res.status(404).json({ error: "Location data not found" });
      }
      
      res.json(locationData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch location data" });
    }
  });

  // Store RSA key pair
  app.post("/api/keys", async (req, res) => {
    try {
      const keyPair = insertRsaKeyPairSchema.parse(req.body);
      const result = await storage.storeRsaKeyPair(keyPair);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid key pair data" });
    }
  });

  // Get RSA key pair for a sender
  app.get("/api/keys/:senderId", async (req, res) => {
    try {
      const { senderId } = req.params;
      const keyPair = await storage.getRsaKeyPair(senderId);
      
      if (!keyPair) {
        return res.status(404).json({ error: "Key pair not found" });
      }
      
      res.json(keyPair);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch key pair" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
