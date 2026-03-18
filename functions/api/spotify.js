export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const phrase = url.searchParams.get('phrase');

  if (!phrase) {
    return new Response(JSON.stringify({ error: 'phrase required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Get Spotify token
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_SECRET)
      },
      body: 'grant_type=client_credentials'
    });

    const { access_token } = await tokenRes.json();
    if (!access_token) {
      return new Response(JSON.stringify({ error: 'failed to get token' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Search Spotify
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(phrase)}&type=track&limit=50`,
      { headers: { Authorization: 'Bearer ' + access_token } }
    );

    const data = await searchRes.json();

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    }
  });
}
