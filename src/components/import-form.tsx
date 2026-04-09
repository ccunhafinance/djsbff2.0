"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function ImportForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function detectSource(inputUrl: string) {
    if (inputUrl.includes("spotify.com")) return "spotify";
    if (inputUrl.includes("youtube.com") || inputUrl.includes("youtu.be"))
      return "youtube";
    if (inputUrl.includes("soundcloud.com")) return "soundcloud";
    if (inputUrl.includes("deezer.com")) return "deezer";
    return "";
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    const detected = detectSource(value);
    if (detected) setSource(detected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || !source) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Import failed");
        return;
      }

      toast.success(`Imported: ${data.name ?? "playlist"} with ${data.trackCount ?? 0} tracks`);
      setUrl("");
      setSource("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="url">Playlist or Track URL</Label>
        <Input
          id="url"
          placeholder="https://open.spotify.com/playlist/..."
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Platform</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger>
            <SelectValue placeholder="Auto-detected from URL" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spotify">Spotify</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="soundcloud">SoundCloud</SelectItem>
            <SelectItem value="deezer">Deezer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Downloads are for <strong>personal study only</strong>. Commercial use is
          prohibited.
        </AlertDescription>
      </Alert>

      <Button type="submit" disabled={loading || !url || !source} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          "Import"
        )}
      </Button>
    </form>
  );
}
