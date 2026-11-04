"use client";

import { useEffect, useMemo, useState } from "react";
import { Acesso } from "@/lib/acessos";

function fmtData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function isoDia(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function tipoLabel(t: string) {
  return { pageview: "Pageview", clique: "Clique", scroll: "Scroll", sair: "Saída" }[t] ?? t;
}

function tipoCor(t: string) {
  return { pageview: "#4f46e5", clique: "#0ea5e9", scroll: "#10b981", sair: "#f59e0b" }[t] ?? "#64748b";
}

export default function DashboardClient() {
  const token = process.env.NEXT_PUBLIC_ACESSOS_TOKEN || "";
  const [eventos, setEventos] = useState<Acesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroData, setFiltroData] = useState<string>("");

  // Carrega eventos a cada 10s
  useEffect(() => {
    let cancelled = false;
    const carregar = async () => {
      if (!token) {
        setErro("NEXT_PUBLIC_ACESSOS_TOKEN não definido. Configure no .env.local ou nas variáveis da Vercel.");
        setCarregando(false);
        return;
      }
      try {
        const res = await fetch(`/api/acessos?token=${encodeURIComponent(token)}&limit=2000`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || "falha");
        if (!cancelled) setEventos(data.eventos || []);
      } catch (e: any) {
        if (!cancelled) setErro(e.message);
      } finally {
        if (!cancelled) setCarregando(false);
      }
    };
    carregar();
    const id = setInterval(carregar, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  const eventosFiltrados = useMemo(() => {
    if (!filtroData) return eventos;
    const f = new Date(filtroData).toDateString();
    return eventos.filter((e) => new Date(e.ts).toDateString() === f);
  }, [eventos, filtroData]);

  const kpis = useMemo(() => {
    const total = eventosFiltrados.length;
    const pageviews = eventosFiltrados.filter((e) => e.tipo === "pageview").length;
    const cliques = eventosFiltrados.filter((e) => e.tipo === "clique").length;
    const saidas = eventosFiltrados.filter((e) => e.tipo === "sair").length;
    const duracoes = eventosFiltrados.filter((e) => e.tipo === "sair" && typeof e.duracao === "number") as Acesso[];
    const tempoMedio = duracoes.length ? Math.round(duracoes.reduce((a, b) => a + (b.duracao || 0), 0) / duracoes.length) : 0;
    return { total, pageviews, cliques, saidas, tempoMedio };
  }, [eventosFiltrados]);

  const porPagina = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of eventosFiltrados) {
      map.set(e.path, (map.get(e.path) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [eventosFiltrados]);

  const porHora = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of eventosFiltrados) {
      const h = new Date(e.ts).getHours().toString().padStart(2, "0") + "h";
      map.set(h, (map.get(h) || 0) + 1);
    }
    const horas = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0") + "h");
    return horas.map((h) => ({ h, v: map.get(h) || 0 }));
  }, [eventosFiltrados]);

  const porTipo = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of eventosFiltrados) map.set(e.tipo, (map.get(e.tipo) || 0) + 1);
    return Array.from(map.entries());
  }, [eventosFiltrados]);

  const maxHora = Math.max(1, ...porHora.map((p) => p.v));
  const maxPagina = Math.max(1, ...porPagina.map((p) => p[1]));

  if (carregando) {
    return (
      <div style={{ padding: "3rem", fontFamily: "system-ui" }}>
        <h1>Dashboard de Acessos</h1>
        <p>Carregando…</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ padding: "3rem", fontFamily: "system-ui" }}>
        <h1>Dashboard de Acessos</h1>
        <p style={{ color: "crimson" }}>{erro}</p>
        <p style={{ opacity: 0.7 }}>
          Configure <code>NEXT_PUBLIC_ACESSOS_TOKEN</code> com o mesmo valor de <code>ACESSOS_TOKEN</code> no .env local ou na Vercel.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Dashboard de Acessos</h1>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.9rem" }}>
          Filtrar por data:
          <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
          {filtroData && (
            <button onClick={() => setFiltroData("")} style={{ padding: "0.2rem 0.5rem", cursor: "pointer" }}>
              Limpar
            </button>
          )}
        </label>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total de eventos", value: kpis.total },
          { label: "Pageviews", value: kpis.pageviews },
          { label: "Cliques", value: kpis.cliques },
          { label: "Saídas", value: kpis.saidas },
          { label: "Tempo médio (s)", value: kpis.tempoMedio },
        ].map((k) => (
          <div key={k.label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>{k.label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{k.value.toLocaleString("pt-BR")}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Eventos por hora (últimos registros filtrados)</h3>
          <div style={{ height: "160px", display: "flex", alignItems: "flex-end", gap: "4px", borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem" }}>
            {porHora.map((p) => (
              <div key={p.h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                <div
                  title={`${p.h}: ${p.v}`}
                  style={{ width: "100%", background: "#e2e8f0", borderRadius: "2px", height: `${(p.v / maxHora) * 120}px`, minHeight: p.v ? "2px" : 0 }}
                />
                <span style={{ fontSize: "0.65rem", color: "#64748b" }}>{p.h}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Top páginas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {porPagina.length === 0 && <p style={{ opacity: 0.6 }}>Sem dados.</p>}
            {porPagina.map(([path, count]) => (
              <div key={path} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, background: "#e2e8f0", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                  <div style={{ width: `${(count / maxPagina) * 100}%`, height: "100%", background: "#6366f1" }} />
                </div>
                <div style={{ width: 140, fontFamily: "monospace", fontSize: "0.8rem" }}>{path}</div>
                <div style={{ width: 48, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Distribuição por tipo</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {porTipo.map(([tipo, count]) => (
            <div key={tipo} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: 12, height: 12, background: tipoCor(tipo), borderRadius: "3px", display: "inline-block" }} />
              <span>{tipoLabel(tipo)}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.7 }}>({count})</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Eventos recentes</h3>
        <div style={{ maxHeight: 320, overflow: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ position: "sticky", top: 0, background: "white" }}>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #e2e8f0" }}>Quando</th>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #e2e8f0" }}>Tipo</th>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #e2e8f0" }}>Path</th>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #e2e8f0" }}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {eventosFiltrados.slice(0, 100).map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>{fmtData(e.ts)}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        background: tipoCor(e.tipo) + "22",
                        color: tipoCor(e.tipo),
                        fontSize: "0.75rem",
                      }}
                    >
                      {tipoLabel(e.tipo)}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", fontFamily: "monospace" }}>{e.path}</td>
                  <td style={{ padding: "0.5rem", maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.tipo === "clique" && e.alvo && (
                      <span>
                        {e.alvo.tag} • {e.alvo.texto} {e.alvo.href && <a href={e.alvo.href} target="_blank" rel="noreferrer" style={{ marginLeft: 6, fontSize: "0.75rem" }}>↗</a>}
                      </span>
                    )}
                    {e.tipo === "pageview" && <span>Carregou a página</span>}
                    {e.tipo === "sair" && <span>Duração {e.duracao}s • scroll {e.scrollPct}%</span>}
                    {e.tipo === "scroll" && <span>Scroll {e.pct}%</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}