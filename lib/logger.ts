import prisma from "./prisma";

export async function logUserAction({
  userId,
  action,
  targetId,
  targetType,
  details,
}: {
  userId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: any;
}) {
  try {
    await prisma.userLog.create({
      data: {
        userId,
        action,
        targetId,
        targetType,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
}
