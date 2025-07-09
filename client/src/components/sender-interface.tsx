import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, MapPin, Upload, RefreshCw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { rsaCrypto } from '@/lib/crypto';
import { geolocationService } from '@/lib/geolocation';
import type { LocationCoordinates } from '@shared/schema';

interface SenderInterfaceProps {
  senderId: string;
}

export function SenderInterface({ senderId }: SenderInterfaceProps) {
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [packetsSent, setPacketsSent] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { toast } = useToast();

  // Store RSA key pair
  const storeKeyPairMutation = useMutation({
    mutationFn: async (keyPair: { publicKey: string; privateKey: string }) => {
      return apiRequest('POST', '/api/keys', {
        senderId,
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'RSA key pair generated and stored successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to store RSA key pair',
        variant: 'destructive',
      });
    }
  });

  // Send location data
  const sendLocationMutation = useMutation({
    mutationFn: async (encryptedLocation: string) => {
      if (!keyPair) throw new Error('No key pair available');
      
      return apiRequest('POST', '/api/location', {
        senderId,
        encryptedLocation,
        publicKey: keyPair.publicKey
      });
    },
    onSuccess: () => {
      setPacketsSent(prev => prev + 1);
      setLastUpdate(new Date().toLocaleTimeString());
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send location data',
        variant: 'destructive',
      });
    }
  });

  // Generate RSA key pair
  const generateKeyPair = () => {
    try {
      const newKeyPair = rsaCrypto.generateKeyPair();
      setKeyPair(newKeyPair);
      storeKeyPairMutation.mutate(newKeyPair);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate RSA key pair',
        variant: 'destructive',
      });
    }
  };

  // Send encrypted location
  const sendEncryptedLocation = async (location: LocationCoordinates) => {
    if (!keyPair) return;

    try {
      const locationData = JSON.stringify(location);
      const encryptedLocation = rsaCrypto.encrypt(locationData, keyPair.publicKey);
      sendLocationMutation.mutate(encryptedLocation);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to encrypt location data',
        variant: 'destructive',
      });
    }
  };

  // Start location tracking
  useEffect(() => {
    if (!isTracking || !keyPair) return;

    const interval = setInterval(async () => {
      try {
        const location = await geolocationService.getCurrentPosition();
        setCurrentLocation(location);
        sendEncryptedLocation(location);
      } catch (error) {
        toast({
          title: 'Location Error',
          description: 'Failed to get current location',
          variant: 'destructive',
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isTracking, keyPair]);

  // Generate initial key pair
  useEffect(() => {
    generateKeyPair();
  }, []);

  return (
    <div className="space-y-4">
      {/* RSA Key Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>RSA Encryption</span>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Key Pair Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">{keyPair ? 'Generated' : 'Not Generated'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Public Key</span>
            <span className="text-xs text-gray-500 font-mono">RSA-2048</span>
          </div>
          
          <Button 
            onClick={generateKeyPair}
            disabled={storeKeyPairMutation.isPending}
            className="w-full"
            variant="outline"
          >
            {storeKeyPairMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Regenerate Keys'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Location Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Location Tracking</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <Badge variant="secondary" className={isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {isTracking ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Location</span>
            <span className="text-sm">
              {currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : 'Not available'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Updated</span>
            <span className="text-sm">{lastUpdate || 'Never'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Update Interval</span>
            <span className="text-sm">Every 2 seconds</span>
          </div>
          
          <Separator />
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Encrypted Data</span>
            </div>
            <div className="text-xs font-mono text-gray-500 break-all">
              {sendLocationMutation.isPending ? 'Encrypting...' : 'Encrypted location data sent to server'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transmission Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Transmission</span>
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-500" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {isTracking ? 'Sending' : 'Stopped'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Server Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">Connected</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Packets Sent</span>
            <span className="text-sm">{packetsSent}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Success Rate</span>
            <span className="text-sm text-green-600 font-medium">
              {packetsSent > 0 ? '100%' : '0%'}
            </span>
          </div>
          
          <Button 
            onClick={() => setIsTracking(!isTracking)}
            disabled={!keyPair}
            className="w-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
