import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportForm } from "@/components/import-form";

const platforms = [
  {
    name: "Spotify",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    description: "Import playlists from Spotify",
    status: "available" as const,
  },
  {
    name: "YouTube",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    description: "Import playlists from YouTube Music",
    status: "available" as const,
  },
  {
    name: "SoundCloud",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    description: "Import playlists from SoundCloud",
    status: "available" as const,
  },
  {
    name: "Deezer",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Import playlists from Deezer",
    status: "available" as const,
  },
  {
    name: "Apple Music",
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    description: "Import playlists from Apple Music",
    status: "coming_soon" as const,
  },
  {
    name: "Tidal",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    description: "Import playlists from Tidal",
    status: "coming_soon" as const,
  },
];

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Import</h2>
        <p className="text-muted-foreground">
          Import playlists, tracks, and artists from your favorite platforms
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <Card
            key={platform.name}
            className={
              platform.status === "coming_soon" ? "opacity-50" : ""
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{platform.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={platform.color}
                >
                  {platform.status === "coming_soon" ? "Coming Soon" : "Available"}
                </Badge>
              </div>
              <CardDescription>{platform.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import by URL</CardTitle>
          <CardDescription>
            Paste a playlist or track URL from any supported platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Import</CardTitle>
          <CardDescription>
            Add tracks manually by entering the details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManualImportInfo />
        </CardContent>
      </Card>
    </div>
  );
}

function ManualImportInfo() {
  return (
    <p className="text-sm text-muted-foreground">
      You can also add tracks manually from the Tracks page or create custom
      playlists from the Playlists page. The import feature will automatically
      detect the platform from the URL you paste.
    </p>
  );
}
