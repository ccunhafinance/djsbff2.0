import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, source } = await req.json();

  if (!url || !source) {
    return NextResponse.json(
      { error: "URL and source are required" },
      { status: 400 }
    );
  }

  const validSources = ["spotify", "youtube", "soundcloud", "deezer"];
  if (!validSources.includes(source)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  // For Phase 1, we create a placeholder playlist from the URL
  // In Phase 2, we'll integrate with actual platform APIs
  const playlistName = extractNameFromUrl(url, source);

  const playlist = await prisma.playlist.create({
    data: {
      name: playlistName,
      source,
      sourceUrl: url,
      isImported: true,
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    id: playlist.id,
    name: playlist.name,
    trackCount: 0,
    message:
      "Playlist registered. Track import from platform APIs will be available in the next update.",
  });
}

function extractNameFromUrl(url: string, source: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);

    if (source === "spotify" && pathParts.length >= 2) {
      return `Spotify: ${pathParts[pathParts.length - 1]}`;
    }
    if (source === "youtube") {
      const listId = parsed.searchParams.get("list");
      return `YouTube: ${listId ?? pathParts[pathParts.length - 1]}`;
    }
    if (source === "soundcloud" && pathParts.length >= 2) {
      return `SoundCloud: ${pathParts.join("/")}`;
    }
    if (source === "deezer" && pathParts.length >= 2) {
      return `Deezer: ${pathParts[pathParts.length - 1]}`;
    }
  } catch {
    // URL parse failed
  }
  return `${source} import - ${new Date().toLocaleDateString()}`;
}
