import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Tipo do evento gravado no log. Tudo anônimo: não coletamos nome nem e-mail.
export type Acesso = {
  id: string;
  ts: string; // ISO UTC
  dataLocal: string; // legível em pt-BR
  tipo: "pageview" | "clique" | "scroll" | "sair";
  path: string;
  ref: string | null;
  title: string;
  fp: string; // fingerprint anônimo do navegador (hash)
  tela: { w: number; h: number; dpr: number };
  nav: { lingua: string; plataforma: string; cookies: boolean };
  conesao: { tipo: string | null; downlink: number | null } | null;
  // clique
  alvo?: { seletor: string; texto: string; href: string | null; tag: string };
  coords?: { x: number; y: number; rx: number; ry: number };
  // scroll
  pct?: number;
  // sair
  duracao?: number;
  scrollPct?: number;
};

const MAX = 5000;
const FILE = path.join(process.cwd(), "data", "acessos.json");

// Upstash Redis (o que a Vercel usa agora, em vez do @vercel/kv depreciado)
async function redis() {
  const { Redis } = await import("@upstash/redis");
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function registrar(evento: Omit<Acesso, "id">) {
  const payload = JSON.stringify({ id: randomUUID(), ...evento });

  // Produção: persiste no Upstash Redis, que sobrevive a builds e reinícios.
  const r = await redis();
  if (r) {
    try {
      await r.lpush("acessos", payload);
      await r.ltrim("acessos", 0, MAX - 1);
      return;
    } catch {
      // fallthrough para o arquivo local
    }
  }

  // Desenvolvimento: acumula em um JSON no disco.
  try {
    let lista: string[] = [];
    try {
      lista = JSON.parse(await readFile(FILE, "utf8"));
    } catch {
      lista = [];
    }
    lista.unshift(payload);
    if (lista.length > MAX) lista.length = MAX;
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(lista), "utf8");
  } catch {
    // sem permissão de disco: ignora, não derruba a resposta
  }
}

export async function listar(limit = 500): Promise<Acesso[]> {
  const r = await redis();
  if (r) {
    try {
      const raw = await r.lrange("acessos", 0, limit - 1);
      return raw.map((r) => JSON.parse(r) as Acesso);
    } catch {
      // fallthrough
    }
  }
  try {
    const lista = JSON.parse(await readFile(FILE, "utf8")) as string[];
    return lista.slice(0, limit).map((r) => JSON.parse(r) as Acesso);
  } catch {
    return [];
  }
}

export async function apagar() {
  const r = await redis();
  if (r) {
    try {
      await r.del("acessos");
      return;
    } catch {
      // fallthrough
    }
  }
  try {
    await writeFile(FILE, "[]", "utf8");
  } catch {
    // ignora
  }
}