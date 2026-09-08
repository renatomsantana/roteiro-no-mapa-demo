/* Lupa: clicar num quadro abre a imagem inteira; setas e Esc navegam. */
(() => {
  const quadros = [...document.querySelectorAll('.quadro')];
  if (!quadros.length) return;

  let atual = -1;
  let lupa = null;

  function montar() {
    lupa = document.createElement('div');
    lupa.className = 'lupa';
    lupa.setAttribute('role', 'dialog');
    lupa.setAttribute('aria-modal', 'true');
    lupa.innerHTML = `
      <button class="fechar" type="button" aria-label="fechar">✕</button>
      <button class="anterior" type="button" aria-label="imagem anterior">‹</button>
      <button class="proxima" type="button" aria-label="próxima imagem">›</button>
      <img alt="" />
      <p class="legenda"><b></b><span></span></p>`;
    lupa.addEventListener('click', (ev) => {
      if (ev.target === lupa) fechar();
    });
    lupa.querySelector('.fechar').addEventListener('click', fechar);
    lupa.querySelector('.anterior').addEventListener('click', () => andar(-1));
    lupa.querySelector('.proxima').addEventListener('click', () => andar(1));
    document.body.appendChild(lupa);
  }

  function mostrar(i) {
    atual = (i + quadros.length) % quadros.length;
    const q = quadros[atual];
    const img = q.querySelector('img');
    lupa.querySelector('img').src = img.src;
    lupa.querySelector('img').alt = img.alt;
    lupa.querySelector('.legenda b').textContent = q.querySelector('h3')?.textContent ?? '';
    lupa.querySelector('.legenda span').textContent = q.querySelector('p')?.textContent ?? '';
  }

  function abrir(i) {
    if (!lupa) montar();
    lupa.hidden = false;
    document.body.style.overflow = 'hidden';
    mostrar(i);
    lupa.querySelector('.fechar').focus();
  }

  function fechar() {
    if (!lupa) return;
    lupa.hidden = true;
    document.body.style.overflow = '';
    quadros[atual]?.focus();
  }

  const andar = (passo) => mostrar(atual + passo);

  for (const [i, q] of quadros.entries()) q.addEventListener('click', () => abrir(i));

  document.addEventListener('keydown', (ev) => {
    if (!lupa || lupa.hidden) return;
    if (ev.key === 'Escape') fechar();
    else if (ev.key === 'ArrowLeft') andar(-1);
    else if (ev.key === 'ArrowRight') andar(1);
  });
})();
