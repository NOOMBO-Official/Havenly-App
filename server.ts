import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const SPOTIFY_CLIENT_ID =
    process.env.SPOTIFY_CLIENT_ID || "124883cc46964016bb89cbd017f3ae14";
  const SPOTIFY_CLIENT_SECRET =
    process.env.SPOTIFY_CLIENT_SECRET || "acbd81d0c68243e582c85a8005d93a02";

  // In-memory store for tokens (for demo purposes)
  let spotifyTokens: {
    access_token: string | null;
    refresh_token: string | null;
    expires_at: number | null;
  } = {
    access_token: null,
    refresh_token: null,
    expires_at: null,
  };

  app.get("/api/auth/spotify/redirect", (req, res) => {
    let redirectUri = req.query.redirectUri as string;
    if (!redirectUri) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const appUrl = process.env.APP_URL || `${protocol}://${host}`;
      redirectUri = `${appUrl.replace(/\/$/, '')}/api/auth/spotify/callback`;
    }
    
    const scope =
      "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming app-remote-control user-read-email user-read-private";

    const state = Buffer.from(JSON.stringify({ redirectUri })).toString('base64url');

    const params = new URLSearchParams({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  });

  app.get("/api/auth/spotify/url", (req, res) => {
    // Use redirectUri from query if provided, otherwise fallback
    let redirectUri = req.query.redirectUri as string;
    if (!redirectUri) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const appUrl = process.env.APP_URL || `${protocol}://${host}`;
      redirectUri = `${appUrl.replace(/\/$/, '')}/api/auth/spotify/callback`;
    }
    
    const scope =
      "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming app-remote-control user-read-email user-read-private";

    // Pass the redirectUri in the state parameter so we can use it in the callback
    const state = Buffer.from(JSON.stringify({ redirectUri })).toString('base64url');

    const params = new URLSearchParams({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
    });

    res.json({
      url: `https://accounts.spotify.com/authorize?${params.toString()}`,
    });
  });

  app.get(["/api/auth/spotify/callback", "/api/auth/spotify/callback/"], async (req, res) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    
    let redirectUri = "";
    try {
      if (state) {
        const decodedState = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
        redirectUri = decodedState.redirectUri;
      }
    } catch (e) {
      console.error("Failed to parse state", e);
    }
    
    if (!redirectUri) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const appUrl = process.env.APP_URL || `${protocol}://${host}`;
      redirectUri = `${appUrl.replace(/\/$/, '')}/api/auth/spotify/callback`;
    }

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          code: code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        spotifyTokens = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Date.now() + data.expires_in * 1000,
        };

        res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS' }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>Authentication successful. This window should close automatically.</p>
            </body>
          </html>
        `);
      } else {
        res.status(400).send("Authentication failed: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error exchanging code for token", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/spotify/token", async (req, res) => {
    if (!spotifyTokens.access_token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if token is expired
    if (spotifyTokens.expires_at && Date.now() > spotifyTokens.expires_at) {
      // Refresh token
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: spotifyTokens.refresh_token || "",
          }),
        });

        const data = await response.json();
        if (data.access_token) {
          spotifyTokens.access_token = data.access_token;
          if (data.refresh_token) {
            spotifyTokens.refresh_token = data.refresh_token;
          }
          spotifyTokens.expires_at = Date.now() + data.expires_in * 1000;
        } else {
          return res.status(401).json({ error: "Failed to refresh token" });
        }
      } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }

    res.json({ access_token: spotifyTokens.access_token });
  });

  app.get("/api/spotify/status", (req, res) => {
    res.json({ connected: !!spotifyTokens.access_token });
  });

  app.post("/api/spotify/disconnect", (req, res) => {
    spotifyTokens = {
      access_token: null,
      refresh_token: null,
      expires_at: null,
    };
    res.json({ success: true });
  });

  app.get("/api/test-env-2", (req, res) => {
    res.json({
      keys: Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY') || k.includes('GEMINI') || k.includes('GOOGLE')),
    });
  });

  // In-memory store for automations and sketches
  let automations: any[] = [];
  let sketches: any[] = [];
  let events: any[] = [];
  const connectedDevices = new Map<string, any>();

  // Endpoint to trigger OTA update
  app.post('/api/devices/:id/ota', express.json(), (req, res) => {
    const deviceId = req.params.id;
    const device = connectedDevices.get(deviceId);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found or offline' });
    }
    
    // Send OTA command to the actual device
    device.ws.send(JSON.stringify({
      type: 'start_ota',
      firmwareUrl: req.body.firmwareUrl || 'http://example.com/firmware.bin'
    }));
    
    res.json({ success: true, message: 'OTA command sent to device' });
  });

  app.get('/api/events', (req, res) => {
    res.json(events);
  });

  app.post('/api/events', express.json(), (req, res) => {
    const newEvent = { id: Date.now().toString(), ...req.body };
    events.push(newEvent);
    res.json(newEvent);
  });

  app.delete('/api/events/:id', (req, res) => {
    events = events.filter(e => e.id !== req.params.id);
    res.json({ success: true });
  });

  app.get('/api/automations', (req, res) => {
    res.json(automations);
  });

  app.post('/api/automations', express.json(), (req, res) => {
    const newAutomation = { id: Date.now().toString(), ...req.body };
    automations.push(newAutomation);
    res.json(newAutomation);
  });

  app.delete('/api/automations/:id', (req, res) => {
    automations = automations.filter(a => a.id !== req.params.id);
    res.json({ success: true });
  });

  app.put('/api/automations/:id', express.json(), (req, res) => {
    automations = automations.map(a => a.id === req.params.id ? { ...a, ...req.body } : a);
    res.json({ success: true });
  });

  app.get('/api/sketches', (req, res) => {
    res.json(sketches);
  });

  app.post('/api/sketches', express.json(), (req, res) => {
    const newSketch = { id: Date.now().toString(), ...req.body };
    sketches.push(newSketch);
    res.json(newSketch);
  });

  app.delete('/api/sketches/:id', (req, res) => {
    sketches = sketches.filter(s => s.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/weather/geocode", async (req, res) => {
    try {
      const { name } = req.query;
      if (!name) return res.status(400).json({ error: "Name is required" });
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name as string)}&count=1&language=en&format=json`);
      if (!response.ok) throw new Error("Geocoding API failed");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Geocoding proxy error:", error);
      res.status(500).json({ error: "Failed to fetch geocoding data" });
    }
  });

  app.get("/api/weather/forecast", async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      if (!latitude || !longitude) return res.status(400).json({ error: "Latitude and longitude are required" });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
      if (!response.ok) throw new Error("Weather API failed");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Weather proxy error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist", { index: false }));
    app.get("*", (req, res) => {
      try {
        let html = fs.readFileSync(path.join(__dirname, "dist", "index.html"), "utf-8");
        res.send(html);
      } catch (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Setup WebSocket Server for Real Devices
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let deviceId: string | null = null;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'register') {
          deviceId = data.id;
          connectedDevices.set(deviceId!, {
            id: data.id,
            name: data.name || 'Unknown Device',
            type: data.deviceType || 'Arduino',
            status: 'online',
            lastSeen: new Date().toISOString(),
            ip: data.ip || 'Unknown IP',
            board: data.board || 'Generic',
            firmwareVersion: data.firmwareVersion || 'v1.0.0',
            ws
          });
          broadcastDevices();
        } else if (data.type === 'ota_progress') {
          // Forward OTA progress to all clients
          broadcastToClients({
            type: 'ota_progress',
            deviceId: data.deviceId,
            progress: data.progress,
            status: data.status,
            log: data.log
          });
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    });

    ws.on('close', () => {
      if (deviceId) {
        connectedDevices.delete(deviceId);
        broadcastDevices();
      }
    });
  });

  function broadcastDevices() {
    const devicesList = Array.from(connectedDevices.values()).map(d => {
      const { ws, ...deviceData } = d;
      return deviceData;
    });
    
    broadcastToClients({
      type: 'devices_update',
      devices: devicesList
    });
  }

  function broadcastToClients(data: any) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

startServer();
