import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/security";

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

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
