import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// In-memory storage
const storage = {
    locationData: new Map(),
    rsaKeyPairs: new Map(),
    currentLocationId: 1,
    currentKeyPairId: 1
};

// API Routes

// Store RSA key pair
app.post('/api/keys', (req, res) => {
    try {
        const { senderId, publicKey, privateKey } = req.body;
        
        if (!senderId || !publicKey || !privateKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const keyPairEntry = {
            id: storage.currentKeyPairId++,
            senderId,
            publicKey,
            privateKey,
            timestamp: new Date()
        };

        storage.rsaKeyPairs.set(senderId, keyPairEntry);
        res.json(keyPairEntry);
    } catch (error) {
        console.error('Error storing key pair:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get RSA key pair for a sender
app.get('/api/keys/:senderId', (req, res) => {
    try {
        const { senderId } = req.params;
        const keyPair = storage.rsaKeyPairs.get(senderId);
        
        if (!keyPair) {
            return res.status(404).json({ error: 'Key pair not found' });
        }
        
        res.json(keyPair);
    } catch (error) {
        console.error('Error fetching key pair:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Store encrypted location data
app.post('/api/location', (req, res) => {
    try {
        const { senderId, encryptedLocation, publicKey } = req.body;
        
        if (!senderId || !encryptedLocation || !publicKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const locationEntry = {
            id: storage.currentLocationId++,
            senderId,
            encryptedLocation,
            publicKey,
            timestamp: new Date()
        };

        storage.locationData.set(senderId, locationEntry);
        res.json(locationEntry);
    } catch (error) {
        console.error('Error storing location data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest location data for a sender
app.get('/api/location/:senderId', (req, res) => {
    try {
        const { senderId } = req.params;
        const locationData = storage.locationData.get(senderId);
        
        if (!locationData) {
            return res.status(404).json({ error: 'Location data not found' });
        }
        
        res.json(locationData);
    } catch (error) {
        console.error('Error fetching location data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        storage: {
            locations: storage.locationData.size,
            keyPairs: storage.rsaKeyPairs.size
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to view the application`);
});

export default app;