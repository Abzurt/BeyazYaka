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
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({ data: reports, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await checkAdmin();
    const { id, status } = await req.json();
    const updated = await prisma.report.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
