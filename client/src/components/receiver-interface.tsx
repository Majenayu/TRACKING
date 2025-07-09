import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Link2, Eye, EyeOff, RefreshCw, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { rsaCrypto } from '@/lib/crypto';
import { geolocationService } from '@/lib/geolocation';
import { distanceCalculator } from '@/lib/distance';
import { HereMap } from './here-map';
import type { LocationCoordinates, LocationData, RsaKeyPair } from '@shared/schema';

interface ReceiverInterfaceProps {
  senderId: string;
}

export function ReceiverInterface({ senderId }: ReceiverInterfaceProps) {
  const [receiverLocation, setReceiverLocation] = useState<LocationCoordinates | null>(null);
  const [senderLocation, setSenderLocation] = useState<LocationCoordinates | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const { toast } = useToast();

  // Fetch RSA key pair
  const { data: keyPair } = useQuery<RsaKeyPair>({
    queryKey: ['/api/keys', senderId],
    refetchInterval: false,
  });

  // Fetch encrypted location data
  const { data: locationData, isLoading: isLocationLoading } = useQuery<LocationData>({
    queryKey: ['/api/location', senderId],
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Get receiver's current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const location = await geolocationService.getCurrentPosition();
        setReceiverLocation(location);
      } catch (error) {
        toast({
          title: 'Location Error',
          description: 'Failed to get your current location',
          variant: 'destructive',
        });
      }
    };

    getCurrentLocation();
  }, []);

  // Decrypt and process location data
  useEffect(() => {
    if (!locationData || !keyPair || !receiverLocation) return;

    try {
      const decryptedData = rsaCrypto.decrypt(locationData.encryptedLocation, keyPair.privateKey);
      const coordinates: LocationCoordinates = JSON.parse(decryptedData);
      
      setSenderLocation(coordinates);
      
      // Calculate distance
      const calculatedDistance = distanceCalculator.calculateDistance(receiverLocation, coordinates);
      setDistance(calculatedDistance);
      
      // Check if within 1km range
      const withinRange = calculatedDistance <= 1.0;
      setIsWithinRange(withinRange);
      
    } catch (error) {
      toast({
        title: 'Decryption Error',
        description: 'Failed to decrypt location data',
        variant: 'destructive',
      });
    }
  }, [locationData, keyPair, receiverLocation]);

  const formatDistance = (dist: number) => {
    if (dist < 1) {
      return `${(dist * 1000).toFixed(0)} meters`;
    }
    return `${dist.toFixed(2)} km`;
  };

  const getDistancePercentage = () => {
    return Math.min((distance / 1.0) * 100, 100);
  };

  return (
    <div className="space-y-4">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connection Status</span>
            <div className="flex items-center space-x-2">
              <Link2 className="w-5 h-5 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Private Key</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${keyPair ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{keyPair ? 'Loaded' : 'Not Available'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Data Fetching</span>
            <span className="text-sm">Every 2 seconds</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Sync</span>
            <span className="text-sm">
              {locationData ? new Date(locationData.timestamp).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Distance Calculation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Proximity Status</span>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <Badge variant="secondary" className={isWithinRange ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>
                {isWithinRange ? 'Within Range' : 'Out of Range'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {formatDistance(distance)}
            </div>
            <div className="text-sm text-gray-600">distance away</div>
          </div>
          
          <div className="space-y-2">
            <Progress value={getDistancePercentage()} className="h-2" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>0 km</span>
              <span>1 km range</span>
            </div>
          </div>
          
          <div className={`border rounded-lg p-3 ${isWithinRange ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              {isWithinRange ? (
                <Eye className="w-4 h-4 text-orange-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-600" />
              )}
              <span className={`text-sm font-medium ${isWithinRange ? 'text-orange-800' : 'text-gray-800'}`}>
                {isWithinRange ? 'Location Visible' : 'Location Hidden'}
              </span>
            </div>
            <p className={`text-xs mt-1 ${isWithinRange ? 'text-orange-700' : 'text-gray-700'}`}>
              {isWithinRange ? 'Sender is within 1km range' : 'Sender is outside 1km range'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Location Details</span>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sender Location</span>
            <span className="text-sm">
              {senderLocation && isWithinRange
                ? `${senderLocation.latitude.toFixed(4)}, ${senderLocation.longitude.toFixed(4)}`
                : 'Hidden'
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your Location</span>
            <span className="text-sm">
              {receiverLocation
                ? `${receiverLocation.latitude.toFixed(4)}, ${receiverLocation.longitude.toFixed(4)}`
                : 'Loading...'
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Calculation Method</span>
            <span className="text-sm">Haversine Formula</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Data Encrypted</span>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">RSA-2048</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HERE Map Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Map View</span>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                HERE Maps
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 pb-0">
            <HereMap
              senderLocation={senderLocation}
              receiverLocation={receiverLocation}
              isVisible={isWithinRange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
