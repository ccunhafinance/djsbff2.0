import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, AlertTriangle, Info } from "lucide-react";

export default function DownloadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Downloads</h2>
        <p className="text-muted-foreground">
          Download your tracks for offline listening
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Educational Use Only:</strong> All downloads are strictly for
          personal study and educational purposes. Commercial use, redistribution,
          or any form of profit from downloaded content is strictly prohibited and
          may violate copyright laws.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Downloads Work
          </CardTitle>
          <CardDescription>
            Learn how to download your music library
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </div>
              <div>
                <p className="text-sm font-medium">Import your playlists</p>
                <p className="text-sm text-muted-foreground">
                  Go to the Import page and paste URLs from Spotify, YouTube,
                  SoundCloud, or Deezer
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                2
              </div>
              <div>
                <p className="text-sm font-medium">Browse your library</p>
                <p className="text-sm text-muted-foreground">
                  View your imported tracks and organize them into custom playlists
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                3
              </div>
              <div>
                <p className="text-sm font-medium">Download</p>
                <p className="text-sm text-muted-foreground">
                  Click the download button on any playlist to download all tracks
                  at once
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center py-16">
          <Download className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No downloads yet</p>
          <p className="text-sm text-muted-foreground">
            Your download history will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
