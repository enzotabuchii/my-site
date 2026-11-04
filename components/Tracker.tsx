"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initTracker, finalizarSessao } from "@/lib/tracker";

// Registra, de forma anônima, cada pageview, clique, scroll e saída.
// Não coleta nome, e-mail, IP ou qualquer identificador pessoal.
export default function Tracker() {
  const pathname = usePathname();
  const pageview = useRef<() => void>(() => {});
  const cliqueRef = useRef<(e: MouseEvent) => void>(() => {});
  const scrollMax = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const opts = {
      path: window.location.pathname,
      title: document.title,
      ref: document.referrer || null,
    };
    const t = initTracker(opts);
    pageview.current = t.pageview;
    cliqueRef.current = t.clique;
    t.pageview();

    const onScroll = () => {
      const pct = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
      );
      scrollMax.current = Math.max(scrollMax.current, pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", cliqueRef.current);

    const onBeforeUnload = () => finalizarSessao(scrollMax.current);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onBeforeUnload);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", cliqueRef.current);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (pageview.current) {
      pageview.current();
    }
  }, [pathname]);

  return null;
}