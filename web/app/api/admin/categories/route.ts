import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function GET(req: Request) {
  try {
    await checkAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "15");
    const skip = (page - 1) * pageSize;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.category.count(),
    ]);

    return NextResponse.json({ data: categories, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await checkAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    await checkAdmin();
    const { name, slug, description } = await req.json();
    const category = await prisma.category.create({ data: { name, slug, description } });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
