"use client";

import { useEffect, useRef } from "react";

// Braço planar de 2 elos resolvido por cinemática inversa.
// O efetuador segue o cursor e deixa um rastro, como uma plotter.

const W = 660;
const H = 470;
const BASE = { x: 330, y: 400 };
const L1 = 170;
const L2 = 145;
const REACH = L1 + L2;
const TRAIL = 48;

type Pose = { q1: number; q2: number; ex: number; ey: number; px: number; py: number; reach: number };

function solve(tx: number, ty: number): Pose {
  let dx = tx - BASE.x;
  let dy = Math.min(ty, BASE.y - 12) - BASE.y; // nunca abaixo da mesa
  let d = Math.hypot(dx, dy) || 1;
  const max = REACH - 0.5;
  const min = Math.abs(L1 - L2) + 20;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  if (d < min) { dx *= min / d; dy *= min / d; d = min; }

  const c = (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  const q2abs = Math.acos(Math.max(-1, Math.min(1, c)));

  const opcoes = [q2abs, -q2abs].map((q2) => {
    const q1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(q2), L1 + L2 * Math.cos(q2));
    return { q1, q2, ex: BASE.x + L1 * Math.cos(q1), ey: BASE.y + L1 * Math.sin(q1) };
  });
  const s = opcoes[0].ey < opcoes[1].ey ? opcoes[0] : opcoes[1];
  return { ...s, px: BASE.x + dx, py: BASE.y + dy, reach: d / REACH };
}

const graus = (r: number) => Math.round((r * 180) / Math.PI);

