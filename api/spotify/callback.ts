export default async function handler(req, res) {
  const code = req.query.code as string;
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirectUri = "https://havenly-app-sigma.vercel.app/api/spotify/callback";

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      res.redirect("/?spotify=connected");
    } else {
      res.status(400).json({ error: "Spotify auth failed", data });
    }
  } catch (e) {
    res.status(500).json({ error: "Internal server error", details: e });
  }
}
