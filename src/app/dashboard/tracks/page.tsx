import { requireUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Music } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TracksPage() {
  const user = await requireUser();

  const tracks = await prisma.track.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { artist: true },
  });

  function formatDuration(seconds?: number | null) {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tracks</h2>
          <p className="text-muted-foreground">
            All your imported tracks in one place
          </p>
        </div>
        <Link href="/dashboard/import">
          <Button>Import Tracks</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <Music className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No tracks yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Import tracks from your favorite platforms
              </p>
              <Link href="/dashboard/import">
                <Button>Import Now</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((track, index) => (
                  <TableRow key={track.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{track.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {track.artist?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {track.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {formatDuration(track.duration)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
