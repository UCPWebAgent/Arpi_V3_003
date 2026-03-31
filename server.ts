import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory cache for parts
const partsCache = new Map<string, any>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // License Plate Lookup API
  app.post('/api/lookup/plate', async (req, res) => {
    const { plate, state } = req.body;
    const username = process.env.PLATE_LOOKUP_USERNAME;

    if (!username) {
      console.warn('PLATE_LOOKUP_USERNAME not configured.');
      return res.status(500).json({ message: 'Plate lookup provider not configured.' });
    }

    try {
      // Using RegCheck as a real provider for US plates
      const url = `https://www.regcheck.org.uk/api/reg.asmx/CheckUSA?RegistrationNumber=${plate}&State=${state}&username=${username}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Provider responded with status: ${response.status}`);
      }

      const xmlText = await response.text();
      
      // RegCheck returns JSON wrapped in XML: <string xmlns="...">{"Description":"...","RegistrationYear":"...",...}</string>
      const jsonMatch = xmlText.match(/<string[^>]*>(.*)<\/string>/s);
      
      if (!jsonMatch || !jsonMatch[1]) {
        console.warn('Could not extract JSON from provider response:', xmlText);
        return res.status(404).json({ message: 'Vehicle not found for this plate/state.' });
      }

      const data = JSON.parse(jsonMatch[1]);
      
      if (!data || data.Description === "NOT FOUND") {
        return res.status(404).json({ message: 'Vehicle not found.' });
      }

      // Map RegCheck fields to our VehicleInfo structure
      const vehicle = {
        year: data.RegistrationYear || data.ModelYear,
        make: data.MakeDescription || data.Make,
        model: data.ModelDescription || data.Model,
        trim: data.SeriesDescription || data.Trim,
        engine: data.EngineSize || data.EngineDescription,
        vin: data.VIN || data.Vin,
      };

      res.json({ vehicle });
    } catch (error) {
      console.error('Plate Lookup Server Error:', error);
      res.status(500).json({ message: 'Failed to lookup plate with provider.' });
    }
  });

  // Orders API
  app.post('/api/orders', async (req, res) => {
    const order = req.body;
    console.log(`Processing Order for ${order.mechanicName} at ${order.shopName}`);
    
    // Simulate backend processing (e.g., sending to a parts supplier)
    setTimeout(() => {
      res.json({
        status: 'success',
        orderId: `ABC-${Math.floor(Math.random() * 1000000)}`,
        message: 'Order received and queued for fulfillment'
      });
    }, 1200);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arpi Server running on http://localhost:${PORT}`);
  });
}

startServer();
