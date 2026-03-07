export default async function handler(req, res) {
  const code = req.query.code;

  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  const redirect_uri =
    "https://havenly-app-sigma.vercel.app/api/spotify/callback";

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
      },
      body: new URLSearchParams({
        code,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    }
  );

  const data = await response.json();

  res.json(data);
}
