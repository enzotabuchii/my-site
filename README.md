# Enzo Seiji Delgado Tabuchi

Site pessoal em Next.js 15 (App Router) + TypeScript, sem dependências além do próprio Next e React.

O destaque é um braço robótico de dois eixos, resolvido por cinemática inversa, que segue o cursor
e deixa um rastro como uma plotter. Ele só responde dentro do próprio quadro, então não interfere na navegação. Os projetos recentes do GitHub são buscados pela API no servidor
e atualizados a cada hora.

## Rodando

```bash
pnpm install
pnpm dev
pnpm build && pnpm start
```

Requer Node.js 18.18 ou mais novo.

## Onde editar

- `data/content.ts`: todos os textos (sobre, ferramentas, trajetória, projetos, links).
  A trajetória foi montada com o que está público no GitHub; complete com o que estiver no seu LinkedIn.
- `app/globals.css`: cores e tamanhos (tokens no topo).
- `data/content.ts`, campo `perfil.foto`: a foto do topo. Hoje usa seu avatar do GitHub; para trocar, coloque a imagem em `public/` e aponte para ela (ex.: `"/enzo.jpg"`).
- `components/RobotArm.tsx`: tamanho dos elos, velocidade e o desenho do braço.
- `components/PortugalEgg.tsx`: o easter egg.

## 🇵🇹

Digite `portugal`, `siu` ou `funchal` em qualquer lugar da página, ou clique nas coordenadas
do rodapé (é na Madalena do Mar). O site muda para verde e vermelho, uma caravela atravessa a tela,
o braço passa a segurar um pastel de nata e aparece uma frase escondida na seção Sobre.
`Esc` desliga. O console do navegador dá uma dica para quem for curioso.
