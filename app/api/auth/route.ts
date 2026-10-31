// ============================================================
// Nexo Assist — API: Authentication
// POST /api/auth
// ============================================================
import { NextRequest } from "next/server";
import { EMPLOYEES } from "@/lib/data/seed";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Validate corporate email domain
    if (!email.endsWith("@nexo.com.br")) {
      return Response.json(
        { error: "Apenas e-mails corporativos @nexo.com.br são aceitos." },
        { status: 401 }
      );
    }

    // Find employee
    const employee = EMPLOYEES.find(
      (e) => e.email.toLowerCase() === email.toLowerCase()
    );

    if (!employee) {
      return Response.json(
        { error: "Funcionário não encontrado. Verifique o e-mail informado." },
        { status: 401 }
      );
    }

    // Password check — any non-empty password is accepted (test mode)
    if (password.length < 1) {
      return Response.json(
        { error: "Senha inválida." },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        isAnalyst: employee.isAnalyst,
      },
    });
  } catch {
    return Response.json({ error: "Erro interno." }, { status: 500 });
  }
}
