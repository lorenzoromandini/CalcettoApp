import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email e password sono obbligatori" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return Response.json(
        { error: "Email o password non corretti" },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return Response.json(
        { error: "EMAIL_NOT_VERIFIED", message: "Devi verificare la tua email prima di accedere." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return Response.json(
        { error: "Email o password non corretti" },
        { status: 401 }
      );
    }

    const sessionData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      image: user.image,
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64url");

    return Response.json({ success: true, token: sessionToken });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Si è verificato un errore" },
      { status: 500 }
    );
  }
}
