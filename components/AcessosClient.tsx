"use client";

import { useEffect, useState } from "react";
import { Acesso } from "@/lib/acessos";

function tipoIcon(t: string) {
  switch (t) {
    case "pageview":
      return "📄";
    case "clique":
      return "🖱️";
    case "scroll":
      return "📜";
    case "sair":
      return "🚪";
    default:
      return "•";
  }
}

function fmtData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function clip(s: string, n = 50) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default function AcessosClient({ token }: { token: string }) {
  const [eventos, setEventos] = useState<Acesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("");

  const carregar = async () => {
    try {
      const res = await fetch(`/api/acessos?token=${encodeURIComponent(token)}&limit=1000`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "falha ao carregar");
      setEventos(data.eventos || []);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [token]);

  const filtrados = eventos.filter((e) => {
    if (!filtro) return true;
    const f = filtro.toLowerCase();
    return (
      e.path.toLowerCase().includes(f) ||
      e.tipo.includes(f) ||
      e.alvo?.texto?.toLowerCase().includes(f) ||
      e.alvo?.href?.toLowerCase().includes(f) ||
      e.alvo?.seletor?.toLowerCase().includes(f)
    );
  });

  if (carregando) return <p>Carregando…</p>;
  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: "1000px", margin: "0 auto", padding: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>📊 Log de Acessos Anônimos</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Filtrar (path, tipo, clique…)"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ padding: "0.4rem 0.6rem", border: "1px solid #ccc", borderRadius: "4px", width: "280px" }}
          />
          <button onClick={carregar} style={{ padding: "0.4rem 0.8rem", cursor: "pointer" }}>Atualizar</button>
        </div>
      </header>

      <p style={{ color: "#666", marginBottom: "1rem" }}>
        {filtrados.length} de {eventos.length} eventos
        {filtrados.length !== eventos.length && <span> (filtrados)</span>}
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #333", position: "sticky", top: 0, background: "white" }}>
              <th style={{ padding: "0.5rem" }}>Quando</th>
              <th style={{ padding: "0.5rem", width: "60px" }}>Tipo</th>
              <th style={{ padding: "0.5rem" }}>Path</th>
              <th style={{ padding: "0.5rem" }}>Referrer</th>
              <th style={{ padding: "0.5rem" }}>Detalhes</th>
              <th style={{ padding: "0.5rem" }}>Fingerprint</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{fmtData(e.ts)}</td>
                <td style={{ padding: "0.5rem", textAlign: "center" }} title={e.tipo}>
                  {tipoIcon(e.tipo)}
                </td>
                <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {clip(e.path, 40)}
                </td>
                <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#666", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {clip(e.ref || "—", 40)}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  {e.tipo === "clique" && e.alvo && (
                    <>
                      <strong>{e.alvo.tag}</strong> {clip(e.alvo.texto, 35)}
                      {e.alvo.href && <span style={{ color: "#0066cc", marginLeft: "0.5rem" }}>{clip(e.alvo.href, 35)}</span>}
                      {e.coords && <span style={{ color: "#999", marginLeft: "0.5rem" }}>@({e.coords.x},{e.coords.y})</span>}
                    </>
                  )}
                  {e.tipo === "pageview" && <span>Carregou a página</span>}
                  {e.tipo === "scroll" && e.pct && <span>Scroll até {e.pct}%</span>}
                  {e.tipo === "sair" && (
                    <>
                      Duração: {e.duracao}s · Scroll máx: {e.scrollPct}%
                    </>
                  )}
                </td>
                <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.7rem", color: "#888" }}>
                  {e.fp.slice(0, 8)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtrados.length === 0 && (
        <p style={{ textAlign: "center", color: "#999", marginTop: "2rem" }}>Nenhum evento.</p>
      )}
    </div>
  );
}