interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  title: string;
  artistName: string;
  duration: number;
  sourceUrl: string;
  sourceId: string;
  imageUrl: string | null;
}

interface SpotifyPlaylistResult {
  name: string;
  description: string | null;
  imageUrl: string | null;
  sourceId: string;
  sourceUrl: string;
  tracks: SpotifyTrack[];
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Spotify auth failed: ${res.status}`);
  }

  const data: SpotifyToken = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

export function parseSpotifyUrl(url: string): { type: string; id: string } | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);

    // Handle: open.spotify.com/playlist/ID, open.spotify.com/track/ID, open.spotify.com/album/ID
    if (parts.length >= 2) {
      const type = parts[parts.length - 2];
      const id = parts[parts.length - 1].split("?")[0];
      if (["playlist", "track", "album"].includes(type)) {
        return { type, id };
      }
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export async function fetchSpotifyPlaylist(playlistId: string): Promise<SpotifyPlaylistResult> {
  const token = await getAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=id,name,description,images,external_urls,tracks.items(track(id,name,duration_ms,external_urls,album(images),artists(name))),tracks.next,tracks.total`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Spotify API error ${res.status}: ${error}`);
  }

  const data = await res.json();

  const tracks: SpotifyTrack[] = [];

  for (const item of data.tracks?.items ?? []) {
    const track = item.track;
    if (!track) continue;

    tracks.push({
      title: track.name,
      artistName: track.artists?.map((a: { name: string }) => a.name).join(", ") ?? "Unknown",
      duration: Math.round((track.duration_ms ?? 0) / 1000),
      sourceUrl: track.external_urls?.spotify ?? "",
      sourceId: track.id,
      imageUrl: track.album?.images?.[0]?.url ?? null,
    });
  }

  // Fetch remaining tracks if playlist has more than 100
  let nextUrl = data.tracks?.next;
  while (nextUrl) {
    const nextRes = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!nextRes.ok) break;
    const nextData = await nextRes.json();
    for (const item of nextData.items ?? []) {
      const track = item.track;
      if (!track) continue;
      tracks.push({
        title: track.name,
        artistName: track.artists?.map((a: { name: string }) => a.name).join(", ") ?? "Unknown",
        duration: Math.round((track.duration_ms ?? 0) / 1000),
        sourceUrl: track.external_urls?.spotify ?? "",
        sourceId: track.id,
        imageUrl: track.album?.images?.[0]?.url ?? null,
      });
    }
    nextUrl = nextData.next;
  }

  return {
    name: data.name,
    description: data.description || null,
    imageUrl: data.images?.[0]?.url ?? null,
    sourceId: data.id,
    sourceUrl: data.external_urls?.spotify ?? `https://open.spotify.com/playlist/${playlistId}`,
    tracks,
  };
}

export async function fetchSpotifyTrack(trackId: string): Promise<SpotifyTrack> {
  const token = await getAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Spotify API error ${res.status}`);
  }

  const track = await res.json();

  return {
    title: track.name,
    artistName: track.artists?.map((a: { name: string }) => a.name).join(", ") ?? "Unknown",
    duration: Math.round((track.duration_ms ?? 0) / 1000),
    sourceUrl: track.external_urls?.spotify ?? "",
    sourceId: track.id,
    imageUrl: track.album?.images?.[0]?.url ?? null,
  };
}

export async function fetchSpotifyAlbum(albumId: string): Promise<SpotifyPlaylistResult> {
  const token = await getAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Spotify API error ${res.status}`);
  }

  const data = await res.json();

  const tracks: SpotifyTrack[] = (data.tracks?.items ?? []).map(
    (track: { name: string; artists: { name: string }[]; duration_ms: number; external_urls: { spotify: string }; id: string }) => ({
      title: track.name,
      artistName: track.artists?.map((a) => a.name).join(", ") ?? "Unknown",
      duration: Math.round((track.duration_ms ?? 0) / 1000),
      sourceUrl: track.external_urls?.spotify ?? "",
      sourceId: track.id,
      imageUrl: data.images?.[0]?.url ?? null,
    })
  );

  return {
    name: data.name,
    description: `Album by ${data.artists?.map((a: { name: string }) => a.name).join(", ")}`,
    imageUrl: data.images?.[0]?.url ?? null,
    sourceId: data.id,
    sourceUrl: data.external_urls?.spotify ?? "",
    tracks,
  };
}
