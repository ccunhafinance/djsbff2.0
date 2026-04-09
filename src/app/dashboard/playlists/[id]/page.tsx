import { requireUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, AlertTriangle, Music } from "lucide-react";
import Link from "next/link";

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const playlist = await prisma.playlist.findFirst({
    where: { id, userId: user.id },
    include: {
      tracks: {
        orderBy: { position: "asc" },
        include: {
          track: {
            include: { artist: true },
          },
        },
      },
    },
  });

  if (!playlist) notFound();

  function formatDuration(seconds?: number | null) {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/playlists">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{playlist.name}</h2>
            <Badge variant="secondary">{playlist.source}</Badge>
          </div>
          {playlist.description && (
            <p className="text-muted-foreground">{playlist.description}</p>
          )}
        </div>
        {playlist.tracks.length > 0 && (
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        )}
      </div>

      {playlist.tracks.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Downloads are for <strong>personal study and educational purposes only</strong>.
            Commercial use is strictly prohibited.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Tracks ({playlist.tracks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playlist.tracks.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <Music className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No tracks in this playlist yet
              </p>
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
                {playlist.tracks.map((pt, index) => (
                  <TableRow key={pt.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {pt.track.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {pt.track.artist?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {pt.track.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {formatDuration(pt.track.duration)}
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
