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

export async function GET(req: Request) {
  try {
    await checkAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "slots" or "campaigns"

    if (type === "slots") {
      const slots = await prisma.adSlot.findMany({
        orderBy: { name: "asc" },
      });
      return NextResponse.json(slots);
    }

    const campaigns = await prisma.adCampaign.findMany({
      include: { slot: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await checkAdmin();
    const data = await req.json();

    if (!data.title || !data.targetUrl || !data.slotId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAd = await prisma.adCampaign.create({
      data: {
        title: data.title,
        body: data.body,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        slotId: data.slotId,
        isActive: data.isActive ?? true,
        locale: data.locale || "tr",
      },
    });

    await logUserAction({
      userId: session.user!.id!,
      action: "create_ad_campaign",
      targetId: newAd.id,
      targetType: "ad_campaign",
      details: { title: newAd.title, slotId: newAd.slotId }
    });

    return NextResponse.json(newAd, { status: 201 });
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

    const updatedAd = await prisma.adCampaign.update({
      where: { id },
      data: updateData,
    });

    await logUserAction({
      userId: session.user!.id!,
      action: "update_ad_campaign",
      targetId: updatedAd.id,
      targetType: "ad_campaign",
      details: { title: updatedAd.title, changes: Object.keys(updateData) }
    });

    return NextResponse.json(updatedAd);
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

    const deletedAd = await prisma.adCampaign.delete({
      where: { id },
    });

    await logUserAction({
      userId: session.user!.id!,
      action: "delete_ad_campaign",
      targetId: id,
      targetType: "ad_campaign",
      details: { title: deletedAd.title }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
