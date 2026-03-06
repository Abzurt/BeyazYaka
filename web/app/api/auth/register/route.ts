import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { username, email, password, city, sector, workModel } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "E-posta, kullanıcı adı ve şifre zorunludur." }, { status: 400 });
    }

    // Advanced Password Validation
    const validation = validatePassword(password, email, username);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta veya kullanıcı adı zaten kullanımda." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: passwordHash,
        city,
        sector,
        workModel,
        role: "member",
      },
    });

    // Generate verification token (5 minutes TTL)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send verification email (non-blocking - don't fail registration if email fails)
    try {
      await sendVerificationEmail(email, username, token);
    } catch (emailError) {
      console.error("Verification email send error:", emailError);
      // Continue - user is created, email will be resent via another flow if needed
    }

    return NextResponse.json(
      { message: "Hesabın oluşturuldu! E-postana gönderilen doğrulama linkine tıklaman gerekiyor." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
