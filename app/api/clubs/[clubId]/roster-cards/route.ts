import { NextResponse } from "next/server";
import { getRosterCardsData } from "@/lib/actions/roster";
import { getUserIdFromRequest } from "@/lib/auth-token";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params;
    
    // Verify user is authenticated
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    // Get roster cards data sorted by rating
    const members = await getRosterCardsData(clubId);

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching roster cards:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei dati della rosa" },
      { status: 500 }
    );
  }
}
