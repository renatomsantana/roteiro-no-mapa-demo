/*
 * Demo do diário do viajante — a mesma lógica do app, em JavaScript puro.
 * Sem servidor: o estado vive no localStorage deste navegador.
 *
 * O arrastar e o deslizar são feitos com Pointer Events (mouse e dedo no mesmo
 * caminho), como em apps/web/src/components/arrastar.tsx.
 */
(() => {
  const CHAVE = 'roteiro-no-mapa-demo-v1';
  const LIMIAR_DESLIZE = 72;

  // ------------------------------------------------------------------ tipos
  const TIPOS = [
    { tipo: 'texto', rotulo: 'anotação', emoji: '📝', exemplo: 'escreva aqui…', transporte: false, campos: [] },
    { tipo: 'titulo', rotulo: 'título', emoji: '🔠', exemplo: 'Dia 1', transporte: false, campos: [] },
    { tipo: 'tarefa', rotulo: 'tarefa', emoji: '☑️', exemplo: 'levar adaptador', transporte: false, campos: [] },
    { tipo: 'link', rotulo: 'link', emoji: '🔗', exemplo: 'o que abrir depois', transporte: false, campos: [] },
    {
      tipo: 'hospedagem',
      rotulo: 'hotel',
      emoji: '🏨',
      exemplo: 'Hotel da Baixa',
      transporte: false,
      campos: ['endereco', 'inicio', 'fim', 'codigo', 'valor'],
    },
    {
      tipo: 'lugar',
      rotulo: 'lugar / monumento',
      emoji: '📍',
      exemplo: 'Torre de Belém',
      transporte: false,
      campos: ['endereco', 'inicio', 'valor'],
    },
    {
      tipo: 'restaurante',
      rotulo: 'restaurante',
      emoji: '🍽️',
      exemplo: 'Cervejaria Ramiro',
      transporte: false,
      campos: ['endereco', 'inicio', 'codigo'],
    },
    {
      tipo: 'ingresso',
      rotulo: 'ingresso',
      emoji: '🎟️',
      exemplo: 'Mosteiro dos Jerónimos',
      transporte: false,
      campos: ['local', 'inicio', 'codigo', 'valor'],
    },
    { tipo: 'gasto', rotulo: 'gasto', emoji: '💸', exemplo: 'combustível', transporte: false, campos: ['valor'] },
    {
      tipo: 'voo',
      rotulo: 'avião',
      emoji: '✈️',
      exemplo: 'TP 1234',
      transporte: true,
      campos: ['de', 'para', 'inicio', 'codigo', 'valor'],
    },
    {
      tipo: 'onibus',
      rotulo: 'ônibus',
      emoji: '🚌',
      exemplo: 'Rede Expressos',
      transporte: true,
      campos: ['de', 'para', 'inicio', 'codigo', 'valor'],
    },
    {
      tipo: 'trem',
      rotulo: 'trem',
      emoji: '🚆',
      exemplo: 'Alfa Pendular',
      transporte: true,
      campos: ['de', 'para', 'inicio', 'codigo', 'valor'],
    },
    {
      tipo: 'carro',
      rotulo: 'carro',
      emoji: '🚗',
      exemplo: 'estrada até o Porto',
      transporte: true,
      campos: ['de', 'para', 'inicio', 'valor'],
    },
    {
      tipo: 'moto',
      rotulo: 'moto',
      emoji: '🏍️',
      exemplo: 'serra abaixo',
      transporte: true,
      campos: ['de', 'para', 'inicio'],
    },
    {
      tipo: 'barco',
      rotulo: 'barco',
      emoji: '⛴️',
      exemplo: 'travessia do Tejo',
      transporte: true,
      campos: ['de', 'para', 'inicio'],
    },
    {
      tipo: 'bicicleta',
      rotulo: 'bicicleta',
      emoji: '🚲',
      exemplo: 'ciclovia do rio',
      transporte: true,
      campos: ['de', 'para'],
    },
    { tipo: 'a_pe', rotulo: 'a pé', emoji: '🥾', exemplo: 'caminhada', transporte: true, campos: ['de', 'para'] },
  ];
  const porTipo = (t) => TIPOS.find((x) => x.tipo === t) || TIPOS[0];

  const ROTULO_CAMPO = {
    local: 'lugar',
    endereco: 'endereço',
    de: 'de',
    para: 'para',
    inicio: 'começa',
    fim: 'termina',
    codigo: 'reserva / código',
    valor: 'quanto custou (R$)',
  };

  const COLUNAS = [
    { status: 'planejada', rotulo: 'Planejadas', ajuda: 'ainda vai acontecer' },
    { status: 'andamento', rotulo: 'Rolando', ajuda: 'está acontecendo agora' },
    { status: 'feita', rotulo: 'Feitas', ajuda: 'já aconteceu — conta no passaporte' },
  ];

  const PAISES = [
    ['ZA', 'África do Sul'],
    ['DE', 'Alemanha'],
    ['AR', 'Argentina'],
    ['AU', 'Austrália'],
    ['AT', 'Áustria'],
    ['BE', 'Bélgica'],
    ['BO', 'Bolívia'],
    ['BR', 'Brasil'],
    ['CA', 'Canadá'],
    ['CL', 'Chile'],
    ['CN', 'China'],
    ['CO', 'Colômbia'],
    ['KR', 'Coreia do Sul'],
    ['CR', 'Costa Rica'],
    ['HR', 'Croácia'],
    ['CU', 'Cuba'],
    ['DK', 'Dinamarca'],
    ['EG', 'Egito'],
    ['AE', 'Emirados Árabes Unidos'],
    ['EC', 'Equador'],
    ['SK', 'Eslováquia'],
    ['SI', 'Eslovênia'],
    ['ES', 'Espanha'],
    ['US', 'Estados Unidos'],
    ['PH', 'Filipinas'],
    ['FI', 'Finlândia'],
    ['FR', 'França'],
    ['GR', 'Grécia'],
    ['NL', 'Países Baixos'],
    ['HU', 'Hungria'],
    ['IN', 'Índia'],
    ['ID', 'Indonésia'],
    ['IE', 'Irlanda'],
    ['IS', 'Islândia'],
    ['IL', 'Israel'],
    ['IT', 'Itália'],
    ['JP', 'Japão'],
    ['MA', 'Marrocos'],
    ['MX', 'México'],
    ['NO', 'Noruega'],
    ['NZ', 'Nova Zelândia'],
    ['PA', 'Panamá'],
    ['PY', 'Paraguai'],
    ['PE', 'Peru'],
    ['PL', 'Polônia'],
    ['PT', 'Portugal'],
    ['GB', 'Reino Unido'],
    ['CZ', 'Tchéquia'],
    ['RO', 'Romênia'],
    ['SE', 'Suécia'],
    ['CH', 'Suíça'],
    ['TH', 'Tailândia'],
    ['TR', 'Turquia'],
    ['UY', 'Uruguai'],
    ['VN', 'Vietnã'],
  ];
  const nomeDoPais = (c) => (PAISES.find((p) => p[0] === c) || [c, c])[1];
  const bandeira = (c) =>
    !c || !/^[A-Za-z]{2}$/.test(c)
      ? '🏳️'
      : String.fromCodePoint(...[...c.toUpperCase()].map((x) => 0x1f1e6 + x.charCodeAt(0) - 65));

  // ------------------------------------------------------------------ formato
  const numero = new Intl.NumberFormat('pt-BR');
  const km = (m) => (m < 1000 ? `${numero.format(m)} m` : `${numero.format(Math.round(m / 1000))} km`);
  const reais = (cent) => `R$ ${numero.format(Math.round(cent / 100))}`;
  const dataCurta = (iso) => {
    if (!iso) return '';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a.slice(2)}`;
  };
  const periodo = (i, f) => (!i && !f ? 'sem data' : i && f ? `${dataCurta(i)} – ${dataCurta(f)}` : dataCurta(i || f));
  const diasEntre = (i, f) => {
    if (!i || !f) return 0;
    const ms = Date.parse(`${f}T00:00:00Z`) - Date.parse(`${i}T00:00:00Z`);
    return ms < 0 || Number.isNaN(ms) ? 0 : Math.round(ms / 86400000) + 1;
  };
  const id = () => Math.random().toString(36).slice(2, 10);
  const escapar = (t) =>
    String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // ------------------------------------------------------------------ estado
  function semente() {
    return {
      viagens: [
        {
          id: 'v1',
          titulo: 'Estrada Real de moto',
          emoji: '🏍️',
          inicio: '2025-05-01',
          fim: '2025-05-06',
          status: 'feita',
          cidades: [
            { id: id(), cidade: 'Ouro Preto', pais: 'BR' },
            { id: id(), cidade: 'Tiradentes', pais: 'BR' },
          ],
          blocos: [
            { id: id(), tipo: 'titulo', texto: 'Dia 1 — subindo a serra', metros: 0, dados: {}, feito: false },
            {
              id: id(),
              tipo: 'moto',
              texto: 'Ouro Preto → Tiradentes',
              metros: 92000,
              dados: { de: 'Ouro Preto', para: 'Tiradentes', inicio: '2025-05-01' },
              feito: false,
            },
            {
              id: id(),
              tipo: 'hospedagem',
              texto: 'Pousada do Chafariz',
              metros: 0,
              dados: {
                endereco: 'Rua Direita, 120',
                inicio: '2025-05-01',
                fim: '2025-05-03',
                codigo: 'PC-8842',
                valorCent: 48000,
              },
              feito: false,
            },
            { id: id(), tipo: 'tarefa', texto: 'levar capa de chuva', metros: 0, dados: {}, feito: true },
          ],
        },
        {
          id: 'v2',
          titulo: 'Portugal com a família',
          emoji: '🥘',
          inicio: '2024-09-10',
          fim: '2024-09-22',
          status: 'feita',
          cidades: [
            { id: id(), cidade: 'Lisboa', pais: 'PT' },
            { id: id(), cidade: 'Sintra', pais: 'PT' },
            { id: id(), cidade: 'Porto', pais: 'PT' },
          ],
          blocos: [
            {
              id: id(),
              tipo: 'voo',
              texto: 'TP 88 · São Paulo → Lisboa',
              metros: 7900000,
              dados: { de: 'GRU', para: 'LIS', inicio: '2024-09-10T23:40', codigo: 'JHT29K', valorCent: 380000 },
              feito: false,
            },
            {
              id: id(),
              tipo: 'trem',
              texto: 'Alfa Pendular para o Porto',
              metros: 313000,
              dados: { de: 'Lisboa', para: 'Porto', inicio: '2024-09-17T08:30', valorCent: 22000 },
              feito: false,
            },
            {
              id: id(),
              tipo: 'lugar',
              texto: 'Torre de Belém',
              metros: 0,
              dados: { endereco: 'Av. Brasília', inicio: '2024-09-12T10:00', valorCent: 6000 },
              feito: false,
            },
          ],
        },
        {
          id: 'v3',
          titulo: 'Patagônia em janeiro',
          emoji: '🏔️',
          inicio: '2027-01-05',
          fim: '2027-01-18',
          status: 'planejada',
          cidades: [{ id: id(), cidade: 'El Calafate', pais: 'AR' }],
          blocos: [
            { id: id(), tipo: 'tarefa', texto: 'renovar o passaporte', metros: 0, dados: {}, feito: false },
            { id: id(), tipo: 'tarefa', texto: 'comprar bota de trilha', metros: 0, dados: {}, feito: false },
          ],
        },
      ],
      soltas: [],
      coluna: 'feita',
      aba: 'dia',
      dia: {
        titulo: 'Dia 1 · Lisboa',
        data: 'sexta, 12/03',
        inicio: 9 * 60 + 30,
        paradas: [
          { id: 'p1', nome: 'Miradouro da Senhora do Monte', cat: 'mirante', dur: 30 },
          { id: 'p2', nome: 'Rossio', cat: 'atração', dur: 30 },
          { id: 'p3', nome: 'Elevador de Santa Justa', cat: 'atração', dur: 40 },
          { id: 'p4', nome: 'Taberna da Rua das Flores', cat: 'refeição', dur: 60 },
          { id: 'p5', nome: 'Convento do Carmo', cat: 'museu', dur: 60 },
        ],
        sugestoes: [
          {
            id: 's1',
            nome: 'Mosteiro dos Jerónimos',
            cat: 'atração',
            dur: 60,
            autor: 'Bruno',
            nota: 'meu irmão jura que o pastel daqui é o melhor',
          },
          {
            id: 's2',
            nome: 'Miradouro de Santa Catarina',
            cat: 'mirante',
            dur: 30,
            autor: 'Carla',
            nota: 'pôr do sol, leva casaco',
          },
          {
            id: 's3',
            nome: 'Time Out Market',
            cat: 'compras',
            dur: 45,
            autor: 'Ana',
            nota: 'se bater fome antes do almoço',
          },
        ],
      },
    };
  }

  let estado = carregar();
  let vendo = null; // id da viagem aberta no caderno
  let paisAberto = null;
  let desfazer = null;

  function carregar() {
    try {
      const cru = localStorage.getItem(CHAVE);
      if (cru) return JSON.parse(cru);
    } catch {
      /* navegador sem storage: segue com a semente */
    }
    return semente();
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      /* modo privado: a demo continua funcionando na memória */
    }
  }

  const viagem = (vid) => estado.viagens.find((v) => v.id === vid);
  const daColuna = (s) => estado.viagens.filter((v) => v.status === s);

  // ------------------------------------------------------------------ contas
  function passaporte() {
    const feitas = estado.viagens.filter((v) => v.status === 'feita');
    const futuras = estado.viagens.filter((v) => v.status !== 'feita');
    const paises = new Map();
    const cidades = new Set();
    const registrar = (c) => {
      if (!paises.has(c.pais)) paises.set(c.pais, []);
      const lista = paises.get(c.pais);
      if (!lista.includes(c.cidade)) lista.push(c.cidade);
      cidades.add(`${c.pais}|${c.cidade.toLowerCase()}`);
    };
    for (const v of feitas) for (const c of v.cidades) registrar(c);
    for (const c of estado.soltas) registrar(c);

    const metros = feitas.reduce((s, v) => s + v.blocos.reduce((t, b) => t + (b.metros || 0), 0), 0);
    const futurosPaises = new Set();
    const futurasCidades = new Set();
    for (const v of futuras) {
      for (const c of v.cidades) {
        if (!paises.has(c.pais)) futurosPaises.add(c.pais);
        const chave = `${c.pais}|${c.cidade.toLowerCase()}`;
        if (!cidades.has(chave)) futurasCidades.add(chave);
      }
    }

    return {
      paises: [...paises.entries()]
        .map(([codigo, lista]) => ({ codigo, cidades: lista }))
        .sort(
          (a, b) => b.cidades.length - a.cidades.length || nomeDoPais(a.codigo).localeCompare(nomeDoPais(b.codigo)),
        ),
      totalCidades: cidades.size,
      metros,
      dias: feitas.reduce((s, v) => s + diasEntre(v.inicio, v.fim), 0),
      feitas: feitas.length,
      paisesPlanejados: futurosPaises.size,
      cidadesPlanejadas: futurasCidades.size,
    };
  }

  const metrosDa = (v) => v.blocos.reduce((s, b) => s + (b.metros || 0), 0);
  const gastoDe = (v) => v.blocos.reduce((s, b) => s + ((b.dados && b.dados.valorCent) || 0), 0);
  const tarefasDe = (v) => {
    const t = v.blocos.filter((b) => b.tipo === 'tarefa');
    return { feitas: t.filter((b) => b.feito).length, total: t.length };
  };

  // ------------------------------------------------------------------ telas
  const tela = document.getElementById('tela');

  const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  const corDe = (nome) => {
    let h = 0;
    for (const c of nome) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `hsl(${h} 45% 38%)`;
  };

  function abas() {
    const um = (aba, rotulo) =>
      `<button type="button" data-aba-demo="${aba}" class="${estado.aba === aba ? 'ativa' : ''}">${rotulo}</button>`;
    return `<div class="abas-demo">${um('dia', 'Roteiro do dia')}${um('diario', 'Meu diário')}</div>`;
  }

  function render() {
    if (!estado.dia) estado.dia = semente().dia;
    if (!estado.aba) estado.aba = 'dia';
    const corpo = vendo ? htmlCaderno(viagem(vendo)) : estado.aba === 'dia' ? htmlDia() : htmlQuadro();
    tela.innerHTML = (vendo ? '' : abas()) + corpo;
    salvar();
  }

  /** O dia com as sugestões do grupo do lado: arrastar de uma coluna para a outra. */
  function htmlDia() {
    const d = estado.dia;
    let hora = d.inicio;
    const paradas = d.paradas
      .map((p, i) => {
        const inicio = hora;
        hora += p.dur + 15;
        return `
          <div class="item" data-item="${p.id}" data-zona="dia" data-indice="${i}" data-total="${d.paradas.length}">
            <div class="deslizavel">
              <div class="acoes-deslize"><span class="direita"></span><span class="esquerda">tirar do dia</span></div>
              <div class="conteudo-deslize">
                <div class="parada">
                  <button class="pega" type="button" data-pega aria-label="arrastar para reordenar">⠿</button>
                  <span class="numero">${i + 1}</span>
                  <div class="corpo">
                    <div class="linha1">
                      <span class="nome">${escapar(p.nome)}</span>
                      <span class="hora">${hhmm(inicio)}–${hhmm(inicio + p.dur)}</span>
                    </div>
                    <div class="linha2">
                      <span>${escapar(p.cat)}</span>
                      ${
                        p.posto
                          ? `<span class="posto"><i style="background:${corDe(p.posto)}">${p.posto[0]}</i> posto por ${escapar(p.posto)}</span>`
                          : ''
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      })
      .join('');

    const sugestoes = d.sugestoes
      .map(
        (g, i) => `
        <div class="item" data-item="${g.id}" data-zona="sugestoes" data-indice="${i}" data-total="${d.sugestoes.length}">
          <div class="deslizavel">
            <div class="acoes-deslize"><span class="direita">colocar no dia</span><span class="esquerda"></span></div>
            <div class="conteudo-deslize">
              <div class="sugestao">
                <button class="pega" type="button" data-pega aria-label="arrastar para o dia">⠿</button>
                <div class="corpo">
                  <div class="linha1"><span class="nome">${escapar(g.nome)}</span></div>
                  <div class="linha2">
                    <span class="posto"><i style="background:${corDe(g.autor)}">${g.autor[0]}</i> ${escapar(g.autor)}</span>
                  </div>
                  <p class="nota">“${escapar(g.nota)}”</p>
                  <button class="ligacao" type="button" data-colocar="${g.id}">colocar no dia</button>
                </div>
              </div>
            </div>
          </div>
        </div>`,
      )
      .join('');

    const proxima = d.paradas[0];
    return `
      <div class="cabecalho-demo">
        <div>
          <p class="chapeu">${escapar(d.data)}</p>
          <h1>${escapar(d.titulo)}</h1>
        </div>
      </div>

      <div class="aviso-telefone">
        <div class="cartao-aviso">
          <div class="app">Roteiro no Mapa <span>agora</span></div>
          <p class="titulo">PRÓX. PARADA · ${proxima ? escapar(proxima.nome.toUpperCase()) : 'DIA VAZIO'}</p>
          <p class="corpo">
            ${proxima ? `${hhmm(d.inicio)} · ${escapar(proxima.cat)} — o aviso chega no celular quando estiver perto.` : 'Coloque uma parada no dia.'}
          </p>
        </div>
      </div>

      <div class="dois-lados">
        <section>
          <div class="titulo-secao"><h2>O dia</h2><span class="dica">arraste pela pega ⠿</span></div>
          <div class="lista" data-lista="dia">${paradas || '<p class="vazio">dia vazio — traga uma sugestão para cá.</p>'}</div>
        </section>
        <section>
          <div class="titulo-secao"><h2>O grupo sugeriu</h2><span class="dica">arraste para o dia</span></div>
          <div class="lista" data-lista="sugestoes">${sugestoes || '<p class="vazio">o grupo não sugeriu mais nada.</p>'}</div>
        </section>
      </div>`;
  }

  /** Move um item entre "o dia" e "as sugestões" (ou reordena dentro de uma coluna). */
  function aplicarDia(zona, ids, id) {
    const d = estado.dia;
    const todos = [...d.paradas, ...d.sugestoes];
    const acha = (x) => todos.find((t) => t.id === x);
    const vindoDeSugestao = d.sugestoes.some((g) => g.id === id);
    if (zona === 'dia') {
      if (vindoDeSugestao) {
        const item = acha(id);
        if (item) item.posto = item.autor;
      }
      d.paradas = ids.map(acha).filter(Boolean);
      d.sugestoes = d.sugestoes.filter((g) => !ids.includes(g.id));
    } else {
      d.sugestoes = ids.map(acha).filter(Boolean);
      d.paradas = d.paradas.filter((p) => !ids.includes(p.id));
    }
    render();
  }

  function htmlQuadro() {
    const p = passaporte();
    // Parede de carimbos: bandeira, país e os lugares dele.
    const carimbos = p.paises
      .map(
        (x) => `
        <li class="carimbo">
          <div class="topo">
            <span class="bandeira" aria-hidden="true">${bandeira(x.codigo)}</span>
            <span class="pais">${escapar(nomeDoPais(x.codigo))}</span>
            <span class="conta">${x.cidades.length} ${x.cidades.length === 1 ? 'lugar' : 'lugares'}</span>
          </div>
          <p class="lugares">${escapar(x.cidades.join(' · '))}</p>
        </li>`,
      )
      .join('');

    const colunas = COLUNAS.map((c) => {
      const lista = daColuna(c.status);
      const cartoes = lista.map((v, i) => htmlCartao(v, c.status, i, lista.length)).join('');
      return `
        <div class="coluna ${estado.coluna === c.status ? '' : 'escondida'}">
          <header><h3>${c.rotulo}</h3><span>${c.ajuda}</span></header>
          <div class="lista" data-lista="${c.status}">
            ${cartoes || '<p class="vazio">nada aqui. arraste um cartão para cá.</p>'}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="cabecalho-demo">
        <div>
          <p class="chapeu">seu diário</p>
          <h1>Onde você já esteve</h1>
        </div>
        <button class="botao" type="button" data-nova>Nova viagem</button>
      </div>

      <div class="passaporte">
        <div class="contadores">
          <div class="contador">
            <b>${p.paises.length}</b><span>${p.paises.length === 1 ? 'país' : 'países'}</span>
            ${p.paisesPlanejados ? `<em>+${p.paisesPlanejados} planejados</em>` : ''}
          </div>
          <div class="contador">
            <b>${p.totalCidades}</b><span>${p.totalCidades === 1 ? 'cidade' : 'cidades'}</span>
            ${p.cidadesPlanejadas ? `<em>+${p.cidadesPlanejadas} planejadas</em>` : ''}
          </div>
          <div class="contador"><b>${km(p.metros)}</b><span>rodados</span><em>somados dos trechos</em></div>
          <div class="contador">
            <b>${p.dias}</b><span>${p.dias === 1 ? 'dia na estrada' : 'dias na estrada'}</span>
            ${p.feitas ? `<em>${p.feitas} viagens feitas</em>` : ''}
          </div>
        </div>
        ${carimbos ? `<div class="carimbos"><p class="rotulo">Carimbos</p><ul>${carimbos}</ul></div>` : ''}
        ${
          p.paises.length === 0
            ? '<p class="cidades-do-pais">Seu passaporte está em branco. Marque uma viagem como <strong>feita</strong> ou carimbe uma cidade.</p>'
            : ''
        }
        <div class="linha-form">
          <input type="text" data-cidade-solta placeholder="cidade que você já visitou" aria-label="cidade visitada" />
          <select data-pais-solto aria-label="país">${opcoesPais('BR')}</select>
          <button class="botao claro pequeno" type="button" data-carimbar>Carimbar</button>
        </div>
      </div>

      <div class="titulo-secao">
        <h2>Minhas viagens</h2>
        <span class="dica">arraste pelo <span aria-hidden="true">⠿</span> · no celular, deslize o cartão para o lado</span>
      </div>

      <div class="abas">
        ${COLUNAS.map(
          (c) =>
            `<button type="button" data-aba="${c.status}" class="${estado.coluna === c.status ? 'ativa' : ''}">
               ${c.rotulo} <span>${daColuna(c.status).length}</span>
             </button>`,
        ).join('')}
      </div>

      <div class="quadro">${colunas}</div>`;
  }

  function htmlCartao(v, zona, i, total) {
    const cidades = v.cidades.map((c) => c.cidade).join(', ');
    const bandeiras = [...new Set(v.cidades.map((c) => bandeira(c.pais)))].join(' ');
    const t = tarefasDe(v);
    const m = metrosDa(v);
    const proxima = zona === 'feita' ? '' : zona === 'planejada' ? '→ rolando' : '→ feita';
    const anterior = zona === 'planejada' ? '' : zona === 'feita' ? 'rolando ←' : 'planejada ←';
    return `
      <div class="item" data-item="${v.id}" data-zona="${zona}" data-indice="${i}" data-total="${total}">
        <div class="deslizavel">
          <div class="acoes-deslize">
            <span class="direita">${proxima}</span>
            <span class="esquerda">${anterior}</span>
          </div>
          <div class="conteudo-deslize">
            <div class="cartao-viagem">
              <button class="pega" type="button" data-pega aria-label="arrastar para reordenar" title="arraste, ou use as setas do teclado">⠿</button>
              <div class="corpo">
                <button class="nome" type="button" data-abrir="${v.id}">${v.emoji ? `${v.emoji} ` : ''}${escapar(v.titulo)}</button>
                <div class="datas">${periodo(v.inicio, v.fim)}</div>
                ${cidades ? `<div class="cidades"><span aria-hidden="true">${bandeiras}</span> ${escapar(cidades)}</div>` : ''}
                <div class="rodape">
                  ${m ? `<span>${km(m)}</span>` : ''}
                  ${t.total ? `<span>☑️ ${t.feitas}/${t.total}</span>` : ''}
                  <span>${v.blocos.length} blocos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function opcoesPais(sel) {
    return PAISES.map(
      ([c, n]) => `<option value="${c}" ${c === sel ? 'selected' : ''}>${bandeira(c)} ${escapar(n)}</option>`,
    ).join('');
  }

  function htmlCaderno(v) {
    const t = tarefasDe(v);
    const blocos = v.blocos.map((b, i) => htmlBloco(b, i, v.blocos.length)).join('');
    const chipsCidade = v.cidades
      .map(
        (c) =>
          `<span class="chip"><span aria-hidden="true">${bandeira(c.pais)}</span> ${escapar(c.cidade)}
             <button class="ligacao" type="button" data-tirar-cidade="${c.id}" aria-label="tirar ${escapar(c.cidade)}">×</button>
           </span>`,
      )
      .join('');

    return `
      <button class="ligacao" type="button" data-voltar>← diário</button>
      <div class="caderno-topo">
        <div style="flex:1;min-width:260px">
          <input class="titulo-viagem" data-titulo value="${escapar(v.titulo)}" aria-label="nome da viagem" />
          <div class="linha-form" style="border:0;margin:8px 0 0;padding:0">
            <input type="date" data-inicio value="${v.inicio || ''}" aria-label="começa em" />
            <span style="color:var(--tinta-3)">até</span>
            <input type="date" data-fim value="${v.fim || ''}" aria-label="termina em" />
            <select data-status aria-label="situação da viagem">
              ${COLUNAS.map((c) => `<option value="${c.status}" ${v.status === c.status ? 'selected' : ''}>${c.rotulo}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="resumo-caderno">
          <div><b data-total-km>${km(metrosDa(v))}</b><span>rodados</span></div>
          <div><b data-total-gasto>${reais(gastoDe(v))}</b><span>gasto</span></div>
          <div><b data-total-tarefas>${t.feitas}/${t.total}</b><span>tarefas</span></div>
        </div>
      </div>

      <div class="linha-form" style="border:0;padding:0;margin-bottom:6px">
        ${chipsCidade}
        <input type="text" data-nova-cidade placeholder="cidade" aria-label="cidade visitada" style="width:150px" />
        <select data-nova-cidade-pais aria-label="país">${opcoesPais(v.cidades[0] ? v.cidades[0].pais : 'BR')}</select>
        <button class="botao claro pequeno" type="button" data-add-cidade>+ cidade</button>
      </div>

      ${desfazer ? '<div class="aviso">Bloco removido. <button class="ligacao" type="button" data-desfazer>desfazer</button></div>' : ''}

      <div class="blocos" data-lista="caderno">
        ${blocos || '<p class="vazio">Caderno em branco. Coloque o hotel, o voo, os monumentos, o que quiser.</p>'}
      </div>

      <button class="botao claro" type="button" data-paleta>+ adicionar ao caderno</button>
      <div class="paleta" hidden>
        ${TIPOS.map((x) => `<button type="button" data-tipo="${x.tipo}"><span aria-hidden="true">${x.emoji}</span> ${x.rotulo}</button>`).join('')}
      </div>`;
  }

  function htmlBloco(b, i, total) {
    const info = porTipo(b.tipo);
    const d = b.dados || {};
    const partes = [];
    if (d.de || d.para) partes.push(`${escapar(d.de || '?')} → ${escapar(d.para || '?')}`);
    if (b.metros) partes.push(km(b.metros));
    if (d.local) partes.push(escapar(d.local));
    if (d.endereco) partes.push(escapar(d.endereco));
    if (d.inicio) partes.push(escapar(String(d.inicio).replace('T', ' ')));
    if (d.codigo) partes.push(`nº ${escapar(d.codigo)}`);
    if (d.valorCent) partes.push(reais(d.valorCent));

    const campos = info.campos
      .map((c) => {
        const valor = c === 'valor' ? (d.valorCent ? d.valorCent / 100 : '') : d[c] || '';
        const tipoHtml = c === 'valor' ? 'number' : c === 'inicio' || c === 'fim' ? 'text' : 'text';
        return `<div><label>${ROTULO_CAMPO[c]}<input type="${tipoHtml}" data-campo="${c}" value="${escapar(valor)}" /></label></div>`;
      })
      .join('');

    return `
      <div class="item" data-item="${b.id}" data-zona="caderno" data-indice="${i}" data-total="${total}">
        <div class="deslizavel">
          <div class="acoes-deslize"><span class="direita"></span><span class="esquerda">remover</span></div>
          <div class="conteudo-deslize">
            <div class="bloco tipo-${b.tipo} ${b.feito ? 'feito' : ''}">
              <button class="pega" type="button" data-pega aria-label="arrastar para reordenar">⠿</button>
              ${
                b.tipo === 'tarefa'
                  ? `<input type="checkbox" data-feito ${b.feito ? 'checked' : ''} aria-label="feito" style="margin-top:5px" />`
                  : `<span class="emoji" aria-hidden="true">${info.emoji}</span>`
              }
              <div class="corpo">
                <input class="texto" data-texto value="${escapar(b.texto)}" placeholder="${info.exemplo}" aria-label="${info.rotulo}" />
                ${
                  info.campos.length || info.transporte
                    ? `<div class="resumo">
                         ${partes.map((x) => `<span>${x}</span>`).join('')}
                         <button class="ligacao" type="button" data-preencher>preencher</button>
                       </div>
                       <div class="campos" hidden>
                         ${campos}
                         ${info.transporte ? `<div><label>quantos km<input type="number" data-km value="${b.metros ? b.metros / 1000 : ''}" /></label></div>` : ''}
                       </div>`
                    : ''
                }
              </div>
              <button class="ligacao" type="button" data-remover style="font-size:12px">remover</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  /** Atualiza só os números do caderno, para não perder o foco de quem está digitando. */
  function atualizarTotais() {
    const v = viagem(vendo);
    if (!v) return;
    const t = tarefasDe(v);
    const põe = (sel, txt) => {
      const el = tela.querySelector(sel);
      if (el) el.textContent = txt;
    };
    põe('[data-total-km]', km(metrosDa(v)));
    põe('[data-total-gasto]', reais(gastoDe(v)));
    põe('[data-total-tarefas]', `${t.feitas}/${t.total}`);
    salvar();
  }

  // ------------------------------------------------------------------ ações
  function moverViagem(vid, status, ids) {
    const v = viagem(vid);
    if (v) v.status = status;
    const ordem = new Map(ids.map((x, i) => [x, i]));
    estado.viagens.sort((a, b) => {
      const ia = ordem.has(a.id) ? ordem.get(a.id) : 999;
      const ib = ordem.has(b.id) ? ordem.get(b.id) : 999;
      return ia - ib;
    });
    estado.coluna = status;
    render();
  }

  function avancar(vid, direcao) {
    const v = viagem(vid);
    if (!v) return;
    const ordem = ['planejada', 'andamento', 'feita'];
    const i = ordem.indexOf(v.status) + direcao;
    if (i < 0 || i >= ordem.length) return;
    const destino = ordem[i];
    moverViagem(vid, destino, [...daColuna(destino).map((x) => x.id), vid]);
  }

  function reordenarBlocos(ids) {
    const v = viagem(vendo);
    if (!v) return;
    v.blocos.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    render();
  }

  // ------------------------------------------------------------------ arrastar
  let arrasto = null;

  function comecarArrasto(ev, item, captura) {
    arrasto = {
      item,
      linha: Object.assign(document.createElement('div'), { className: 'linha-solta' }),
      x0: ev.clientX,
      y0: ev.clientY,
      ponteiro: ev.pointerId,
    };
    item.classList.add('arrastando');
    try {
      captura.setPointerCapture(ev.pointerId);
    } catch {
      /* segue sem captura */
    }
    ev.preventDefault();
  }

  function moverArrasto(ev) {
    if (!arrasto || ev.pointerId !== arrasto.ponteiro) return;
    ev.preventDefault();
    arrasto.item.style.transform = `translate3d(${ev.clientX - arrasto.x0}px, ${ev.clientY - arrasto.y0}px, 0)`;
    const sob = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!sob) return;
    const sobre = sob.closest('[data-item]');
    const lista = sob.closest('[data-lista]');
    if (sobre && sobre !== arrasto.item) {
      const r = sobre.getBoundingClientRect();
      if (ev.clientY > r.top + r.height / 2) sobre.after(arrasto.linha);
      else sobre.before(arrasto.linha);
    } else if (lista && !lista.contains(arrasto.linha)) {
      lista.appendChild(arrasto.linha);
    }
  }

  function soltarArrasto() {
    if (!arrasto) return;
    const a = arrasto;
    arrasto = null;
    a.item.classList.remove('arrastando');
    a.item.style.transform = '';
    const lista = a.linha.parentElement;
    if (lista) {
      const contam = [...lista.children].filter((n) => (n.dataset && n.dataset.item && n !== a.item) || n === a.linha);
      const indice = contam.indexOf(a.linha);
      const ids = contam.filter((n) => n !== a.linha).map((n) => n.dataset.item);
      ids.splice(indice, 0, a.item.dataset.item);
      a.linha.remove();
      const zona = lista.dataset.lista;
      if (zona === 'caderno') reordenarBlocos(ids);
      else if (zona === 'dia' || zona === 'sugestoes') aplicarDia(zona, ids, a.item.dataset.item);
      else moverViagem(a.item.dataset.item, zona, ids);
    } else {
      a.linha.remove();
    }
  }

  // ------------------------------------------------------------------ deslizar
  let deslize = null;

  function fimDoDeslize() {
    if (!deslize) return;
    const d = deslize;
    deslize = null;
    d.alvo.classList.remove('movendo');
    d.alvo.style.transform = '';
    d.direita.style.opacity = 0;
    d.esquerda.style.opacity = 0;
    if (!d.ativo) return;
    const item = d.alvo.closest('[data-item]');
    if (!item) return;
    const zona = item.dataset.zona;
    if (d.dx >= LIMIAR_DESLIZE) {
      if (zona === 'sugestoes') colocarNoDia(item.dataset.item);
      else if (zona !== 'caderno' && zona !== 'dia' && zona !== 'feita') avancar(item.dataset.item, 1);
    } else if (d.dx <= -LIMIAR_DESLIZE) {
      if (zona === 'caderno') removerBloco(item.dataset.item);
      else if (zona === 'dia') tirarDoDia(item.dataset.item);
      else if (zona !== 'planejada' && zona !== 'sugestoes') avancar(item.dataset.item, -1);
    }
  }

  function colocarNoDia(id) {
    const d = estado.dia;
    aplicarDia('dia', [...d.paradas.map((p) => p.id), id], id);
  }

  function tirarDoDia(id) {
    const d = estado.dia;
    aplicarDia('sugestoes', [...d.sugestoes.map((g) => g.id), id], id);
  }

  function removerBloco(bid) {
    const v = viagem(vendo);
    if (!v) return;
    const i = v.blocos.findIndex((b) => b.id === bid);
    if (i === -1) return;
    desfazer = { bloco: v.blocos[i], posicao: i };
    v.blocos.splice(i, 1);
    render();
  }

  // ------------------------------------------------------------------ eventos
  tela.addEventListener('pointerdown', (ev) => {
    const item = ev.target.closest('[data-item]');
    if (!item) return;
    const pega = ev.target.closest('[data-pega]');
    if (pega) {
      comecarArrasto(ev, item, pega);
      return;
    }
    if (ev.pointerType === 'mouse') {
      if (ev.button !== 0 || ev.target.closest('input, select, button, a')) return;
      comecarArrasto(ev, item, item);
      return;
    }
    // dedo: o cartão desliza para o lado
    if (ev.target.closest('input, select, button, a')) return;
    const alvo = ev.target.closest('.conteudo-deslize');
    if (!alvo) return;
    deslize = {
      alvo,
      direita: alvo.parentElement.querySelector('.direita'),
      esquerda: alvo.parentElement.querySelector('.esquerda'),
      x0: ev.clientX,
      y0: ev.clientY,
      ponteiro: ev.pointerId,
      ativo: false,
      dx: 0,
    };
  });

  window.addEventListener(
    'pointermove',
    (ev) => {
      if (arrasto) {
        moverArrasto(ev);
        return;
      }
      if (!deslize || ev.pointerId !== deslize.ponteiro) return;
      const dx = ev.clientX - deslize.x0;
      const dy = ev.clientY - deslize.y0;
      if (!deslize.ativo) {
        if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy)) return;
        deslize.ativo = true;
        deslize.alvo.classList.add('movendo');
        try {
          deslize.alvo.setPointerCapture(ev.pointerId);
        } catch {
          /* segue sem captura */
        }
      }
      const item = deslize.alvo.closest('[data-item]');
      const podeDireita = item.dataset.zona !== 'caderno' && item.dataset.zona !== 'feita';
      const podeEsquerda = item.dataset.zona !== 'planejada';
      const cru = dx < 0 ? (podeEsquerda ? dx : 0) : podeDireita ? dx : 0;
      deslize.dx = Math.max(-120, Math.min(120, cru));
      deslize.alvo.style.transform = `translateX(${deslize.dx}px)`;
      if (deslize.direita) deslize.direita.style.opacity = deslize.dx > 8 ? 1 : 0;
      if (deslize.esquerda) deslize.esquerda.style.opacity = deslize.dx < -8 ? 1 : 0;
    },
    { passive: false },
  );

  window.addEventListener('pointerup', () => {
    if (arrasto) soltarArrasto();
    else fimDoDeslize();
  });
  window.addEventListener('pointercancel', () => {
    if (arrasto) soltarArrasto();
    else fimDoDeslize();
  });

  // setas do teclado na pega
  tela.addEventListener('keydown', (ev) => {
    const pega = ev.target.closest('[data-pega]');
    if (!pega || (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown')) return;
    const item = pega.closest('[data-item]');
    const lista = item.parentElement;
    const ids = [...lista.querySelectorAll(':scope > [data-item]')].map((n) => n.dataset.item);
    const i = ids.indexOf(item.dataset.item);
    const j = ev.key === 'ArrowUp' ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    ev.preventDefault();
    ids.splice(j, 0, ids.splice(i, 1)[0]);
    const zona = lista.dataset.lista;
    if (zona === 'caderno') reordenarBlocos(ids);
    else if (zona === 'dia' || zona === 'sugestoes') aplicarDia(zona, ids, item.dataset.item);
    else moverViagem(item.dataset.item, zona, ids);
  });

  tela.addEventListener('click', (ev) => {
    const alvo = ev.target;
    const acha = (sel) => alvo.closest(sel);

    if (acha('[data-abrir]')) {
      vendo = acha('[data-abrir]').dataset.abrir;
      desfazer = null;
      render();
      return;
    }
    if (acha('[data-voltar]')) {
      vendo = null;
      desfazer = null;
      render();
      return;
    }
    if (acha('[data-aba-demo]')) {
      estado.aba = acha('[data-aba-demo]').dataset.abaDemo;
      vendo = null;
      render();
      return;
    }
    if (acha('[data-colocar]')) {
      colocarNoDia(acha('[data-colocar]').dataset.colocar);
      return;
    }
    if (acha('[data-aba]')) {
      estado.coluna = acha('[data-aba]').dataset.aba;
      render();
      return;
    }
    if (acha('[data-pais]')) {
      const c = acha('[data-pais]').dataset.pais;
      paisAberto = paisAberto === c ? null : c;
      render();
      return;
    }
    if (acha('[data-carimbar]')) {
      const campo = tela.querySelector('[data-cidade-solta]');
      const pais = tela.querySelector('[data-pais-solto]').value;
      const cidade = campo.value.trim();
      if (!cidade) return;
      estado.soltas.push({ id: id(), cidade, pais });
      render();
      return;
    }
    if (acha('[data-nova]')) {
      const v = {
        id: id(),
        titulo: 'Viagem nova',
        emoji: '🧭',
        inicio: '',
        fim: '',
        status: estado.coluna,
        cidades: [],
        blocos: [],
      };
      estado.viagens.push(v);
      vendo = v.id;
      render();
      const t = tela.querySelector('[data-titulo]');
      if (t) {
        t.focus();
        t.select();
      }
      return;
    }
    if (acha('[data-paleta]')) {
      const p = tela.querySelector('.paleta');
      p.hidden = !p.hidden;
      return;
    }
    if (acha('[data-tipo]')) {
      const tipo = acha('[data-tipo]').dataset.tipo;
      const v = viagem(vendo);
      v.blocos.push({ id: id(), tipo, texto: '', metros: 0, dados: {}, feito: false });
      render();
      const ultimo = tela.querySelector('.blocos [data-item]:last-of-type [data-texto]');
      if (ultimo) ultimo.focus();
      return;
    }
    if (acha('[data-preencher]')) {
      const campos = acha('[data-item]').querySelector('.campos');
      campos.hidden = !campos.hidden;
      acha('[data-preencher]').textContent = campos.hidden ? 'preencher' : 'fechar';
      return;
    }
    if (acha('[data-remover]')) {
      removerBloco(acha('[data-item]').dataset.item);
      return;
    }
    if (acha('[data-desfazer]')) {
      const v = viagem(vendo);
      v.blocos.splice(desfazer.posicao, 0, desfazer.bloco);
      desfazer = null;
      render();
      return;
    }
    if (acha('[data-add-cidade]')) {
      const v = viagem(vendo);
      const campo = tela.querySelector('[data-nova-cidade]');
      const cidade = campo.value.trim();
      if (!cidade) return;
      v.cidades.push({ id: id(), cidade, pais: tela.querySelector('[data-nova-cidade-pais]').value });
      render();
      return;
    }
    if (acha('[data-tirar-cidade]')) {
      const v = viagem(vendo);
      v.cidades = v.cidades.filter((c) => c.id !== acha('[data-tirar-cidade]').dataset.tirarCidade);
      render();
      return;
    }
  });

  // digitação: muda o estado sem redesenhar (para não perder o foco)
  tela.addEventListener('input', (ev) => {
    const alvo = ev.target;
    const v = viagem(vendo);
    if (!v) return;
    if (alvo.matches('[data-titulo]')) {
      v.titulo = alvo.value;
      salvar();
      return;
    }
    const item = alvo.closest('[data-item]');
    const bloco = item && v.blocos.find((b) => b.id === item.dataset.item);
    if (!bloco) return;
    if (alvo.matches('[data-texto]')) bloco.texto = alvo.value;
    else if (alvo.matches('[data-km]')) bloco.metros = Math.max(0, Math.round(Number(alvo.value || 0) * 1000));
    else if (alvo.matches('[data-campo]')) {
      const campo = alvo.dataset.campo;
      bloco.dados = bloco.dados || {};
      if (campo === 'valor') bloco.dados.valorCent = Math.max(0, Math.round(Number(alvo.value || 0) * 100));
      else bloco.dados[campo] = alvo.value;
    } else return;
    atualizarTotais();
  });

  tela.addEventListener('change', (ev) => {
    const alvo = ev.target;
    const v = viagem(vendo);
    if (!v) return;
    if (alvo.matches('[data-inicio]')) v.inicio = alvo.value;
    else if (alvo.matches('[data-fim]')) v.fim = alvo.value;
    else if (alvo.matches('[data-status]')) v.status = alvo.value;
    else if (alvo.matches('[data-feito]')) {
      const item = alvo.closest('[data-item]');
      const b = v.blocos.find((x) => x.id === item.dataset.item);
      if (b) b.feito = alvo.checked;
    } else return;
    render();
  });

  document.getElementById('recomecar').addEventListener('click', () => {
    estado = semente();
    vendo = null;
    paisAberto = null;
    desfazer = null;
    render();
  });

  render();
})();
