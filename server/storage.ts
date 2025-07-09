import { locationData, rsaKeyPairs, type LocationData, type InsertLocationData, type RsaKeyPair, type InsertRsaKeyPair } from "@shared/schema";

export interface IStorage {
  // Location data operations
  storeLocationData(data: InsertLocationData): Promise<LocationData>;
  getLatestLocationData(senderId: string): Promise<LocationData | undefined>;
  
  // RSA key pair operations
  storeRsaKeyPair(keyPair: InsertRsaKeyPair): Promise<RsaKeyPair>;
  getRsaKeyPair(senderId: string): Promise<RsaKeyPair | undefined>;
}

export class MemStorage implements IStorage {
  private locationData: Map<string, LocationData>;
  private rsaKeyPairs: Map<string, RsaKeyPair>;
  private currentLocationId: number;
  private currentKeyPairId: number;

  constructor() {
    this.locationData = new Map();
    this.rsaKeyPairs = new Map();
    this.currentLocationId = 1;
    this.currentKeyPairId = 1;
  }

  async storeLocationData(data: InsertLocationData): Promise<LocationData> {
    const locationEntry: LocationData = {
      ...data,
      id: this.currentLocationId++,
      timestamp: new Date(),
    };
    
    this.locationData.set(data.senderId, locationEntry);
    return locationEntry;
  }

  async getLatestLocationData(senderId: string): Promise<LocationData | undefined> {
    return this.locationData.get(senderId);
  }

  async storeRsaKeyPair(keyPair: InsertRsaKeyPair): Promise<RsaKeyPair> {
    const keyPairEntry: RsaKeyPair = {
      ...keyPair,
      id: this.currentKeyPairId++,
      timestamp: new Date(),
    };
    
    this.rsaKeyPairs.set(keyPair.senderId, keyPairEntry);
    return keyPairEntry;
  }

  async getRsaKeyPair(senderId: string): Promise<RsaKeyPair | undefined> {
    return this.rsaKeyPairs.get(senderId);
  }
}

export const storage = new MemStorage();
