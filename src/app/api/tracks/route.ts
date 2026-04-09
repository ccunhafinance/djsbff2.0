import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, artistName, source, sourceUrl, duration, playlistId } =
    await req.json();

  if (!title || !source) {
    return NextResponse.json(
      { error: "Title and source are required" },
      { status: 400 }
    );
  }

  let artistId: string | undefined;

  if (artistName) {
    const artist = await prisma.artist.upsert({
      where: {
        userId_name_source: {
          userId: user.id,
          name: artistName,
          source,
        },
      },
      update: {},
      create: {
        name: artistName,
        source,
        userId: user.id,
      },
    });
    artistId = artist.id;
  }

  const track = await prisma.track.create({
    data: {
      title,
      source,
      sourceUrl: sourceUrl ?? null,
      duration: duration ?? null,
      artistId: artistId ?? null,
      userId: user.id,
    },
    include: { artist: true },
  });

  if (playlistId) {
    const maxPosition = await prisma.playlistTrack.aggregate({
      where: { playlistId },
      _max: { position: true },
    });

    await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId: track.id,
        position: (maxPosition._max.position ?? 0) + 1,
      },
    });
  }

  return NextResponse.json(track);
}

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tracks = await prisma.track.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { artist: true },
  });

  return NextResponse.json(tracks);
}
