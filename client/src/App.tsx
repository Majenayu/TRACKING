import { useState, useEffect } from 'react';
import { Router, Route, Switch, Link, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Search, Plus, BarChart3, Settings, Truck, MapPin, Clock } from 'lucide-react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Mock user for demo purposes
const mockUser = {
  id: 1,
  username: 'demo_user',
  email: 'demo@tracksmart.com',
  role: 'user',
};

function Navigation() {
  const [location] = useLocation();
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/track', label: 'Track Shipment', icon: Search },
    { href: '/send', label: 'Send Package', icon: Plus },
    { href: '/shipments', label: 'My Shipments', icon: Package },
    { href: '/receive', label: 'Receiving', icon: Truck },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TrackSmart</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
  });

  useEffect(() => {
    // Simulate loading dashboard data
    setStats({
      totalSent: 12,
      totalReceived: 8,
      inTransit: 3,
      delivered: 15,
      pending: 2,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="secondary">Welcome, {mockUser.username}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">Currently shipping</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting pickup</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
            <CardDescription>Your latest package deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">TS{String(i).padStart(8, '0')}</p>
                    <p className="text-sm text-gray-600">Mumbai → Delhi</p>
                  </div>
                  <Badge variant="outline">In Transit</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logistics Partners</CardTitle>
            <CardDescription>Available shipping providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Blue Dart', 'DTDC', 'Indian Railways'].map((provider) => (
                <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{provider}</span>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/shipments/track/${trackingNumber}`);
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
      } else {
        throw new Error('Shipment not found');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Shipment not found. Please check the tracking number.",
        variant: "destructive",
      });
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Track Shipment</h1>
        <p className="text-gray-600 mt-2">Enter your tracking number to get real-time updates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Track Your Package</CardTitle>
          <CardDescription>Enter the tracking number provided by the sender</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter tracking number (e.g., TS12345678)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTrack} disabled={isLoading}>
              {isLoading ? 'Tracking...' : 'Track'}
            </Button>
          </div>

          {trackingData && (
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">Tracking Number: {trackingData.shipment.trackingNumber}</p>
                    <p className="text-blue-700">{trackingData.shipment.origin} → {trackingData.shipment.destination}</p>
                  </div>
                  <Badge variant="secondary">{trackingData.shipment.currentStatus}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Tracking History</h3>
                {trackingData.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.timestamp).toLocaleString()}
                        {event.location && ` • ${event.location}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SendPackage() {
  const [formData, setFormData] = useState({
    receiverId: '',
    providerId: 1,
    origin: '',
    destination: '',
    transportMode: 'road',
    weight: '',
    dimensions: '',
    value: '',
    isFragile: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          senderId: mockUser.id,
          receiverId: parseInt(formData.receiverId) || mockUser.id,
          weight: parseFloat(formData.weight) || 0,
          value: parseFloat(formData.value) || 0,
        }),
      });

      if (response.ok) {
        const shipment = await response.json();
        toast({
          title: "Success",
          description: `Shipment created with tracking number: ${shipment.trackingNumber}`,
        });
        // Reset form
        setFormData({
          receiverId: '',
          providerId: 1,
          origin: '',
          destination: '',
          transportMode: 'road',
          weight: '',
          dimensions: '',
          value: '',
          isFragile: false,
        });
      } else {
        throw new Error('Failed to create shipment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Send Package</h1>
        <p className="text-gray-600 mt-2">Create a new shipment and get tracking information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Details</CardTitle>
          <CardDescription>Fill in the package information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  placeholder="e.g., Mumbai, Maharashtra"
                  required
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  placeholder="e.g., Delhi, India"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="0.5"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="value">Value (₹)</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dimensions">Dimensions (L x W x H cm)</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                placeholder="e.g., 20 x 15 x 10"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating Shipment...' : 'Create Shipment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function MyShipments() {
  const [activeTab, setActiveTab] = useState('sent');
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    // Simulate loading shipments
    setShipments([
      {
        id: 1,
        trackingNumber: 'TS12345678',
        origin: 'Mumbai',
        destination: 'Delhi',
        currentStatus: 'in_transit',
        provider: 'Blue Dart',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        trackingNumber: 'TS87654321',
        origin: 'Bangalore',
        destination: 'Chennai',
        currentStatus: 'delivered',
        provider: 'DTDC',
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
        <p className="text-gray-600 mt-2">Track all your sent and received packages</p>
      </div>

      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'sent' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sent')}
        >
          Sent Packages
        </Button>
        <Button
          variant={activeTab === 'received' ? 'default' : 'outline'}
          onClick={() => setActiveTab('received')}
        >
          Received Packages
        </Button>
      </div>

      <div className="space-y-4">
        {shipments.map((shipment) => (
          <Card key={shipment.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold">{shipment.trackingNumber}</p>
                  <p className="text-sm text-gray-600">{shipment.origin} → {shipment.destination}</p>
                  <p className="text-sm text-gray-500">via {shipment.provider}</p>
                </div>
                <div className="text-right">
                  <Badge variant={shipment.currentStatus === 'delivered' ? 'default' : 'secondary'}>
                    {shipment.currentStatus}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(shipment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/track" component={TrackShipment} />
                <Route path="/send" component={SendPackage} />
                <Route path="/shipments" component={MyShipments} />
                <Route path="/receive" component={MyShipments} />
              </Switch>
            </div>
          </main>
        </div>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;