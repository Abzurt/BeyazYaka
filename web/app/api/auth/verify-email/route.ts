import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/tr/auth/verify-result?status=invalid", req.url));
  }

  const verification = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification) {
    return NextResponse.redirect(new URL("/tr/auth/verify-result?status=invalid", req.url));
  }

  if (verification.expiresAt < new Date()) {
    // Delete expired token
    await prisma.emailVerification.delete({ where: { token } });
    return NextResponse.redirect(new URL("/tr/auth/verify-result?status=expired", req.url));
  }

  // Mark user as verified
  await prisma.user.update({
    where: { id: verification.userId },
    data: { emailVerified: new Date() },
  });

  // Remove used token
  await prisma.emailVerification.delete({ where: { token } });

  return NextResponse.redirect(new URL("/tr/auth/verify-result?status=success", req.url));
}
