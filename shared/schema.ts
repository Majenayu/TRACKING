import { pgTable, text, timestamp, integer, boolean, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table for authentication
export const users = pgTable('users', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  password: text().notNull(),
  role: text().notNull().default('user'), // 'user', 'business', 'admin'
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Logistics providers (couriers, transport companies)
export const providers = pgTable('providers', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: text().notNull(),
  code: text().notNull().unique(),
  apiEndpoint: text(),
  supportedModes: text().array().notNull(), // 'road', 'rail', 'air', 'sea'
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

// Shipments table
export const shipments = pgTable('shipments', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  trackingNumber: text().notNull().unique(),
  providerId: integer().notNull(),
  senderId: integer().notNull(),
  receiverId: integer().notNull(),
  origin: text().notNull(),
  destination: text().notNull(),
  transportMode: text().notNull(), // 'road', 'rail', 'air', 'sea'
  currentStatus: text().notNull().default('pending'), // 'pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'
  estimatedDelivery: timestamp(),
  actualDelivery: timestamp(),
  weight: real(),
  dimensions: text(), // JSON string with length, width, height
  value: real(),
  isFragile: boolean().default(false),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Tracking events for shipments
export const trackingEvents = pgTable('tracking_events', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  shipmentId: integer().notNull(),
  eventType: text().notNull(), // 'created', 'picked_up', 'in_transit', 'delivered', 'delayed', 'exception'
  description: text().notNull(),
  location: text(),
  latitude: real(),
  longitude: real(),
  timestamp: timestamp().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

// Business integrations
export const integrations = pgTable('integrations', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: integer().notNull(),
  businessName: text().notNull(),
  apiKey: text().notNull().unique(),
  webhookUrl: text(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentShipments: many(shipments, { relationName: 'sender' }),
  receivedShipments: many(shipments, { relationName: 'receiver' }),
  integrations: many(integrations),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  shipments: many(shipments),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  provider: one(providers, {
    fields: [shipments.providerId],
    references: [providers.id],
  }),
  sender: one(users, {
    fields: [shipments.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [shipments.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
  trackingEvents: many(trackingEvents),
}));

export const trackingEventsRelations = relations(trackingEvents, ({ one }) => ({
  shipment: one(shipments, {
    fields: [trackingEvents.shipmentId],
    references: [shipments.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(users, {
    fields: [integrations.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrackingEventSchema = createInsertSchema(trackingEvents).omit({
  id: true,
  createdAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = z.infer<typeof insertTrackingEventSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;