export default function RobotArm() {
  const svgRef = useRef<SVGSVGElement>(null);
  const link1 = useRef<SVGGElement>(null);
  const link2 = useRef<SVGGElement>(null);
  const tool = useRef<SVGGElement>(null);
  const trail = useRef<SVGPolylineElement>(null);
  const target = useRef<SVGGElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alvo = { x: 470, y: 150 };
    const atual = { x: 470, y: 150 };
    let ultimoMovimento = -Infinity;
    const pontos: [number, number][] = [];
    let raf = 0;
    let visivel = true;

    const paraSvg = (clientX: number, clientY: number) => {
      const m = svg.getScreenCTM();
      if (!m) return null;
      const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    };

    const mover = (e: PointerEvent) => {
      const p = paraSvg(e.clientX, e.clientY);
      if (!p) return;
      alvo.x = p.x;
      alvo.y = p.y;
      ultimoMovimento = performance.now();
    };

    const desenhar = (pose: Pose) => {
      const a1 = graus(pose.q1);
      const a2 = graus(pose.q1 + pose.q2);
      link1.current?.setAttribute("transform", `translate(${BASE.x} ${BASE.y}) rotate(${a1})`);
      link2.current?.setAttribute("transform", `translate(${pose.ex} ${pose.ey}) rotate(${a2})`);
      tool.current?.setAttribute("transform", `translate(${pose.px} ${pose.py}) rotate(${a2})`);
      target.current?.setAttribute("transform", `translate(${alvo.x} ${Math.min(alvo.y, BASE.y - 12)})`);

      if (!reduce) {
        pontos.push([pose.px, pose.py]);
        if (pontos.length > TRAIL) pontos.shift();
        trail.current?.setAttribute("points", pontos.map((p) => p.join(",")).join(" "));
      }

      if (readout.current) {
        readout.current.textContent =
          `θ1 ${-a1}°   θ2 ${-graus(pose.q2)}°   alcance ${Math.round(pose.reach * 100)}%`;
      }
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visivel) return;

      // quando ele fica parado, vai desenhando automaticamente
      if (t - ultimoMovimento > 2600) {
        const s = t / 1400;
        alvo.x = BASE.x + Math.sin(s) * 190;
        alvo.y = 190 + Math.sin(s * 2) * 70;
      }
      atual.x += (alvo.x - atual.x) * 0.14;
      atual.y += (alvo.y - atual.y) * 0.14;
      desenhar(solve(atual.x, atual.y));
    };

    const observer = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    observer.observe(svg);

    if (reduce) {
      const direto = (e: PointerEvent) => {
        mover(e);
        desenhar(solve(alvo.x, alvo.y));
      };
      desenhar(solve(alvo.x, alvo.y));
      svg.addEventListener("pointermove", direto);
      svg.addEventListener("pointerdown", direto);
      return () => {
        svg.removeEventListener("pointermove", direto);
        svg.removeEventListener("pointerdown", direto);
        observer.disconnect();
      };
    }

    // só responde dentro do quadro
    const sair = () => {
      ultimoMovimento = -Infinity;
      svg.classList.remove("ativo");
    };
    const entrar = () => svg.classList.add("ativo");
    svg.addEventListener("pointermove", mover);
    svg.addEventListener("pointerdown", mover);
    svg.addEventListener("pointerenter", entrar);
    svg.addEventListener("pointerleave", sair);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener("pointermove", mover);
      svg.removeEventListener("pointerdown", mover);
      svg.removeEventListener("pointerenter", entrar);
      svg.removeEventListener("pointerleave", sair);
      observer.disconnect();
    };
  }, []);

  return (
    <figure className="arm">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Braço robótico de dois eixos que segue o cursor"
      >
        <path
          className="arm-envelope"
          d={`M ${BASE.x - REACH} ${BASE.y} A ${REACH} ${REACH} 0 0 1 ${BASE.x + REACH} ${BASE.y}`}
        />
        {/* Mesa com marcações a cada 40 px */}
        <line className="arm-floor" x1="0" y1={BASE.y + 26} x2={W} y2={BASE.y + 26} />
        {Array.from({ length: 17 }, (_, i) => (
          <line key={i} className="arm-tick" x1={i * 40} y1={BASE.y + 26} x2={i * 40} y2={BASE.y + 34} />
        ))}

        <polyline ref={trail} className="arm-trail" points="" />

        <g ref={target} className="arm-target">
          <line x1="-9" y1="0" x2="9" y2="0" />
          <line x1="0" y1="-9" x2="0" y2="9" />
        </g>

        {/* Base */}
        <rect className="arm-base" x={BASE.x - 58} y={BASE.y + 4} width="116" height="22" rx="4" />
        <path className="arm-base" d={`M ${BASE.x - 36} ${BASE.y + 6} L ${BASE.x - 24} ${BASE.y - 18} L ${BASE.x + 24} ${BASE.y - 18} L ${BASE.x + 36} ${BASE.y + 6} Z`} />

        {/* Elo 1 */}
        <g ref={link1}>
          <line className="arm-link" x1="0" y1="0" x2={L1} y2="0" />
          <line className="arm-core" x1="16" y1="0" x2={L1 - 16} y2="0" />
        </g>
        {/* Elo 2 */}
        <g ref={link2}>
          <line className="arm-link arm-link-thin" x1="0" y1="0" x2={L2} y2="0" />
          <line className="arm-core" x1="14" y1="0" x2={L2 - 14} y2="0" />
          <circle className="arm-joint" cx="0" cy="0" r="15" />
          <circle className="arm-pin" cx="0" cy="0" r="4" />
        </g>
        {/* Ombro por cima do elo 1 */}
        <circle className="arm-joint" cx={BASE.x} cy={BASE.y} r="19" />
        <circle className="arm-pin" cx={BASE.x} cy={BASE.y} r="5" />

        {/* Garra */}
        <g ref={tool}>
          <circle className="arm-joint" cx="0" cy="0" r="11" />
          <path className="arm-claw" d="M 6 -12 L 26 -14 L 32 -6" />
          <path className="arm-claw" d="M 6 12 L 26 14 L 32 6" />
          {/* Só aparece no modo Portugal */}
          <g className="nata" transform="translate(30 0)">
            <ellipse cx="0" cy="0" rx="13" ry="9" className="nata-massa" />
            <ellipse cx="0" cy="-1" rx="9" ry="6" className="nata-creme" />
            <circle cx="-3" cy="-2" r="1.8" className="nata-queimado" />
            <circle cx="3" cy="1" r="1.4" className="nata-queimado" />
          </g>
        </g>
      </svg>
      <figcaption>
        <p ref={readout} className="arm-readout" aria-hidden="true">θ1 0°   θ2 0°   alcance 0%</p>
        <p className="arm-hint">
          <span className="hint-mouse">Passe o cursor dentro do quadro. O braço vai atrás.</span>
          <span className="hint-toque">Toque dentro do quadro. O braço vai até lá.</span>
        </p>
      </figcaption>
    </figure>
  );
}
