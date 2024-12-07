// server/routes/airports.js
import express from 'express';
const router = express.Router();

// Get all airports
router.get('/airports', async (req, res) => {
  try {
    const airports = await req.app.locals.db.collection('airports')
      .find()
      .limit(100)  // Limit to first 100 for safety
      .toArray();
    res.json(airports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch airports' });
  }
});

// Get single airport by IATA code
router.get('/airports/:iata', async (req, res) => {
  try {
    const airport = await req.app.locals.db.collection('airports')
      .findOne({ iata: req.params.iata.toUpperCase() });
    if (!airport) {
      return res.status(404).json({ error: 'Airport not found' });
    }
    res.json(airport);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch airport' });
  }
});

export default router;
