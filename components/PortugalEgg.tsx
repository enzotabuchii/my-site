"use client";

import { curiosidadesPortugal } from "@/data/content";
import { useCallback, useEffect, useRef, useState } from "react";

// Easter egg: digite "portugal", "siu" ou "funchal" em qualquer lugar da página,
// clique nas coordenadas do rodapé, ou clique 7 vezes no sobrenome "Delgado".

const PALAVRAS = ["portugal", "siu", "funchal"];
const EVENTO = "modo-portugal";
const CLIQUES_NECESSARIOS = 7;
const CLIQUE_TIMEOUT = 3000; // reseta se demorar mais de 3s entre cliques

export function DelgadoTrigger({ children }: { children: React.ReactNode }) {
  const cliques = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleClick = useCallback(() => {
    clearTimeout(timer.current);
    cliques.current += 1;
    if (cliques.current >= CLIQUES_NECESSARIOS) {
      cliques.current = 0;
      window.dispatchEvent(new Event(EVENTO));
    } else {
      timer.current = setTimeout(() => {
        cliques.current = 0;
      }, CLIQUE_TIMEOUT);
    }
  }, []);

  return (
    <span onClick={handleClick} style={{ cursor: "default" }}>
      {children}
    </span>
  );
}

export function PortugalTrigger() {
  return (
    <button
      type="button"
      className="coords"
      onClick={() => window.dispatchEvent(new Event(EVENTO))}
      aria-label="38 graus e 47 minutos norte, 9 graus e 30 minutos oeste"
    >
      32° 42′ 01.2″ N, 17° 08′ 03.2″ W
    </button>
  );
}

export default function PortugalEgg() {
  const [ligado, setLigado] = useState(false);
  const [indice, setIndice] = useState(0);
  const [viagem, setViagem] = useState(0); // reinicia a animação da caravela
  const buffer = useRef("");

  const ligar = useCallback(() => {
    setLigado(true);
    setViagem((v) => v + 1);
  }, []);

  useEffect(() => {
    console.log(
      "%cOlá! Este site guarda um segredo... Tente digitar uma palavra bem portuguesa, ou clique 7 vezes no sobrenome certo.",
      "color:#046A38;font-weight:700;font-size:13px"
    );

    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "Escape") return setLigado(false);
      if (e.key.length !== 1) return;
      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-12);
      if (PALAVRAS.some((p) => buffer.current.endsWith(p))) {
        buffer.current = "";
        ligar();
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener(EVENTO, ligar);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EVENTO, ligar);
    };
  }, [ligar]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-pt", ligado);
  }, [ligado]);

  if (!ligado) return null;

  return (
    <>
      <div className="caravela-mar" aria-hidden="true" key={viagem}>
        <Caravela />
      </div>

      <aside className="pt-toast" role="status">
        <p className="pt-toast-titulo">Olá, ó pá! Encontraste o modo Portugal!!!.</p>
        <p>{curiosidadesPortugal[indice]}</p>
        <div className="pt-toast-acoes">
          <button type="button" onClick={() => setIndice((i) => (i + 1) % curiosidadesPortugal.length)}>
            Outra curiosidade
          </button>
          <button type="button" onClick={() => setLigado(false)}>
            Voltar ao normal
          </button>
        </div>
      </aside>
    </>
  );
}

function Caravela() {
  return (
    <svg className="caravela" viewBox="0 0 220 180" width="220" height="180">
      {/* Mastros */}
      <line x1="92" y1="18" x2="92" y2="128" className="cv-mastro" />
      <line x1="140" y1="40" x2="140" y2="128" className="cv-mastro" />
      {/* Velas com a cruz da Ordem de Cristo */}
      <path d="M 62 34 Q 92 28 122 34 L 118 104 Q 92 110 66 104 Z" className="cv-vela" />
      <path d="M 88 46 h 8 v 16 h 16 v 8 h -16 v 22 h -8 v -22 h -16 v -8 h 16 Z" className="cv-cruz" />
      <path d="M 124 52 Q 140 48 158 52 L 156 108 Q 140 112 126 108 Z" className="cv-vela" />
      <path d="M 137 64 h 6 v 11 h 10 v 6 h -10 v 14 h -6 v -14 h -10 v -6 h 10 Z" className="cv-cruz" />
      {/* Bandeira */}
      <path d="M 92 18 L 112 22 L 92 27 Z" className="cv-bandeira" />
      {/* Casco */}
      <path d="M 24 124 L 196 124 L 178 152 Q 110 162 44 152 Z" className="cv-casco" />
      <path d="M 180 124 L 196 110 L 200 124" className="cv-casco" />
      {/* Ondas */}
      <path
        d="M 0 160 q 13 -9 27 0 t 27 0 t 27 0 t 27 0 t 27 0 t 27 0 t 27 0 t 27 0"
        className="cv-onda"
      />
    </svg>
  );
}
