import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import authConfig from "./auth.config"
import { verifyPassword } from "@/lib/security"
import { logUserAction } from "./logger"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          throw new Error("Hesabınız çok fazla hatalı giriş nedeniyle geçici olarak kilitlendi.")
        }

        if (!user.passwordHash) return null
        const isPasswordValid = await verifyPassword(user.passwordHash, credentials.password as string)

        if (!isPasswordValid) {
          const newAttempts = user.failedLoginAttempts + 1
          const shouldLock = newAttempts >= 5
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newAttempts,
              lockoutUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
            },
          })

          throw new Error(shouldLock ? "Hesabınız kilitlendi (15 dk)." : "Hatalı şifre.")
        }

        if (user.failedLoginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockoutUntil: null },
          })
        }

        await logUserAction({
          userId: user.id,
          action: "login",
          details: { email: user.email }
        });

        // Email verification warning (allow login but signal unverified state)
        const isEmailVerified = !!user.emailVerified;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
          emailVerified: isEmailVerified,
        }
      },
    }),
  ],
})
