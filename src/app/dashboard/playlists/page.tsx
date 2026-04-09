import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListMusic, Plus } from "lucide-react";
import Link from "next/link";
import { CreatePlaylistDialog } from "@/components/create-playlist-dialog";

export default async function PlaylistsPage() {
  const session = await auth();

  const playlists = await prisma.playlist.findMany({
    where: { userId: session!.user!.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { tracks: true } } },
  });

  const sourceColors: Record<string, string> = {
    spotify: "bg-green-500/10 text-green-500",
    youtube: "bg-red-500/10 text-red-500",
    soundcloud: "bg-orange-500/10 text-orange-500",
    deezer: "bg-purple-500/10 text-purple-500",
    custom: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Playlists</h2>
          <p className="text-muted-foreground">
            Manage your imported and custom playlists
          </p>
        </div>
        <CreatePlaylistDialog />
      </div>

      {playlists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No playlists yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Import playlists from your favorite platforms or create a custom one
            </p>
            <div className="flex gap-2">
              <Link href="/dashboard/import">
                <Button>Import Playlist</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Link key={playlist.id} href={`/dashboard/playlists/${playlist.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <ListMusic className="h-5 w-5 text-primary" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={sourceColors[playlist.source] ?? ""}
                    >
                      {playlist.source}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{playlist.name}</CardTitle>
                  {playlist.description && (
                    <CardDescription className="line-clamp-2">
                      {playlist.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {playlist._count.tracks} tracks
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
