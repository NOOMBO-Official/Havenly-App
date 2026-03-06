import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

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
    const state = Buffer.from(JSON.stringify({ redirectUri })).toString('base64');

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
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
