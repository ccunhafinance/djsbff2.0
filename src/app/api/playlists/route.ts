import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const playlist = await prisma.playlist.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      source: "custom",
      userId: user.id,
    },
  });

  return NextResponse.json(playlist);
}

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { tracks: true } } },
  });

  return NextResponse.json(playlists);
}
