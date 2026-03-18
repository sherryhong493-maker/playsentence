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
    // Debug: check if env vars exist
    if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
      return new Response(JSON.stringify({ 
        error: 'missing env vars',
        has_id: !!env.SPOTIFY_CLIENT_ID,
        has_secret: !!env.SPOTIFY_CLIENT_SECRET
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_SECRET)
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      return new Response(JSON.stringify({ 
        error: 'failed to get token',
        token_response: tokenData
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    const target = norm(phrase);
    let exactTrack = null;

    for (let offset = 0; offset < 150 && !exactTrack; offset += 50) {
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(phrase)}&type=track&limit=50&offset=${offset}`,
        { headers: { Authorization: 'Bearer ' + access_token } }
      );
      const data = await searchRes.json();
      const tracks = data.tracks?.items || [];
      if (tracks.length === 0) break;
      exactTrack = tracks.find(t => norm(t.name) === target) || null;
    }

    return new Response(JSON.stringify({
      tracks: { items: exactTrack ? [exactTrack] : [] }
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
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
