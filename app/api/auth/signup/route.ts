import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Email non valida"),
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  nickname: z.string().max(30).optional().nullable(),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, firstName, lastName, nickname, password } = signupSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Questa email è già registrata" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Crea User e Player in transazione atomica
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        nickname: nickname || null,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    })

    // Crea automaticamente il profilo Player associato all'utente
    await prisma.player.create({
      data: {
        userId: user.id,
        name: firstName,
        surname: lastName,
        nickname: nickname || null,
        roles: [], // Ruoli vuoti all'inizio, verranno definiti quando si unisce a un club
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Si è verificato un errore" },
      { status: 500 }
    )
  }
}
