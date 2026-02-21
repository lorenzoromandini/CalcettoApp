import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface User {
    firstName?: string | null
    lastName?: string | null
    nickname?: string | null
    image?: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      firstName?: string | null
      lastName?: string | null
      nickname?: string | null
      image?: string | null
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/auth-code-error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.nickname = user.nickname
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.firstName = token.firstName as string | null | undefined
        session.user.lastName = token.lastName as string | null | undefined
        session.user.nickname = token.nickname as string | null | undefined
        session.user.image = token.image as string | null | undefined
      }
      return session
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user || !user.password) {
            return null
          }

          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED")
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password)

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            nickname: user.nickname,
            image: user.image,
          }
        } catch (error) {
          if (error instanceof Error && error.message === "EMAIL_NOT_VERIFIED") {
            throw error
          }
          console.error("Authorize error:", error)
          return null
        }
      },
    }),
  ],
})
