import { users, providers, shipments, trackingEvents, integrations } from "@shared/schema";
import type { User, InsertUser, Provider, InsertProvider, Shipment, InsertShipment, TrackingEvent, InsertTrackingEvent, Integration, InsertIntegration } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  
  // Provider management
  createProvider(provider: InsertProvider): Promise<Provider>;
  getProviders(): Promise<Provider[]>;
  getProviderById(id: number): Promise<Provider | undefined>;
  
  // Shipment management
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined>;
  getShipmentsByUser(userId: number, role: 'sender' | 'receiver'): Promise<Shipment[]>;
  updateShipmentStatus(id: number, status: string): Promise<void>;
  
  // Tracking events
  createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent>;
  getTrackingEventsByShipment(shipmentId: number): Promise<TrackingEvent[]>;
  
  // Integration management
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  getIntegrationsByUser(userId: number): Promise<Integration[]>;
  getIntegrationByApiKey(apiKey: string): Promise<Integration | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const [created] = await db.insert(providers).values(provider).returning();
    return created;
  }

  async getProviders(): Promise<Provider[]> {
    return await db.select().from(providers).where(eq(providers.isActive, true));
  }

  async getProviderById(id: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider;
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const [created] = await db.insert(shipments).values(shipment).returning();
    return created;
  }

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.trackingNumber, trackingNumber));
    return shipment;
  }

  async getShipmentsByUser(userId: number, role: 'sender' | 'receiver'): Promise<Shipment[]> {
    const column = role === 'sender' ? shipments.senderId : shipments.receiverId;
    return await db.select().from(shipments).where(eq(column, userId)).orderBy(desc(shipments.createdAt));
  }

  async updateShipmentStatus(id: number, status: string): Promise<void> {
    await db.update(shipments).set({ 
      currentStatus: status,
      updatedAt: new Date()
    }).where(eq(shipments.id, id));
  }

  async createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent> {
    const [created] = await db.insert(trackingEvents).values(event).returning();
    return created;
  }

  async getTrackingEventsByShipment(shipmentId: number): Promise<TrackingEvent[]> {
    return await db.select().from(trackingEvents)
      .where(eq(trackingEvents.shipmentId, shipmentId))
      .orderBy(desc(trackingEvents.timestamp));
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [created] = await db.insert(integrations).values(integration).returning();
    return created;
  }

  async getIntegrationsByUser(userId: number): Promise<Integration[]> {
    return await db.select().from(integrations).where(eq(integrations.userId, userId));
  }

  async getIntegrationByApiKey(apiKey: string): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.apiKey, apiKey));
    return integration;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private providers: Map<number, Provider> = new Map();
  private shipments: Map<number, Shipment> = new Map();
  private trackingEvents: Map<number, TrackingEvent> = new Map();
  private integrations: Map<number, Integration> = new Map();
  
  private nextUserId = 1;
  private nextProviderId = 1;
  private nextShipmentId = 1;
  private nextTrackingEventId = 1;
  private nextIntegrationId = 1;

  constructor() {
    // Initialize with default providers
    this.createProvider({
      name: 'Blue Dart',
      code: 'BDART',
      supportedModes: ['air', 'road'],
      isActive: true,
    });
    
    this.createProvider({
      name: 'DTDC',
      code: 'DTDC',
      supportedModes: ['road'],
      isActive: true,
    });
    
    this.createProvider({
      name: 'Indian Railways',
      code: 'IRCTC',
      supportedModes: ['rail'],
      isActive: true,
    });

    // Initialize demo user
    this.createUser({
      username: 'demo_user',
      email: 'demo@tracksmart.com',
      password: 'demo123',
      role: 'user',
    });

    // Initialize demo shipments
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo shipments
    const shipment1 = await this.createShipment({
      trackingNumber: 'TS12345678',
      providerId: 1,
      senderId: 1,
      receiverId: 1,
      origin: 'Mumbai, Maharashtra',
      destination: 'Delhi, India',
      transportMode: 'road',
      currentStatus: 'in_transit',
      estimatedDelivery: new Date(Date.now() + 86400000), // tomorrow
      weight: 2.5,
      dimensions: '30x20x15',
      value: 5000,
      isFragile: false,
    });

    const shipment2 = await this.createShipment({
      trackingNumber: 'TS87654321',
      providerId: 2,
      senderId: 1,
      receiverId: 1,
      origin: 'Bangalore, Karnataka',
      destination: 'Chennai, Tamil Nadu',
      transportMode: 'road',
      currentStatus: 'delivered',
      estimatedDelivery: new Date(Date.now() - 3600000), // 1 hour ago
      actualDelivery: new Date(Date.now() - 1800000), // 30 minutes ago
      weight: 1.2,
      dimensions: '25x15x10',
      value: 3000,
      isFragile: true,
    });

    const shipment3 = await this.createShipment({
      trackingNumber: 'TS11223344',
      providerId: 3,
      senderId: 1,
      receiverId: 1,
      origin: 'Kolkata, West Bengal',
      destination: 'Pune, Maharashtra',
      transportMode: 'rail',
      currentStatus: 'pending',
      estimatedDelivery: new Date(Date.now() + 172800000), // 2 days from now
      weight: 5.0,
      dimensions: '40x30x25',
      value: 8000,
      isFragile: false,
    });

    // Create tracking events
    await this.createTrackingEvent({
      shipmentId: shipment1.id,
      eventType: 'created',
      description: 'Shipment created and awaiting pickup',
      location: 'Mumbai, Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777,
      timestamp: new Date(Date.now() - 86400000),
    });

    await this.createTrackingEvent({
      shipmentId: shipment1.id,
      eventType: 'picked_up',
      description: 'Package picked up from sender',
      location: 'Mumbai Central Hub',
      latitude: 19.0176,
      longitude: 72.8562,
      timestamp: new Date(Date.now() - 72000000),
    });

    await this.createTrackingEvent({
      shipmentId: shipment1.id,
      eventType: 'in_transit',
      description: 'Package in transit to destination',
      location: 'Nashik Transit Hub',
      latitude: 19.9975,
      longitude: 73.7898,
      timestamp: new Date(Date.now() - 14400000),
    });

    await this.createTrackingEvent({
      shipmentId: shipment2.id,
      eventType: 'delivered',
      description: 'Package delivered successfully',
      location: 'Chennai, Tamil Nadu',
      latitude: 13.0827,
      longitude: 80.2707,
      timestamp: new Date(Date.now() - 1800000),
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextUserId++,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const newProvider: Provider = {
      id: this.nextProviderId++,
      ...provider,
      createdAt: new Date(),
    };
    this.providers.set(newProvider.id, newProvider);
    return newProvider;
  }

  async getProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values()).filter(p => p.isActive);
  }

  async getProviderById(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const newShipment: Shipment = {
      id: this.nextShipmentId++,
      ...shipment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.shipments.set(newShipment.id, newShipment);
    return newShipment;
  }

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined> {
    return Array.from(this.shipments.values()).find(s => s.trackingNumber === trackingNumber);
  }

  async getShipmentsByUser(userId: number, role: 'sender' | 'receiver'): Promise<Shipment[]> {
    const key = role === 'sender' ? 'senderId' : 'receiverId';
    return Array.from(this.shipments.values())
      .filter(s => s[key] === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateShipmentStatus(id: number, status: string): Promise<void> {
    const shipment = this.shipments.get(id);
    if (shipment) {
      shipment.currentStatus = status;
      shipment.updatedAt = new Date();
    }
  }

  async createTrackingEvent(event: InsertTrackingEvent): Promise<TrackingEvent> {
    const newEvent: TrackingEvent = {
      id: this.nextTrackingEventId++,
      ...event,
      createdAt: new Date(),
    };
    this.trackingEvents.set(newEvent.id, newEvent);
    return newEvent;
  }

  async getTrackingEventsByShipment(shipmentId: number): Promise<TrackingEvent[]> {
    return Array.from(this.trackingEvents.values())
      .filter(e => e.shipmentId === shipmentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const newIntegration: Integration = {
      id: this.nextIntegrationId++,
      ...integration,
      createdAt: new Date(),
    };
    this.integrations.set(newIntegration.id, newIntegration);
    return newIntegration;
  }

  async getIntegrationsByUser(userId: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(i => i.userId === userId);
  }

  async getIntegrationByApiKey(apiKey: string): Promise<Integration | undefined> {
    return Array.from(this.integrations.values()).find(i => i.apiKey === apiKey);
  }
}

export const storage = new MemStorage();