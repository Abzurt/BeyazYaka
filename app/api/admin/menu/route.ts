import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "tr";

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "15");
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: { locale },
        orderBy: { order: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.menuItem.count({ where: { locale } }),
    ]);
    return NextResponse.json({ data: items, total });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const item = await prisma.menuItem.create({
      data: {
        title: body.title,
        url: body.url,
        order: body.order || 0,
        isActive: body.isActive ?? true,
        locale: body.locale || "tr",
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
