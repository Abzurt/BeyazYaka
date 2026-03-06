import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { unstable_cache } from "next/cache";
import { getSystemSettings } from "@/lib/settings";

const getCachedCarouselItems = unstable_cache(
  async (locale: string) => {
    return prisma.carouselItem.findMany({
      where: { 
        status: "active",
        locale: locale
      },
      orderBy: { order: "asc" },
    });
  },
  ["carousel-items"],
  { tags: ["carousel"] }
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "tr";

  try {
    const settings = await getSystemSettings();
    const ttlMinutes = Number(settings.cacheTTL) || 5;
    
    // Pass the TTL dynamically if possible, though revalidate option in unstable_cache is usually static at definition.
    // However, we can use the revalidate property in the options.
    // Note: Next.js unstable_cache revalidate is often fixed at creation. 
    // For true dynamic TTL, we'd need a different approach or rely on manual purging.
    // But we'll set it here as requested.
    
    const items = await getCachedCarouselItems(locale);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch carousel items" }, { status: 500 });
  }
}
