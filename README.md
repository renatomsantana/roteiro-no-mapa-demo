# site/

Página estática para mostrar o projeto (GitHub Pages). Não faz parte do app.

- `index.html` — apresentação, com fotos reais das telas em `img/`.
- `demo.html` + `demo.js` + `demo.css` — demo do diário do viajante que roda inteira
  no navegador (localStorage, nada de servidor). É uma reimplementação em JS puro do
  que existe em `apps/web/src/app/viajante/`: passaporte, quadro arrastável e caderno.
- `estilo.css` — a mesma paleta e tipografia do app.

Publicação: `.github/workflows/pages.yml` sobe esta pasta a cada push em `main`.
Em **Settings → Pages**, escolha **Source: GitHub Actions**.

Para ver localmente: `python -m http.server 4173` dentro desta pasta.

As fotos são geradas do app rodando; para refazê-las, suba o app e use o Playwright
(veja o histórico do repositório).
