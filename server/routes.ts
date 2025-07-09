import { Router } from 'express';

const router = Router();

// In-memory storage for RSA keys and location data
const rsaKeys = new Map(); // senderId -> { publicKey, privateKey }
const locationData = new Map(); // senderId -> { encryptedData, publicKey, timestamp }

// Store RSA keys
router.post('/keys', async (req, res) => {
  try {
    const { senderId, publicKey, privateKey } = req.body;
    
    if (!senderId || !publicKey || !privateKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    rsaKeys.set(senderId, { publicKey, privateKey });
    console.log(`Stored RSA keys for sender: ${senderId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing keys:', error);
    res.status(500).json({ error: 'Failed to store keys' });
  }
});

// Get RSA keys for a sender
router.get('/keys/:senderId', async (req, res) => {
  try {
    const { senderId } = req.params;
    const keys = rsaKeys.get(senderId);
    
    if (!keys) {
      return res.status(404).json({ error: 'Keys not found' });
    }
    
    res.json(keys);
  } catch (error) {
    console.error('Error retrieving keys:', error);
    res.status(500).json({ error: 'Failed to retrieve keys' });
  }
});

// Store encrypted location data
router.post('/location', async (req, res) => {
  try {
    const { senderId, encryptedData, publicKey, timestamp } = req.body;
    
    if (!senderId || !encryptedData || !publicKey || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    locationData.set(senderId, {
      encryptedData,
      publicKey,
      timestamp
    });
    
    console.log(`Updated location data for sender: ${senderId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing location:', error);
    res.status(500).json({ error: 'Failed to store location' });
  }
});

// Get encrypted location data for a sender
router.get('/location/:senderId', async (req, res) => {
  try {
    const { senderId } = req.params;
    const data = locationData.get(senderId);
    
    if (!data) {
      return res.status(404).json({ error: 'Location data not found' });
    }
    
    // Check if data is stale (older than 10 seconds)
    const now = Date.now();
    if (now - data.timestamp > 10000) {
      return res.status(404).json({ error: 'Location data is stale' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error retrieving location:', error);
    res.status(500).json({ error: 'Failed to retrieve location' });
  }
});

// Get all active senders (for debugging)
router.get('/senders', async (req, res) => {
  try {
    const activeSenders = [];
    const now = Date.now();
    
    for (const [senderId, data] of locationData.entries()) {
      if (now - data.timestamp <= 10000) { // Active within last 10 seconds
        activeSenders.push({
          senderId,
          lastSeen: new Date(data.timestamp).toISOString()
        });
      }
    }
    
    res.json(activeSenders);
  } catch (error) {
    console.error('Error getting senders:', error);
    res.status(500).json({ error: 'Failed to get senders' });
  }
});

// Cleanup endpoint to remove stale data
router.delete('/cleanup', async (req, res) => {
  try {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [senderId, data] of locationData.entries()) {
      if (now - data.timestamp > 60000) { // Remove data older than 1 minute
        locationData.delete(senderId);
        removedCount++;
      }
    }
    
    console.log(`Cleaned up ${removedCount} stale location entries`);
    res.json({ cleaned: removedCount });
  } catch (error) {
    console.error('Error cleaning up:', error);
    res.status(500).json({ error: 'Failed to cleanup' });
  }
});

export default router;