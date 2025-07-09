import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locationData = pgTable("location_data", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  encryptedLocation: text("encrypted_location").notNull(),
  publicKey: text("public_key").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const rsaKeyPairs = pgTable("rsa_key_pairs", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertLocationDataSchema = createInsertSchema(locationData).pick({
  senderId: true,
  encryptedLocation: true,
  publicKey: true,
});

export const insertRsaKeyPairSchema = createInsertSchema(rsaKeyPairs).pick({
  senderId: true,
  publicKey: true,
  privateKey: true,
});

export type InsertLocationData = z.infer<typeof insertLocationDataSchema>;
export type LocationData = typeof locationData.$inferSelect;
export type InsertRsaKeyPair = z.infer<typeof insertRsaKeyPairSchema>;
export type RsaKeyPair = typeof rsaKeyPairs.$inferSelect;

// Client-side types for location coordinates
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface DecryptedLocationData {
  senderId: string;
  coordinates: LocationCoordinates;
  timestamp: string;
}
