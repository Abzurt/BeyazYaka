import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";

// Ensure only admins can access these endpoints
async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function GET(req: Request) {
  try {
    await checkAdmin();
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale");

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "15");
    const skip = (page - 1) * pageSize;
    const where = locale ? { locale } : {};

    const [items, total] = await Promise.all([
      prisma.carouselItem.findMany({
        where,
        orderBy: { order: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.carouselItem.count({ where }),
    ]);
    return NextResponse.json({ data: items, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await checkAdmin();
    const data = await req.json();
    
    // Explicitly validate required fields
    if (!data.title || !data.subtitle || !data.image || !data.link || !data.locale) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newItem = await prisma.carouselItem.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        link: data.link,
        status: data.status || "active",
        order: data.order || 0,
        locale: data.locale,
      },
    });

    await logUserAction({
      userId: session.user!.id!,
      action: "create_carousel_item",
      targetId: newItem.id,
      targetType: "carousel_item",
      details: { title: newItem.title, locale: newItem.locale }
    });

    return NextResponse.json(newItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await checkAdmin();
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updatedItem = await prisma.carouselItem.update({
      where: { id },
      data: updateData,
    });

    await logUserAction({
      userId: session.user!.id!,
      action: "update_carousel_item",
      targetId: updatedItem.id,
      targetType: "carousel_item",
      details: { title: updatedItem.title, changes: Object.keys(updateData) }
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await checkAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const deletedItem = await prisma.carouselItem.delete({
      where: { id },
    });

    await logUserAction({
      userId: session.user!.id!,
      action: "delete_carousel_item",
      targetId: id,
      targetType: "carousel_item",
      details: { title: deletedItem.title }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
