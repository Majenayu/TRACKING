import { LocationCoordinates } from '@shared/schema';

export class DistanceCalculator {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param coord1 First coordinate
   * @param coord2 Second coordinate
   * @returns Distance in kilometers
   */
  calculateDistance(coord1: LocationCoordinates, coord2: LocationCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if two coordinates are within specified range
   * @param coord1 First coordinate
   * @param coord2 Second coordinate
   * @param maxDistance Maximum distance in kilometers
   * @returns True if within range
   */
  isWithinRange(coord1: LocationCoordinates, coord2: LocationCoordinates, maxDistance: number): boolean {
    const distance = this.calculateDistance(coord1, coord2);
    return distance <= maxDistance;
  }
}

export const distanceCalculator = new DistanceCalculator();
