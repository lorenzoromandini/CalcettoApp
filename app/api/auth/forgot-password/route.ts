import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "L'email è obbligatoria" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Nessun utente trovato con questa email" },
        { status: 404 }
      );
    }

    const resetToken = randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: resetToken,
        updatedAt: new Date(),
      },
    });

    await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName || "Utente"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Si è verificato un errore" },
      { status: 500 }
    );
  }
}
