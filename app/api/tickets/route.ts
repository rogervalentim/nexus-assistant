// ============================================================
// Nexo Assist — API: Tickets
// GET /api/tickets?email=xxx  (analyst only — all tickets)
// POST /api/tickets           (create ticket directly)
// ============================================================
import { NextRequest } from "next/server";
import { getAllTickets } from "@/lib/data/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || searchParams.get("userEmail");

  try {
    const tickets = getAllTickets();
    const filtered = email
      ? tickets.filter((t) => t.userEmail.toLowerCase() === email.toLowerCase())
      : tickets;

    return Response.json({ tickets: filtered });
  } catch {
    return Response.json({ error: "Erro ao buscar chamados." }, { status: 500 });
  }
}
