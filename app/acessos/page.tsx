import AcessosClient from "@/components/AcessosClient";

export const metadata = {
  title: "Acessos — Enzo Seiji Delgado Tabuchi",
};

export default function Page() {
  const token = process.env.ACESSOS_TOKEN;
  if (!token) {
    return (
      <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "700px", margin: "0 auto" }}>
        <h1>Acessos</h1>
        <p style={{ color: "#c00" }}>
          Variável <code>ACESSOS_TOKEN</code> não configurada. Adicione no ambiente (Vercel → Settings → Environment Variables)
          para proteger a página. Em desenvolvimento local, defina no <code>.env.local</code>.
        </p>
        <pre style={{ background: "#f5f5f5", padding: "1rem", overflow: "auto" }}>
{`ACESSOS_TOKEN="um-token-seguro-aqui"`}
        </pre>
      </main>
    );
  }
  return <AcessosClient token={token} />;
}