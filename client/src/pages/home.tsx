import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, Settings, RotateCcw } from 'lucide-react';
import { SenderInterface } from '@/components/sender-interface';
import { ReceiverInterface } from '@/components/receiver-interface';

export default function Home() {
  const [mode, setMode] = useState<'sender' | 'receiver'>('sender');
  const [senderId] = useState('default-sender'); // In a real app, this would be dynamic

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-medium">ProximityTracker</h1>
                <p className="text-sm text-blue-100">
                  {mode === 'sender' ? 'Sender Mode' : 'Receiver Mode'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode(mode === 'sender' ? 'receiver' : 'sender')}
              className="text-white hover:bg-white/10"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mode Toggle */}
      <div className="max-w-md mx-auto px-4 py-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => setMode('sender')}
                className={mode === 'sender' ? '' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                variant={mode === 'sender' ? 'default' : 'ghost'}
                size="lg"
              >
                Sender
              </Button>
              <Button
                onClick={() => setMode('receiver')}
                className={mode === 'receiver' ? '' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                variant={mode === 'receiver' ? 'default' : 'ghost'}
                size="lg"
              >
                Receiver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pb-24">
        {mode === 'sender' ? (
          <SenderInterface senderId={senderId} />
        ) : (
          <ReceiverInterface senderId={senderId} />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center space-y-1 text-blue-600">
              <MapPin className="w-6 h-6" />
              <span className="text-xs font-medium">Location</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400">
              <Shield className="w-6 h-6" />
              <span className="text-xs font-medium">Security</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400">
              <Settings className="w-6 h-6" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
