import { NextRequest, NextResponse } from "next/server";
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

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return Response.json(
        { error: "Email o password non corretti" },
        { status: 401 }
      );
    }

    // Create session data
    const sessionData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      image: user.image,
    };
    
    const sessionCookie = Buffer.from(JSON.stringify(sessionData)).toString("base64");
    const sessionToken = Buffer.from(user.id).toString("base64url");

    const response = NextResponse.json({ 
      success: true, 
      token: sessionToken,
      user: sessionData
    });
    
    // Set HTTP-only cookie for server-side session
    response.cookies.set("app-session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Si è verificato un errore" },
      { status: 500 }
    );
  }
}
