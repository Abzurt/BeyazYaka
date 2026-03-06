import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Purge everything related to public pages
    revalidatePath("/", "layout");
    
    // Purge specific tags
    revalidateTag("carousel");
    revalidateTag("trending");
    revalidateTag("posts");

    return NextResponse.json({ success: true, message: "Cache purged successfully" });
  } catch (error) {
    console.error("Cache purge failed:", error);
    return NextResponse.json({ error: "Failed to purge cache" }, { status: 500 });
  }
}
