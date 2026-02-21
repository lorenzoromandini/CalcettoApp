import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({ user: session });
  } catch {
    return NextResponse.json({ user: null });
  }
}
