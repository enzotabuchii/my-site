import { NextResponse } from "next/server";
import { apagar, registrar, listar } from "@/lib/acessos";

// GET /api/acessos?token=...  -> lista os últimos eventos
// POST /api/acessos          -> registra um evento (chamado pelo tracker)
// DELETE /api/acessos?token=... -> esvazia o log

function autorizado(req: Request) {
  const token = process.env.ACESSOS_TOKEN;
  if (!token) return true; // em dev, sem token configurado, deixa passar
  const url = new URL(req.url);
  return url.searchParams.get("token") === token;
}

export async function GET(req: Request) {
  if (!autorizado(req)) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || "500");
  const eventos = await listar(Number.isFinite(limit) ? limit : 500);
  return NextResponse.json({ eventos, total: eventos.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await registrar(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: "payload inválido" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!autorizado(req)) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }
  await apagar();
  return NextResponse.json({ ok: true });
}