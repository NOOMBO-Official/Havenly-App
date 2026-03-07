export default async function handler(req, res) {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

  const redirectUri =
    "https://havenly-app-sigma.vercel.app/api/spotify/callback";

  const scope =
    "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming app-remote-control user-read-email user-read-private";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: redirectUri,
  });

  res.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
