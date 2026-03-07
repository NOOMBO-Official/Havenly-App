export default function handler(req, res) {

const redirect =
"https://havenly-app-sigma.vercel.app/api/spotify/callback"

const scope = [
"user-read-playback-state",
"user-modify-playback-state",
"user-read-currently-playing",
"streaming"
].join(" ")

const params = new URLSearchParams({
response_type:"code",
client_id:process.env.SPOTIFY_CLIENT_ID,
scope,
redirect_uri:redirect
})

res.redirect(
"https://accounts.spotify.com/authorize?" + params.toString()
)

}
