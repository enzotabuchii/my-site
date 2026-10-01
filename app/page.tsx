import PortugalEgg, { DelgadoTrigger, PortugalTrigger } from "@/components/PortugalEgg";
import RobotArm from "@/components/RobotArm";
import { carreira, perfil, projetos, sobre, stack } from "@/data/content";
import { getRepos, tempoRelativo } from "@/lib/github";
import Image from "next/image";

export const revalidate = 3600;

export default async function Home() {
  const repos = await getRepos();

  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>

      <header className="topo wrap">
        <span className="marca">Tabuchi</span>
        <nav aria-label="Seções">
          <a href="#sobre">Sobre Mim</a>
          <a href="#projetos">Projetos</a>
        </nav>
      </header>

      <main id="conteudo">
        <section className="hero wrap">
          <div className="hero-texto">
            <h1 className="nome">
              {perfil.nome.map((parte) =>
                parte === "Delgado" ? (
                  <DelgadoTrigger key={parte}>{parte}</DelgadoTrigger>
                ) : (
                  <span key={parte}>{parte}</span>
                )
              )}
            </h1>
            <div className="apresentacao">
              <div className="foto">
                <Image src={perfil.foto} alt={`Foto de ${perfil.nomeCompleto}`} width={240} height={240} priority />
              </div>
              <p className="resumo">{perfil.resumo}</p>
            </div>
            <p className="agora">
              {perfil.cargo} no {perfil.empresa}, em {perfil.cidade}.
            </p>
          </div>
          <RobotArm />
        </section>

        <section id="sobre" className="bloco wrap">
          <h2>Sobre</h2>
          <div className="bloco-corpo prosa">
            {sobre.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <p className="pt-only">
              E, para quem chegou até aqui pelo caminho certo: também tenho cidadania portuguesa.
              Um pé em cada lado do Atlântico.
            </p>
          </div>
        </section>

        <section className="bloco wrap">
          <h2>Ferramentas</h2>
          <dl className="bloco-corpo stack">
            {stack.map((g) => (
              <div key={g.grupo}>
                <dt>{g.grupo}</dt>
                <dd>{g.itens.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="bloco wrap">
          <h2>Trajetória</h2>
          <ol className="bloco-corpo linha">
            {carreira.map((c) => (
              <li key={c.titulo}>
                <span className="linha-quando">{c.quando}</span>
                <div>
                  <h3>{c.titulo}</h3>
                  <p className="linha-onde">{c.onde}</p>
                  <p>{c.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="projetos" className="bloco wrap">
          <h2>Projetos</h2>
          <div className="bloco-corpo">
            <ul className="projetos">
              {projetos.map((p) => (
                <li key={p.nome}>
                  <a href={p.url} target="_blank" rel="noreferrer">
                    <h3>{p.nome}</h3>
                    <p className="projeto-papel">{p.papel}</p>
                    <p className="projeto-texto">{p.texto}</p>
                    <p className="projeto-tags">{p.tags.join(", ")}</p>
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="repos-titulo">Mexido recentemente no GitHub</h3>
            <ul className="repos">
              {repos.map((r) => (
                <li key={r.nome}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    <span className="repo-nome">{r.nome}</span>
                    <span className="repo-meta">
                      {[r.linguagem, tempoRelativo(r.atualizado)].filter(Boolean).join(", ")}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="rodape wrap">
        <p>
          Feito por {perfil.nomeCompleto}. {new Date().getFullYear()}.
        </p>
        <PortugalTrigger />
      </footer>

      <PortugalEgg />
    </>
  );
}
