import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await checkAdmin();
    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const updated = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    await logUserAction({
      userId: session.user.id!,
      action: "update_comment_admin",
      targetId: id,
      targetType: "comment",
      details: { content }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await checkAdmin();
    const { id } = await params;

    const deleted = await prisma.comment.delete({
      where: { id },
    });

    await logUserAction({
      userId: session.user.id!,
      action: "delete_comment_admin",
      targetId: id,
      targetType: "comment",
    });

    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
