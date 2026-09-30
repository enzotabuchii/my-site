export type Repo = {
  nome: string;
  descricao: string | null;
  linguagem: string | null;
  url: string;
  atualizado: string | null;
};

const USER = "enzotabuchii";

// Usado se a API do GitHub estiver fora do ar ou no limite de requisições.
const reserva: Repo[] = [
  { nome: "FIAP-PCAcP", descricao: null, linguagem: "Python", url: `https://github.com/${USER}/FIAP-PCAcP`, atualizado: null },
  { nome: "my-site", descricao: null, linguagem: "TypeScript", url: `https://github.com/${USER}/my-site`, atualizado: null },
  { nome: "FIAP-DSA", descricao: null, linguagem: "Python", url: `https://github.com/${USER}/FIAP-DSA`, atualizado: null },
  { nome: "FIAP-COA", descricao: null, linguagem: "Python", url: `https://github.com/${USER}/FIAP-COA`, atualizado: null },
  { nome: "FIAP-CS", descricao: null, linguagem: "C++", url: `https://github.com/${USER}/FIAP-CS`, atualizado: null },
  { nome: "alura-java-spring-boot", descricao: null, linguagem: "Java", url: `https://github.com/${USER}/alura-java-spring-boot`, atualizado: null },
];

type ApiRepo = {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  pushed_at: string;
  fork: boolean;
};

export async function getRepos(limite = 6): Promise<Repo[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=20`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 }, // atualiza no máximo uma vez por hora
    });
    if (!res.ok) return reserva.slice(0, limite);
    const data = (await res.json()) as ApiRepo[];
    return data
      .filter((r) => !r.fork && r.name !== USER)
      .slice(0, limite)
      .map((r) => ({
        nome: r.name,
        descricao: r.description,
        linguagem: r.language,
        url: r.html_url,
        atualizado: r.pushed_at,
      }));
  } catch {
    return reserva.slice(0, limite);
  }
}

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function tempoRelativo(iso: string | null): string | null {
  if (!iso) return null;
  const dias = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (Math.abs(dias) < 30) return rtf.format(dias, "day");
  const meses = Math.round(dias / 30);
  if (Math.abs(meses) < 12) return rtf.format(meses, "month");
  return rtf.format(Math.round(dias / 365), "year");
}
