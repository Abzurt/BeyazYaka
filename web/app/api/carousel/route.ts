import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "tr";

  try {
    const items = await prisma.carouselItem.findMany({
      where: { 
        status: "active",
        locale: locale
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch carousel items" }, { status: 500 });
  }
}
