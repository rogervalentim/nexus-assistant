// ============================================================
// Nexo Assist — API: Single Ticket
// GET /api/tickets/[id]
// PATCH /api/tickets/[id]
// ============================================================
import type { NextRequest } from "next/server";
import { getTicketById, updateTicket } from "@/lib/data/store";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/tickets/[id]">
) {
  const { id } = await ctx.params;
  const ticket = getTicketById(id);

  if (!ticket) {
    return Response.json({ error: "Chamado não encontrado." }, { status: 404 });
  }

  return Response.json({ ticket });
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/tickets/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json() as Record<string, unknown>;

    const updated = updateTicket(id, body);
    if (!updated) {
      return Response.json({ error: "Chamado não encontrado." }, { status: 404 });
    }

    return Response.json({ ticket: updated });
  } catch {
    return Response.json({ error: "Erro ao atualizar chamado." }, { status: 500 });
  }
}
