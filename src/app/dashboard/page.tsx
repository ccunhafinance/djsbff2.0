import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListMusic, Music, Mic2, Download } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const [playlistCount, trackCount, artistCount] = await Promise.all([
    prisma.playlist.count({ where: { userId: session!.user!.id } }),
    prisma.track.count({ where: { userId: session!.user!.id } }),
    prisma.artist.count({ where: { userId: session!.user!.id } }),
  ]);

  const recentPlaylists = await prisma.playlist.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { tracks: true } } },
  });

  const stats = [
    { label: "Playlists", value: playlistCount, icon: ListMusic },
    { label: "Tracks", value: trackCount, icon: Music },
    { label: "Artists", value: artistCount, icon: Mic2 },
    { label: "Downloads", value: 0, icon: Download },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {session?.user?.name ?? "DJ"}
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your music library
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Playlists</CardTitle>
          <CardDescription>Your latest imported and created playlists</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPlaylists.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No playlists yet. Go to Import to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {recentPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <ListMusic className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {playlist._count.tracks} tracks &middot; {playlist.source}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
