// Utilitários do tracker no cliente (roda no navegador).
// Envia eventos para a API /api/acessos via fetch() ou navigator.sendBeacon().

const SESSION_KEY = "acessos:sessao";
const INICIO_KEY = "acessos:inicio";

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

// Fingerprint anônimo do navegador: nada de nome, e-mail ou identificadores pessoais.
export function fingerprint(): string {
  const nav = navigator;
  const parts = [
    nav.userAgent,
    nav.language,
    (nav.languages || []).join(","),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${new Intl.NumberFormat().resolvedOptions().minimumSignificantDigits ?? ""}`,
    nav.platform,
    nav.cookieEnabled ? "1" : "0",
    nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : "",
  ];
  return hash(parts.join("|"));
}

export function conesao() {
  const c = (navigator as any).connection;
  if (!c) return null;
  return {
    tipo: c.type || null,
    downlink: typeof c.downlink === "number" ? c.downlink : null,
  };
}

function dataLocal(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function seletorDo(alvo: Element): string {
  const el = alvo as HTMLElement;
  if (el.getAttribute("data-acesso")) return el.getAttribute("data-acesso")!;
  if (el.id) return `#${el.id}`;
  const classes = Array.from(el.classList).filter((c) => !c.includes(":")).slice(0, 2);
  const cls = classes.length ? `.${classes.join(".")}` : "";
  return `${el.tagName.toLowerCase()}${cls}`;
}

function textoDo(alvo: Element, max = 60): string {
  const t = (alvo.textContent || "").trim().replace(/\s+/g, " ");
  return t.length > max ? t.slice(0, max) + "…" : t;
}

export type TrackerOpts = {
  path?: string;
  title?: string;
  ref?: string | null;
};

export function makeTracker(opts: TrackerOpts = {}) {
  const fp = fingerprint();
  const tel = { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1 };
  const nav = {
    lingua: navigator.language,
    plataforma: navigator.platform,
    cookies: navigator.cookieEnabled,
  };

  function base(tipo: string, extra: Record<string, unknown> = {}) {
    const ts = new Date().toISOString();
    return {
      ts,
      dataLocal: dataLocal(ts),
      tipo,
      path: opts.path ?? window.location.pathname,
      ref: opts.ref ?? (document.referrer || null),
      title: opts.title ?? document.title,
      fp,
      tela: tel,
      nav,
      conesao: conesao(),
      ...extra,
    };
  }

  function send(obj: any, viaBeacon = false) {
    try {
      const payload = JSON.stringify(obj);
      if (viaBeacon && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/acessos", blob);
      } else {
        fetch("/api/acessos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignora erros para não afetar a experiência do usuário
    }
  }

  return { base, send, fingerprint };
}

// Inicia a sessão e fornece callbacks para eventos do cliente.
export function initTracker(opts: TrackerOpts = {}): { pageview: () => void; clique: (e: MouseEvent) => void } {
  const { base, send } = makeTracker(opts);

  let inicio = Number(localStorage.getItem(INICIO_KEY)) || Date.now();
  localStorage.setItem(INICIO_KEY, String(inicio));

  let sessao = localStorage.getItem(SESSION_KEY) || hash(String(inicio));
  localStorage.setItem(SESSION_KEY, sessao);

  const pageview = () => send(base("pageview", { sessao }));

  const clique = (e: MouseEvent) => {
    const alvo = e.target as Element | null;
    if (!alvo) return;
    const r = alvo.getBoundingClientRect();
    send(
      base("clique", {
        sessao,
        alvo: {
          seletor: seletorDo(alvo),
          texto: textoDo(alvo),
          href: (alvo as HTMLAnchorElement).href || null,
          tag: alvo.tagName.toLowerCase(),
        },
        coords: {
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
          rx: Math.round(e.clientX - r.left),
          ry: Math.round(e.clientY - r.top),
        },
      })
    );
  };

  return { pageview, clique };
}

// Chamado no unload: registra a saída com duração e scroll máximo via sendBeacon.
export function finalizarSessao(scrollMax: number) {
  const inicio = Number(localStorage.getItem(INICIO_KEY)) || Date.now();
  const sessao = localStorage.getItem(SESSION_KEY) || hash(String(inicio));
  const { base, send } = makeTracker({});
  send(
    base("sair", {
      sessao,
      duracao: Math.round((Date.now() - inicio) / 1000),
      scrollPct: scrollMax,
    }),
    true // usa beacon no unload
  );
}