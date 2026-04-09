import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic2, Music } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ArtistsPage() {
  const session = await auth();

  const artists = await prisma.artist.findMany({
    where: { userId: session!.user!.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { tracks: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Artists</h2>
          <p className="text-muted-foreground">
            Artists from your imported tracks
          </p>
        </div>
        <Link href="/dashboard/import">
          <Button>Import More</Button>
        </Link>
      </div>

      {artists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Mic2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No artists yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Artists will appear here when you import tracks
            </p>
            <Link href="/dashboard/import">
              <Button>Import Now</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artists.map((artist) => (
            <Card key={artist.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {artist.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{artist.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Music className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {artist._count.tracks} tracks
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {artist.source}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
