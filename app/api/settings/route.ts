import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/settings - Fetch all system settings
export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    // Convert array of {key, value} to a key-value object
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      try {
        acc[setting.key] = JSON.parse(setting.value);
      } catch {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {});

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST /api/settings - Update system settings (Admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Iterate over the object and upsert each key
    const updatePromises = Object.entries(data).map(async ([key, value]) => {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
