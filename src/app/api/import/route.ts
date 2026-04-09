import { getApiUser } from "@/lib/api-auth";
import { importFromUrl } from "@/lib/platforms/import-service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, source } = await req.json();

  if (!url || !source) {
    return NextResponse.json(
      { error: "URL and source are required" },
      { status: 400 }
    );
  }

  const validSources = ["spotify", "youtube", "soundcloud", "deezer"];
  if (!validSources.includes(source)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  try {
    const result = await importFromUrl(url, source, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[import] Error:", error);
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
