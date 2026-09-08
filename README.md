# site/

Página estática para mostrar o projeto (GitHub Pages). Não faz parte do app.

- `index.html` — a galeria: 20 fotos reais das telas em `img/`, em grade, com lupa
  (`galeria.js`) para ver cada uma inteira. Paleta azul e branca, com a grade densa
  no espírito do Letterboxd — a moldura é da página, as telas é que são o app.
- `demo.html` + `demo.js` + `demo.css` — demo do diário do viajante que roda inteira
  no navegador (localStorage, nada de servidor). É uma reimplementação em JS puro do
  que existe em `apps/web/src/app/viajante/`: passaporte, quadro arrastável e caderno.
- `estilo.css` — a moldura da página (azul e branco, fonte Inter).
- `demo.css` carrega a paleta e as fontes do **app** (papel e terra) dentro de
  `body.demo`, para a demo continuar com a cara do produto.

Publicação: esta pasta é o conteúdo do repositório público
[roteiro-no-mapa-demo](https://github.com/renatomsantana/roteiro-no-mapa-demo),
que serve o GitHub Pages direto do branch `main`:

    https://renatomsantana.github.io/roteiro-no-mapa-demo/

Para atualizar depois de mexer aqui:

    git add site && git commit -m "site: ..."
    git subtree push --prefix site site-demo main

(o remoto `site-demo` aponta para aquele repositório). O
`.github/workflows/pages.yml` da raiz só entra em uso se um dia o projeto inteiro
virar um repositório público com Pages por Actions.

Para ver localmente: `python -m http.server 4173` dentro desta pasta.

As fotos são geradas do app rodando; para refazê-las, suba o app e use o Playwright
(veja o histórico do repositório).
