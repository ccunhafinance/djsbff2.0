import { prisma } from "@/lib/prisma";
import {
  parseSpotifyUrl,
  fetchSpotifyPlaylist,
  fetchSpotifyTrack,
  fetchSpotifyAlbum,
} from "./spotify";

interface ImportResult {
  playlistId: string;
  name: string;
  trackCount: number;
  source: string;
}

export async function importFromUrl(
  url: string,
  source: string,
  userId: string
): Promise<ImportResult> {
  switch (source) {
    case "spotify":
      return importSpotify(url, userId);
    case "soundcloud":
      return importPlaceholder(url, source, userId);
    case "youtube":
      return importPlaceholder(url, source, userId);
    case "deezer":
      return importDeezer(url, userId);
    default:
      return importPlaceholder(url, source, userId);
  }
}

async function importSpotify(url: string, userId: string): Promise<ImportResult> {
  const parsed = parseSpotifyUrl(url);
  if (!parsed) throw new Error("Invalid Spotify URL");

  let playlistData;

  if (parsed.type === "playlist") {
    playlistData = await fetchSpotifyPlaylist(parsed.id);
  } else if (parsed.type === "album") {
    playlistData = await fetchSpotifyAlbum(parsed.id);
  } else if (parsed.type === "track") {
    const track = await fetchSpotifyTrack(parsed.id);
    playlistData = {
      name: `${track.title} - ${track.artistName}`,
      description: "Single track import",
      imageUrl: track.imageUrl,
      sourceId: parsed.id,
      sourceUrl: url,
      tracks: [track],
    };
  } else {
    throw new Error("Unsupported Spotify content type");
  }

  // Create playlist
  const playlist = await prisma.playlist.create({
    data: {
      name: playlistData.name,
      description: playlistData.description,
      imageUrl: playlistData.imageUrl,
      source: "spotify",
      sourceUrl: playlistData.sourceUrl,
      sourceId: playlistData.sourceId,
      isImported: true,
      userId,
    },
  });

  // Import tracks
  let position = 0;
  for (const trackData of playlistData.tracks) {
    position++;

    // Upsert artist
    const artist = await prisma.artist.upsert({
      where: {
        userId_name_source: {
          userId,
          name: trackData.artistName,
          source: "spotify",
        },
      },
      update: {},
      create: {
        name: trackData.artistName,
        source: "spotify",
        userId,
      },
    });

    // Create track (skip duplicates)
    let track;
    try {
      track = await prisma.track.create({
        data: {
          title: trackData.title,
          duration: trackData.duration,
          imageUrl: trackData.imageUrl,
          sourceUrl: trackData.sourceUrl,
          source: "spotify",
          sourceId: trackData.sourceId,
          userId,
          artistId: artist.id,
        },
      });
    } catch {
      // Duplicate track, find existing
      track = await prisma.track.findFirst({
        where: {
          userId,
          title: trackData.title,
          source: "spotify",
          sourceUrl: trackData.sourceUrl,
        },
      });
      if (!track) continue;
    }

    // Add to playlist
    try {
      await prisma.playlistTrack.create({
        data: {
          playlistId: playlist.id,
          trackId: track.id,
          position,
        },
      });
    } catch {
      // Skip duplicate playlist-track entries
    }
  }

  return {
    playlistId: playlist.id,
    name: playlist.name,
    trackCount: playlistData.tracks.length,
    source: "spotify",
  };
}

async function importDeezer(url: string, userId: string): Promise<ImportResult> {
  // Deezer has a public API - no key needed
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);

  if (parts.length < 2) throw new Error("Invalid Deezer URL");

  const type = parts[parts.length - 2];
  const id = parts[parts.length - 1];

  if (type === "playlist") {
    const res = await fetch(`https://api.deezer.com/playlist/${id}`);
    if (!res.ok) throw new Error("Deezer API error");
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const playlist = await prisma.playlist.create({
      data: {
        name: data.title,
        description: data.description || null,
        imageUrl: data.picture_medium || null,
        source: "deezer",
        sourceUrl: url,
        sourceId: id,
        isImported: true,
        userId,
      },
    });

    let position = 0;
    for (const t of data.tracks?.data ?? []) {
      position++;
      const artist = await prisma.artist.upsert({
        where: { userId_name_source: { userId, name: t.artist?.name ?? "Unknown", source: "deezer" } },
        update: {},
        create: { name: t.artist?.name ?? "Unknown", source: "deezer", userId },
      });

      let track;
      try {
        track = await prisma.track.create({
          data: {
            title: t.title,
            duration: t.duration ?? null,
            sourceUrl: t.link ?? null,
            source: "deezer",
            sourceId: String(t.id),
            userId,
            artistId: artist.id,
          },
        });
      } catch {
        track = await prisma.track.findFirst({ where: { userId, title: t.title, source: "deezer" } });
        if (!track) continue;
      }

      try {
        await prisma.playlistTrack.create({
          data: { playlistId: playlist.id, trackId: track.id, position },
        });
      } catch { /* skip */ }
    }

    return { playlistId: playlist.id, name: data.title, trackCount: position, source: "deezer" };
  }

  return importPlaceholder(url, "deezer", userId);
}

async function importPlaceholder(
  url: string,
  source: string,
  userId: string
): Promise<ImportResult> {
  const playlist = await prisma.playlist.create({
    data: {
      name: `${source.charAt(0).toUpperCase() + source.slice(1)} Import - ${new Date().toLocaleDateString()}`,
      source,
      sourceUrl: url,
      isImported: true,
      userId,
    },
  });

  return {
    playlistId: playlist.id,
    name: playlist.name,
    trackCount: 0,
    source,
  };
}
