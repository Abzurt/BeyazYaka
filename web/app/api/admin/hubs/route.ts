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
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where: { ...where, area: "hub" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          coverImageUrl: true,
          createdAt: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.post.count({ where: { ...where, area: "hub" } }),
    ]);

    return NextResponse.json({ data: items, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
