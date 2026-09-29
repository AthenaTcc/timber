/**
 * CINETIMBER - FRONTEND APPLICATION
 * Gestão Completa de Cinema com CRUD de Filmes, Salas, Sessões e Catálogo de Ingressos.
 */

// 1. Configuração e Estado Global da Aplicação
const DEFAULT_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || !window.location.hostname
  ? 'http://localhost:3000/api'
  : '/api';

const state = {
  apiBase: localStorage.getItem('cinetimber_api_url') || DEFAULT_API_BASE,
  activeTab: 'catalogo',
  filmes: [],
  salas: [],
  sessoes: [],
  catalogoFilters: {
    search: '',
    date: 'all',
    room: 'all'
  },
  filmesFilter: '',
  salasFilter: '',
  sessoesFilters: {
    filmeId: 'all',
    salaId: 'all',
    date: ''
  },
  selectedSession: null,
  ticketQty: 1,
  pendingDelete: null // { type: 'filme' | 'sala' | 'sessao', id: string, name: string }
};

// 2. Elementos DOM Mapeados
const dom = {
  // Status da API e Configurações
  apiStatusBadge: document.getElementById('apiStatusBadge'),
  apiStatusText: document.getElementById('apiStatusText'),
  btnSettings: document.getElementById('btnSettings'),
  settingsModal: document.getElementById('settingsModal'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),
  apiUrlInput: document.getElementById('apiUrlInput'),
  btnSaveApi: document.getElementById('btnSaveApi'),
  btnResetApi: document.getElementById('btnResetApi'),
  btnOpenApiConfig: document.getElementById('btnOpenApiConfig'),

  // Abas de Navegação
  tabBtns: document.querySelectorAll('.tab-btn'),
  panes: {
    catalogo: document.getElementById('paneCatalogo'),
    filmes: document.getElementById('paneFilmes'),
    salas: document.getElementById('paneSalas'),
    sessoes: document.getElementById('paneSessoes')
  },
  badgeTotalFilmes: document.getElementById('badgeTotalFilmes'),
  badgeTotalSalas: document.getElementById('badgeTotalSalas'),
  badgeTotalSessoes: document.getElementById('badgeTotalSessoes'),

  // Banners de Métricas
  statFilmes: document.getElementById('statFilmes'),
  statSessoes: document.getElementById('statSessoes'),
  statSalas: document.getElementById('statSalas'),
  statAssentos: document.getElementById('statAssentos'),

  // Estados Globais
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  errorMessageTitle: document.getElementById('errorMessageTitle'),
  errorMessageDesc: document.getElementById('errorMessageDesc'),
  btnRetry: document.getElementById('btnRetry'),

  // Aba Catálogo
  catalogoSearchInput: document.getElementById('catalogoSearchInput'),
  catalogoDateFilter: document.getElementById('catalogoDateFilter'),
  catalogoRoomFilter: document.getElementById('catalogoRoomFilter'),
  btnClearCatalogoFilters: document.getElementById('btnClearCatalogoFilters'),
  btnResetCatalogoFilters: document.getElementById('btnResetCatalogoFilters'),
  btnRefreshCatalogo: document.getElementById('btnRefreshCatalogo'),
  moviesCatalogGrid: document.getElementById('moviesCatalogGrid'),
  emptyCatalogo: document.getElementById('emptyCatalogo'),

  // Aba Filmes (CRUD)
  btnNovoFilme: document.getElementById('btnNovoFilme'),
  btnEmptyNovoFilme: document.getElementById('btnEmptyNovoFilme'),
  filmesSearchInput: document.getElementById('filmesSearchInput'),
  filmesCountText: document.getElementById('filmesCountText'),
  filmesAdminGrid: document.getElementById('filmesAdminGrid'),
  emptyFilmes: document.getElementById('emptyFilmes'),

  // Aba Salas (CRUD)
  btnNovaSala: document.getElementById('btnNovaSala'),
  btnEmptyNovaSala: document.getElementById('btnEmptyNovaSala'),
  salasSearchInput: document.getElementById('salasSearchInput'),
  salasCountText: document.getElementById('salasCountText'),
  salasAdminGrid: document.getElementById('salasAdminGrid'),
  emptySalas: document.getElementById('emptySalas'),

  // Aba Sessões (CRUD)
  btnNovaSessao: document.getElementById('btnNovaSessao'),
  btnEmptyNovaSessao: document.getElementById('btnEmptyNovaSessao'),
  sessoesFilterFilme: document.getElementById('sessoesFilterFilme'),
  sessoesFilterSala: document.getElementById('sessoesFilterSala'),
  sessoesFilterData: document.getElementById('sessoesFilterData'),
  btnClearSessoesFilters: document.getElementById('btnClearSessoesFilters'),
  sessoesTableBody: document.getElementById('sessoesTableBody'),
  emptySessoes: document.getElementById('emptySessoes'),

  // Modal Filme
  modalFilme: document.getElementById('modalFilme'),
  modalFilmeTitle: document.getElementById('modalFilmeTitle'),
  btnCloseModalFilme: document.getElementById('btnCloseModalFilme'),
  btnCancelFilme: document.getElementById('btnCancelFilme'),
  formFilme: document.getElementById('formFilme'),
  filmeId: document.getElementById('filmeId'),
  filmeTitulo: document.getElementById('filmeTitulo'),
  filmeDuracao: document.getElementById('filmeDuracao'),
  filmeClassificacao: document.getElementById('filmeClassificacao'),
  filmePosterUrl: document.getElementById('filmePosterUrl'),
  posterPreviewImg: document.getElementById('posterPreviewImg'),
  posterPlaceholderText: document.getElementById('posterPlaceholderText'),
  filmeSinopse: document.getElementById('filmeSinopse'),

  // Modal Sala
  modalSala: document.getElementById('modalSala'),
  modalSalaTitle: document.getElementById('modalSalaTitle'),
  btnCloseModalSala: document.getElementById('btnCloseModalSala'),
  btnCancelSala: document.getElementById('btnCancelSala'),
  formSala: document.getElementById('formSala'),
  salaId: document.getElementById('salaId'),
  salaNome: document.getElementById('salaNome'),
  salaCapacidade: document.getElementById('salaCapacidade'),

  // Modal Sessão
  modalSessao: document.getElementById('modalSessao'),
  modalSessaoTitle: document.getElementById('modalSessaoTitle'),
  btnCloseModalSessao: document.getElementById('btnCloseModalSessao'),
  btnCancelSessao: document.getElementById('btnCancelSessao'),
  formSessao: document.getElementById('formSessao'),
  sessaoId: document.getElementById('sessaoId'),
  sessaoFilmeId: document.getElementById('sessaoFilmeId'),
  sessaoSalaId: document.getElementById('sessaoSalaId'),
  sessaoDataExibicao: document.getElementById('sessaoDataExibicao'),
  sessaoPreco: document.getElementById('sessaoPreco'),
  sessaoHorarioInicio: document.getElementById('sessaoHorarioInicio'),
  sessaoHorarioTermino: document.getElementById('sessaoHorarioTermino'),
  sessaoAssentosDisponiveis: document.getElementById('sessaoAssentosDisponiveis'),

  // Modal Exclusão
  modalConfirmDelete: document.getElementById('modalConfirmDelete'),
  deleteModalTitle: document.getElementById('deleteModalTitle'),
  deleteModalMessage: document.getElementById('deleteModalMessage'),
  deleteModalSubMessage: document.getElementById('deleteModalSubMessage'),
  btnCloseConfirmDelete: document.getElementById('btnCloseConfirmDelete'),
  btnCancelDelete: document.getElementById('btnCancelDelete'),
  btnExecuteDelete: document.getElementById('btnExecuteDelete'),

  // Modal Reserva Ingressos
  ticketModal: document.getElementById('ticketModal'),
  btnCloseTicket: document.getElementById('btnCloseTicket'),
  btnCancelTicket: document.getElementById('btnCancelTicket'),
  btnConfirmTicket: document.getElementById('btnConfirmTicket'),
  ticketModalBody: document.getElementById('ticketModalBody'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// 3. Inicialização ao Carregar o Documento
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  dom.apiUrlInput.value = state.apiBase;
  carregarTodosOsDados();
});

// =============================================================================
// 4. CONFIGURAÇÃO DE EVENTOS & NAVEGAÇÃO
// =============================================================================
function setupEventListeners() {
  // Navegação por Abas
  dom.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      trocarAba(tabName);
    });
  });

  // Modal de Configuração da API
  dom.btnSettings.addEventListener('click', () => {
    dom.apiUrlInput.value = state.apiBase;
    abrirModal(dom.settingsModal);
  });

  if (dom.btnOpenApiConfig) {
    dom.btnOpenApiConfig.addEventListener('click', () => {
      dom.apiUrlInput.value = state.apiBase;
      abrirModal(dom.settingsModal);
    });
  }

  dom.btnCloseSettings.addEventListener('click', () => fecharModal(dom.settingsModal));

  dom.btnResetApi.addEventListener('click', () => {
    dom.apiUrlInput.value = DEFAULT_API_BASE;
  });

  dom.btnSaveApi.addEventListener('click', () => {
    const novaUrl = dom.apiUrlInput.value.trim().replace(/\/$/, '');
    if (novaUrl) {
      state.apiBase = novaUrl;
      localStorage.setItem('cinetimber_api_url', novaUrl);
      fecharModal(dom.settingsModal);
      showToast('URL da API alterada com sucesso!', 'success');
      carregarTodosOsDados();
    }
  });

  dom.btnRetry.addEventListener('click', () => carregarTodosOsDados());

  // --- Filtros do Catálogo ---
  dom.catalogoSearchInput.addEventListener('input', (e) => {
    state.catalogoFilters.search = e.target.value.toLowerCase().trim();
    renderCatalogo();
  });

  dom.catalogoDateFilter.addEventListener('change', (e) => {
    state.catalogoFilters.date = e.target.value;
    renderCatalogo();
  });

  dom.catalogoRoomFilter.addEventListener('change', (e) => {
    state.catalogoFilters.room = e.target.value;
    renderCatalogo();
  });

  dom.btnClearCatalogoFilters.addEventListener('click', resetarFiltrosCatalogo);
  if (dom.btnResetCatalogoFilters) {
    dom.btnResetCatalogoFilters.addEventListener('click', resetarFiltrosCatalogo);
  }
  dom.btnRefreshCatalogo.addEventListener('click', () => carregarTodosOsDados());

  // --- Filtros e Busca da Aba Filmes ---
  dom.filmesSearchInput.addEventListener('input', (e) => {
    state.filmesFilter = e.target.value.toLowerCase().trim();
    renderFilmes();
  });

  // --- Filtros e Busca da Aba Salas ---
  dom.salasSearchInput.addEventListener('input', (e) => {
    state.salasFilter = e.target.value.toLowerCase().trim();
    renderSalas();
  });

  // --- Filtros da Aba Sessões ---
  dom.sessoesFilterFilme.addEventListener('change', (e) => {
    state.sessoesFilters.filmeId = e.target.value;
    renderSessoes();
  });

  dom.sessoesFilterSala.addEventListener('change', (e) => {
    state.sessoesFilters.salaId = e.target.value;
    renderSessoes();
  });

  dom.sessoesFilterData.addEventListener('change', (e) => {
    state.sessoesFilters.date = e.target.value;
    renderSessoes();
  });

  dom.btnClearSessoesFilters.addEventListener('click', () => {
    dom.sessoesFilterFilme.value = 'all';
    dom.sessoesFilterSala.value = 'all';
    dom.sessoesFilterData.value = '';
    state.sessoesFilters = { filmeId: 'all', salaId: 'all', date: '' };
    renderSessoes();
  });

  // --- Ações de Abertura de Modais CRUD ---
  dom.btnNovoFilme.addEventListener('click', () => abrirModalFilme());
  dom.btnEmptyNovoFilme.addEventListener('click', () => abrirModalFilme());
  dom.btnCloseModalFilme.addEventListener('click', () => fecharModal(dom.modalFilme));
  dom.btnCancelFilme.addEventListener('click', () => fecharModal(dom.modalFilme));
  dom.formFilme.addEventListener('submit', salvarFilme);

  // Preview em tempo real da URL do pôster
  dom.filmePosterUrl.addEventListener('input', (e) => {
    atualizarPreviewPoster(e.target.value.trim());
  });

  dom.btnNovaSala.addEventListener('click', () => abrirModalSala());
  dom.btnEmptyNovaSala.addEventListener('click', () => abrirModalSala());
  dom.btnCloseModalSala.addEventListener('click', () => fecharModal(dom.modalSala));
  dom.btnCancelSala.addEventListener('click', () => fecharModal(dom.modalSala));
  dom.formSala.addEventListener('submit', salvarSala);

  dom.btnNovaSessao.addEventListener('click', () => abrirModalSessao());
  dom.btnEmptyNovaSessao.addEventListener('click', () => abrirModalSessao());
  dom.btnCloseModalSessao.addEventListener('click', () => fecharModal(dom.modalSessao));
  dom.btnCancelSessao.addEventListener('click', () => fecharModal(dom.modalSessao));
  dom.formSessao.addEventListener('submit', salvarSessao);

  // Modal de Exclusão
  dom.btnCloseConfirmDelete.addEventListener('click', () => fecharModal(dom.modalConfirmDelete));
  dom.btnCancelDelete.addEventListener('click', () => fecharModal(dom.modalConfirmDelete));
  dom.btnExecuteDelete.addEventListener('click', executarExclusao);

  // Modal de Reserva
  dom.btnCloseTicket.addEventListener('click', () => fecharModal(dom.ticketModal));
  dom.btnCancelTicket.addEventListener('click', () => fecharModal(dom.ticketModal));
  dom.btnConfirmTicket.addEventListener('click', confirmarReserva);

  // Fechar modais ao clicar no backdrop escuro
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) fecharModal(modal);
    });
  });

  // Fechar modais com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => fecharModal(modal));
    }
  });
}

function trocarAba(tabName) {
  state.activeTab = tabName;

  // Atualiza botões
  dom.tabBtns.forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Atualiza painéis
  Object.keys(dom.panes).forEach(paneKey => {
    if (dom.panes[paneKey]) {
      dom.panes[paneKey].classList.toggle('active', paneKey === tabName);
      dom.panes[paneKey].classList.toggle('hidden', paneKey !== tabName);
    }
  });

  // Renderiza conteúdo específico da aba selecionada
  if (tabName === 'catalogo') renderCatalogo();
  if (tabName === 'filmes') renderFilmes();
  if (tabName === 'salas') renderSalas();
  if (tabName === 'sessoes') renderSessoes();
}

function resetarFiltrosCatalogo() {
  state.catalogoFilters = { search: '', date: 'all', room: 'all' };
  dom.catalogoSearchInput.value = '';
  dom.catalogoDateFilter.value = 'all';
  dom.catalogoRoomFilter.value = 'all';
  renderCatalogo();
}

// =============================================================================
// 5. COMUNICAÇÃO COM A API REST
// =============================================================================
async function carregarTodosOsDados() {
  mostrarCarregando();
  atualizarStatusApi('conectando', 'Conectando à API...');

  try {
    const [resFilmes, resSalas, resSessoes] = await Promise.all([
      fetch(`${state.apiBase}/filmes`),
      fetch(`${state.apiBase}/salas`),
      fetch(`${state.apiBase}/sessoes`)
    ]);

    if (!resFilmes.ok || !resSalas.ok || !resSessoes.ok) {
      throw new Error(`Falha na resposta do servidor (Status: ${resFilmes.status} / ${resSalas.status} / ${resSessoes.status})`);
    }

    const dataFilmes = await resFilmes.json();
    const dataSalas = await resSalas.json();
    const dataSessoes = await resSessoes.json();

    state.filmes = dataFilmes.data || [];
    state.salas = dataSalas.data || [];
    state.sessoes = dataSessoes.data || [];

    atualizarStatusApi('online', 'API Conectada');
    esconderCarregando();

    // Atualiza contadores e estatísticas
    atualizarMetricas();
    atualizarSelectsDeFiltro();

    // Renderiza a aba atual
    trocarAba(state.activeTab);

  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    atualizarStatusApi('error', 'API Desconectada');
    mostrarErro('Falha de Conexão com o Servidor', err.message);
  }
}

function atualizarMetricas() {
  const totalFilmes = state.filmes.length;
  const totalSalas = state.salas.length;
  const totalSessoes = state.sessoes.length;
  const totalAssentosLivres = state.sessoes.reduce((acc, curr) => acc + (curr.assentos_disponiveis || 0), 0);

  // Banner
  dom.statFilmes.textContent = totalFilmes;
  dom.statSalas.textContent = totalSalas;
  dom.statSessoes.textContent = totalSessoes;
  dom.statAssentos.textContent = totalAssentosLivres;

  // Badges nas Abas
  dom.badgeTotalFilmes.textContent = totalFilmes;
  dom.badgeTotalSalas.textContent = totalSalas;
  dom.badgeTotalSessoes.textContent = totalSessoes;
}

function atualizarSelectsDeFiltro() {
  // Filtro de Datas no Catálogo
  const datasUnicas = [...new Set(state.sessoes.map(s => s.data_exibicao))].sort();
  const valorDataAtual = dom.catalogoDateFilter.value;

  dom.catalogoDateFilter.innerHTML = '<option value="all">Todas as Datas</option>';
  datasUnicas.forEach(dataIso => {
    const opt = document.createElement('option');
    opt.value = dataIso;
    opt.textContent = formatarDataPtBr(dataIso);
    dom.catalogoDateFilter.appendChild(opt);
  });
  if (datasUnicas.includes(valorDataAtual)) {
    dom.catalogoDateFilter.value = valorDataAtual;
  }

  // Filtro de Salas no Catálogo
  const valorSalaAtual = dom.catalogoRoomFilter.value;
  dom.catalogoRoomFilter.innerHTML = '<option value="all">Todas as Salas</option>';
  state.salas.forEach(sala => {
    const opt = document.createElement('option');
    opt.value = sala.id;
    opt.textContent = sala.nome;
    dom.catalogoRoomFilter.appendChild(opt);
  });
  if (valorSalaAtual && dom.catalogoRoomFilter.querySelector(`option[value="${valorSalaAtual}"]`)) {
    dom.catalogoRoomFilter.value = valorSalaAtual;
  }

  // Filtros na Aba de Sessões
  dom.sessoesFilterFilme.innerHTML = '<option value="all">Todos os Filmes</option>';
  state.filmes.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.titulo;
    dom.sessoesFilterFilme.appendChild(opt);
  });

  dom.sessoesFilterSala.innerHTML = '<option value="all">Todas as Salas</option>';
  state.salas.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.nome;
    dom.sessoesFilterSala.appendChild(opt);
  });
}

// =============================================================================
// 6. RENDERIZAÇÃO: ABA 1 - CATÁLOGO DE INGRESSOS (CLIENTE)
// =============================================================================
function renderCatalogo() {
  const container = dom.moviesCatalogGrid;
  container.innerHTML = '';

  // Filtra as sessões conforme filtros da aba catálogo
  const sessoesFiltradas = state.sessoes.filter(sessao => {
    const filme = sessao.filmes || state.filmes.find(f => f.id === sessao.filme_id);
    const titulo = filme ? filme.titulo.toLowerCase() : '';

    const matchTitulo = !state.catalogoFilters.search || titulo.includes(state.catalogoFilters.search);
    const matchData = state.catalogoFilters.date === 'all' || sessao.data_exibicao === state.catalogoFilters.date;
    const matchSala = state.catalogoFilters.room === 'all' || sessao.sala_id === state.catalogoFilters.room;

    return matchTitulo && matchData && matchSala;
  });

  if (sessoesFiltradas.length === 0) {
    dom.emptyCatalogo.classList.remove('hidden');
    return;
  }
  dom.emptyCatalogo.classList.add('hidden');

  // Agrupa sessões por Filme
  const filmesMap = new Map();
  sessoesFiltradas.forEach(sessao => {
    const filmeId = sessao.filme_id;
    const filmeObj = sessao.filmes || state.filmes.find(f => f.id === filmeId);
    if (!filmeObj) return;

    if (!filmesMap.has(filmeId)) {
      filmesMap.set(filmeId, {
        filme: filmeObj,
        sessoes: []
      });
    }
    filmesMap.get(filmeId).sessoes.push(sessao);
  });

  filmesMap.forEach(({ filme, sessoes }) => {
    const card = document.createElement('article');
    card.className = 'catalog-card';

    const ageClass = getAgeClass(filme.classificacao_indicativa);

    const posterMarkup = filme.poster_url
      ? `<img src="${escapeHtml(filme.poster_url)}" alt="${escapeHtml(filme.titulo)}" class="catalog-poster" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';">`
      : `<div class="catalog-poster-placeholder"><span>🎞️</span><span>Sem Cartaz</span></div>`;

    // Renderiza a lista de sessões deste filme
    let sessoesMarkup = '';
    sessoes.forEach(sessao => {
      const sala = sessao.salas || state.salas.find(s => s.id === sessao.sala_id);
      const nomeSala = sala ? sala.nome : 'Sala Padrão';
      const horarioFormatado = sessao.horario_inicio ? sessao.horario_inicio.slice(0, 5) : '--:--';
      const precoFormatado = Number(sessao.preco || 32).toFixed(2).replace('.', ',');
      const vagas = sessao.assentos_disponiveis ?? (sala ? sala.capacidade_assentos : 0);
      const isSoldOut = vagas <= 0;

      let seatsClass = '';
      let seatsText = `${vagas} assentos livres`;
      if (isSoldOut) {
        seatsClass = 'empty';
        seatsText = 'Esgotado';
      } else if (vagas <= 10) {
        seatsClass = 'low';
        seatsText = `Restam apenas ${vagas} assentos!`;
      }

      sessoesMarkup += `
        <div class="session-ticket-box ${isSoldOut ? 'sold-out' : ''}">
          <div class="session-meta-info">
            <div class="session-time-row">
              <span class="session-time">${horarioFormatado}</span>
              <span class="session-price">R$ ${precoFormatado}</span>
            </div>
            <span class="session-room-name">${escapeHtml(nomeSala)}</span>
            <span class="session-seats-indicator ${seatsClass}">${seatsText}</span>
          </div>
          <div>
            ${isSoldOut 
              ? `<button class="btn btn-sm btn-secondary" disabled>Esgotado</button>`
              : `<button class="btn btn-sm btn-yellow btn-reservar-ticket" data-sessao-id="${sessao.id}">🎟️ Reservar</button>`
            }
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="catalog-poster-wrap">
        ${posterMarkup}
        <div class="catalog-badge-overlay">
          <span class="age-badge ${ageClass}">${escapeHtml(filme.classificacao_indicativa || 'Livre')}</span>
          <span class="duration-badge">⏱️ ${filme.duracao} min</span>
        </div>
      </div>
      <div class="catalog-body">
        <h3 class="catalog-title">${escapeHtml(filme.titulo)}</h3>
        <p class="catalog-sinopse">${escapeHtml(filme.sinopse || 'Sinopse não cadastrada.')}</p>
        <div class="catalog-sessions-header">
          <span>⏰ Horários Disponíveis</span>
        </div>
        <div class="catalog-sessions-list">
          ${sessoesMarkup}
        </div>
      </div>
    `;

    // Vincula evento no botão de reservar
    card.querySelectorAll('.btn-reservar-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.sessaoId;
        abrirModalReserva(id);
      });
    });

    container.appendChild(card);
  });
}

// =============================================================================
// 7. RENDERIZAÇÃO: ABA 2 - CRUD DE FILMES (ADMIN)
// =============================================================================
function renderFilmes() {
  const container = dom.filmesAdminGrid;
  container.innerHTML = '';

  const filmesFiltrados = state.filmes.filter(f => {
    return !state.filmesFilter || f.titulo.toLowerCase().includes(state.filmesFilter);
  });

  dom.filmesCountText.textContent = `${filmesFiltrados.length} de ${state.filmes.length} filme(s)`;

  if (filmesFiltrados.length === 0) {
    dom.emptyFilmes.classList.remove('hidden');
    return;
  }
  dom.emptyFilmes.classList.add('hidden');

  filmesFiltrados.forEach(filme => {
    const card = document.createElement('div');
    card.className = 'movie-admin-card';

    const ageClass = getAgeClass(filme.classificacao_indicativa);
    const posterSrc = filme.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80';

    card.innerHTML = `
      <div class="movie-admin-top">
        <img src="${escapeHtml(posterSrc)}" alt="${escapeHtml(filme.titulo)}" class="movie-admin-poster" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80';">
        <div class="movie-admin-details">
          <h4 class="movie-admin-title">${escapeHtml(filme.titulo)}</h4>
          <div class="movie-admin-badges">
            <span class="age-badge ${ageClass}">${escapeHtml(filme.classificacao_indicativa || 'Livre')}</span>
            <span class="duration-badge">${filme.duracao} min</span>
          </div>
          <p class="movie-admin-sinopse">${escapeHtml(filme.sinopse || 'Sem descrição cadastrada.')}</p>
        </div>
      </div>
      <div class="movie-admin-footer">
        <button class="btn btn-sm btn-yellow btn-edit-filme" data-id="${filme.id}">
          ✏️ Editar
        </button>
        <button class="btn btn-sm btn-red btn-delete-filme" data-id="${filme.id}" data-titulo="${escapeHtml(filme.titulo)}">
          🗑️ Excluir
        </button>
      </div>
    `;

    // Eventos
    card.querySelector('.btn-edit-filme').addEventListener('click', () => abrirModalFilme(filme));
    card.querySelector('.btn-delete-filme').addEventListener('click', () => {
      pedirConfirmacaoExclusao('filme', filme.id, filme.titulo);
    });

    container.appendChild(card);
  });
}

function abrirModalFilme(filme = null) {
  dom.formFilme.reset();
  if (filme) {
    dom.modalFilmeTitle.textContent = '✏️ Editar Filme';
    dom.filmeId.value = filme.id;
    dom.filmeTitulo.value = filme.titulo;
    dom.filmeDuracao.value = filme.duracao;
    dom.filmeClassificacao.value = filme.classificacao_indicativa || 'Livre';
    dom.filmePosterUrl.value = filme.poster_url || '';
    dom.filmeSinopse.value = filme.sinopse || '';
    atualizarPreviewPoster(filme.poster_url);
  } else {
    dom.modalFilmeTitle.textContent = '🎬 Cadastrar Novo Filme';
    dom.filmeId.value = '';
    dom.filmeClassificacao.value = 'Livre';
    atualizarPreviewPoster('');
  }
  abrirModal(dom.modalFilme);
}

function atualizarPreviewPoster(url) {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    dom.posterPreviewImg.src = url;
    dom.posterPreviewImg.classList.remove('hidden');
    dom.posterPlaceholderText.classList.add('hidden');
  } else {
    dom.posterPreviewImg.src = '';
    dom.posterPreviewImg.classList.add('hidden');
    dom.posterPlaceholderText.classList.remove('hidden');
  }
}

async function salvarFilme(e) {
  e.preventDefault();
  const id = dom.filmeId.value;
  const isEditing = Boolean(id);

  const payload = {
    titulo: dom.filmeTitulo.value.trim(),
    duracao: parseInt(dom.filmeDuracao.value, 10),
    classificacao_indicativa: dom.filmeClassificacao.value,
    poster_url: dom.filmePosterUrl.value.trim() || null,
    sinopse: dom.filmeSinopse.value.trim()
  };

  try {
    const url = isEditing ? `${state.apiBase}/filmes/${id}` : `${state.apiBase}/filmes`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao salvar filme.');
    }

    fecharModal(dom.modalFilme);
    showToast(isEditing ? 'Filme atualizado com sucesso!' : 'Filme cadastrado com sucesso!', 'success');
    await carregarTodosOsDados();
  } catch (err) {
    console.error('Erro ao salvar filme:', err);
    showToast(err.message, 'error');
  }
}

// =============================================================================
// 8. RENDERIZAÇÃO: ABA 3 - CRUD DE SALAS (ADMIN)
// =============================================================================
function renderSalas() {
  const container = dom.salasAdminGrid;
  container.innerHTML = '';

  const salasFiltradas = state.salas.filter(s => {
    return !state.salasFilter || s.nome.toLowerCase().includes(state.salasFilter);
  });

  dom.salasCountText.textContent = `${salasFiltradas.length} de ${state.salas.length} sala(s)`;

  if (salasFiltradas.length === 0) {
    dom.emptySalas.classList.remove('hidden');
    return;
  }
  dom.emptySalas.classList.add('hidden');

  salasFiltradas.forEach(sala => {
    const sessoesDaSala = state.sessoes.filter(s => s.sala_id === sala.id);

    const card = document.createElement('div');
    card.className = 'room-card';

    card.innerHTML = `
      <div class="room-card-header">
        <div>
          <h4 class="room-name">${escapeHtml(sala.nome)}</h4>
          <span class="session-seats-indicator">${sessoesDaSala.length} sessão(ões) vinculada(s)</span>
        </div>
        <div class="room-icon-badge">🏛️</div>
      </div>
      <div class="room-capacity-box">
        <span class="capacity-label">Capacidade Máxima:</span>
        <span class="capacity-number">${sala.capacidade_assentos} poltronas</span>
      </div>
      <div class="room-card-actions">
        <button class="btn btn-sm btn-yellow btn-edit-sala" data-id="${sala.id}">
          ✏️ Editar
        </button>
        <button class="btn btn-sm btn-red btn-delete-sala" data-id="${sala.id}" data-nome="${escapeHtml(sala.nome)}">
          🗑️ Excluir
        </button>
      </div>
    `;

    card.querySelector('.btn-edit-sala').addEventListener('click', () => abrirModalSala(sala));
    card.querySelector('.btn-delete-sala').addEventListener('click', () => {
      pedirConfirmacaoExclusao('sala', sala.id, sala.nome);
    });

    container.appendChild(card);
  });
}

function abrirModalSala(sala = null) {
  dom.formSala.reset();
  if (sala) {
    dom.modalSalaTitle.textContent = '✏️ Editar Sala';
    dom.salaId.value = sala.id;
    dom.salaNome.value = sala.nome;
    dom.salaCapacidade.value = sala.capacidade_assentos;
  } else {
    dom.modalSalaTitle.textContent = '🏛️ Cadastrar Nova Sala';
    dom.salaId.value = '';
    dom.salaCapacidade.value = '100';
  }
  abrirModal(dom.modalSala);
}

async function salvarSala(e) {
  e.preventDefault();
  const id = dom.salaId.value;
  const isEditing = Boolean(id);

  const payload = {
    nome: dom.salaNome.value.trim(),
    capacidade_assentos: parseInt(dom.salaCapacidade.value, 10)
  };

  try {
    const url = isEditing ? `${state.apiBase}/salas/${id}` : `${state.apiBase}/salas`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao salvar sala.');
    }

    fecharModal(dom.modalSala);
    showToast(isEditing ? 'Sala atualizada com sucesso!' : 'Sala criada com sucesso!', 'success');
    await carregarTodosOsDados();
  } catch (err) {
    console.error('Erro ao salvar sala:', err);
    showToast(err.message, 'error');
  }
}

// =============================================================================
// 9. RENDERIZAÇÃO: ABA 4 - CRUD DE SESSÕES (ADMIN)
// =============================================================================
function renderSessoes() {
  const tbody = dom.sessoesTableBody;
  tbody.innerHTML = '';

  const sessoesFiltradas = state.sessoes.filter(sessao => {
    const matchFilme = state.sessoesFilters.filmeId === 'all' || sessao.filme_id === state.sessoesFilters.filmeId;
    const matchSala = state.sessoesFilters.salaId === 'all' || sessao.sala_id === state.sessoesFilters.salaId;
    const matchData = !state.sessoesFilters.date || sessao.data_exibicao === state.sessoesFilters.date;
    return matchFilme && matchSala && matchData;
  });

  if (sessoesFiltradas.length === 0) {
    dom.emptySessoes.classList.remove('hidden');
    return;
  }
  dom.emptySessoes.classList.add('hidden');

  sessoesFiltradas.forEach(sessao => {
    const filme = sessao.filmes || state.filmes.find(f => f.id === sessao.filme_id);
    const sala = sessao.salas || state.salas.find(s => s.id === sessao.sala_id);

    const tituloFilme = filme ? filme.titulo : 'Filme Removido';
    const posterFilme = filme && filme.poster_url ? filme.poster_url : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=80';
    const nomeSala = sala ? sala.nome : 'Sala Removida';
    const capTotal = sala ? sala.capacidade_assentos : (sessao.capacidade_total || 100);
    const vagas = sessao.assentos_disponiveis ?? capTotal;
    const ocupados = Math.max(0, capTotal - vagas);
    const pctOcupado = capTotal > 0 ? Math.round((ocupados / capTotal) * 100) : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="table-movie-info">
          <img src="${escapeHtml(posterFilme)}" alt="" class="table-movie-poster" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=80';">
          <span class="table-movie-title">${escapeHtml(tituloFilme)}</span>
        </div>
      </td>
      <td><span class="table-room-badge">${escapeHtml(nomeSala)}</span></td>
      <td>📅 ${formatarDataPtBr(sessao.data_exibicao)}</td>
      <td><span class="table-time-badge">${sessao.horario_inicio ? sessao.horario_inicio.slice(0, 5) : '--:--'} às ${sessao.horario_termino ? sessao.horario_termino.slice(0, 5) : '--:--'}</span></td>
      <td><span class="table-price">R$ ${Number(sessao.preco || 32).toFixed(2).replace('.', ',')}</span></td>
      <td>
        <div><strong>${vagas}</strong> livres / ${capTotal} vagas (${pctOcupado}% ocupado)</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${pctOcupado > 80 ? 'high' : ''}" style="width: ${pctOcupado}%;"></div>
        </div>
      </td>
      <td class="text-right">
        <div class="table-actions">
          <button class="btn btn-sm btn-yellow btn-edit-sessao" data-id="${sessao.id}">
            ✏️ Editar
          </button>
          <button class="btn btn-sm btn-red btn-delete-sessao" data-id="${sessao.id}">
            🗑️ Cancelar
          </button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-edit-sessao').addEventListener('click', () => abrirModalSessao(sessao));
    tr.querySelector('.btn-delete-sessao').addEventListener('click', () => {
      pedirConfirmacaoExclusao('sessao', sessao.id, `${tituloFilme} (${sessao.horario_inicio ? sessao.horario_inicio.slice(0, 5) : ''})`);
    });

    tbody.appendChild(tr);
  });
}

function abrirModalSessao(sessao = null) {
  dom.formSessao.reset();

  // Popula os selects de Filme e Sala dinamicamente
  dom.sessaoFilmeId.innerHTML = '<option value="">Selecione um filme...</option>';
  state.filmes.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = `${f.titulo} (${f.duracao} min)`;
    dom.sessaoFilmeId.appendChild(opt);
  });

  dom.sessaoSalaId.innerHTML = '<option value="">Selecione uma sala...</option>';
  state.salas.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.nome} (${s.capacidade_assentos} assentos)`;
    dom.sessaoSalaId.appendChild(opt);
  });

  if (sessao) {
    dom.modalSessaoTitle.textContent = '✏️ Editar Sessão';
    dom.sessaoId.value = sessao.id;
    dom.sessaoFilmeId.value = sessao.filme_id;
    dom.sessaoSalaId.value = sessao.sala_id;
    dom.sessaoDataExibicao.value = sessao.data_exibicao;
    dom.sessaoPreco.value = Number(sessao.preco || 32).toFixed(2);
    dom.sessaoHorarioInicio.value = sessao.horario_inicio ? sessao.horario_inicio.slice(0, 5) : '14:00';
    dom.sessaoHorarioTermino.value = sessao.horario_termino ? sessao.horario_termino.slice(0, 5) : '16:30';
    dom.sessaoAssentosDisponiveis.value = sessao.assentos_disponiveis ?? '';
  } else {
    dom.modalSessaoTitle.textContent = '⏰ Agendar Nova Sessão';
    dom.sessaoId.value = '';
    const hoje = new Date().toISOString().split('T')[0];
    dom.sessaoDataExibicao.value = hoje;
    dom.sessaoPreco.value = '32.00';
    dom.sessaoHorarioInicio.value = '15:00';
    dom.sessaoHorarioTermino.value = '17:30';
    dom.sessaoAssentosDisponiveis.value = '';
  }

  abrirModal(dom.modalSessao);
}

async function salvarSessao(e) {
  e.preventDefault();
  const id = dom.sessaoId.value;
  const isEditing = Boolean(id);

  let horarioInicio = dom.sessaoHorarioInicio.value;
  let horarioTermino = dom.sessaoHorarioTermino.value;

  // Garante formato HH:MM:SS
  if (horarioInicio && horarioInicio.length === 5) horarioInicio += ':00';
  if (horarioTermino && horarioTermino.length === 5) horarioTermino += ':00';

  const payload = {
    filme_id: dom.sessaoFilmeId.value,
    sala_id: dom.sessaoSalaId.value,
    data_exibicao: dom.sessaoDataExibicao.value,
    preco: parseFloat(dom.sessaoPreco.value) || 32.0,
    horario_inicio: horarioInicio,
    horario_termino: horarioTermino
  };

  const assentosCustom = dom.sessaoAssentosDisponiveis.value.trim();
  if (assentosCustom !== '') {
    payload.assentos_disponiveis = parseInt(assentosCustom, 10);
  }

  try {
    const url = isEditing ? `${state.apiBase}/sessoes/${id}` : `${state.apiBase}/sessoes`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao agendar sessão.');
    }

    fecharModal(dom.modalSessao);
    showToast(isEditing ? 'Sessão atualizada com sucesso!' : 'Sessão agendada com sucesso!', 'success');
    await carregarTodosOsDados();
  } catch (err) {
    console.error('Erro ao salvar sessão:', err);
    showToast(err.message, 'error');
  }
}

// =============================================================================
// 10. EXCLUSÃO SEGURA DE REGISTROS (MODAL DE CONFIRMAÇÃO)
// =============================================================================
function pedirConfirmacaoExclusao(tipo, id, nome) {
  state.pendingDelete = { tipo, id, nome };

  if (tipo === 'filme') {
    dom.deleteModalTitle.textContent = '🗑️ Excluir Filme';
    dom.deleteModalMessage.innerHTML = `Tem certeza que deseja excluir o filme <strong>"${escapeHtml(nome)}"</strong>?`;
    dom.deleteModalSubMessage.textContent = 'Atenção: Todas as sessões vinculadas a este filme serão removidas automaticamente (ON DELETE CASCADE).';
  } else if (tipo === 'sala') {
    dom.deleteModalTitle.textContent = '🗑️ Excluir Sala';
    dom.deleteModalMessage.innerHTML = `Tem certeza que deseja excluir a sala <strong>"${escapeHtml(nome)}"</strong>?`;
    dom.deleteModalSubMessage.textContent = 'Atenção: As sessões agendadas para esta sala também serão canceladas.';
  } else if (tipo === 'sessao') {
    dom.deleteModalTitle.textContent = '🗑️ Cancelar Sessão';
    dom.deleteModalMessage.innerHTML = `Tem certeza que deseja cancelar a sessão de <strong>"${escapeHtml(nome)}"</strong>?`;
    dom.deleteModalSubMessage.textContent = 'Esta sessão não estará mais disponível para compra de ingressos.';
  }

  abrirModal(dom.modalConfirmDelete);
}

async function executarExclusao() {
  if (!state.pendingDelete) return;

  const { tipo, id, nome } = state.pendingDelete;
  let endpoint = '';
  if (tipo === 'filme') endpoint = `/filmes/${id}`;
  if (tipo === 'sala') endpoint = `/salas/${id}`;
  if (tipo === 'sessao') endpoint = `/sessoes/${id}`;

  try {
    const res = await fetch(`${state.apiBase}${endpoint}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erro ao excluir registro.');
    }

    fecharModal(dom.modalConfirmDelete);
    state.pendingDelete = null;
    showToast(`"${nome}" foi excluído com sucesso!`, 'success');
    await carregarTodosOsDados();
  } catch (err) {
    console.error('Erro na exclusão:', err);
    showToast(err.message, 'error');
  }
}

// =============================================================================
// 11. RESERVA DE INGRESSOS (CATÁLOGO)
// =============================================================================
function abrirModalReserva(sessaoId) {
  const sessao = state.sessoes.find(s => s.id === sessaoId);
  if (!sessao) {
    showToast('Sessão não encontrada.', 'error');
    return;
  }

  state.selectedSession = sessao;
  state.ticketQty = 1;

  renderConteudoModalReserva();
  abrirModal(dom.ticketModal);
}

function renderConteudoModalReserva() {
  const sessao = state.selectedSession;
  if (!sessao) return;

  const filme = sessao.filmes || state.filmes.find(f => f.id === sessao.filme_id);
  const sala = sessao.salas || state.salas.find(s => s.id === sessao.sala_id);

  const tituloFilme = filme ? filme.titulo : 'Filme';
  const nomeSala = sala ? sala.nome : 'Sala';
  const dataFormatada = formatarDataPtBr(sessao.data_exibicao);
  const horario = sessao.horario_inicio ? sessao.horario_inicio.slice(0, 5) : '--:--';
  const precoUnitario = Number(sessao.preco || 32);
  const valorTotal = (precoUnitario * state.ticketQty).toFixed(2).replace('.', ',');
  const vagas = sessao.assentos_disponiveis ?? (sala ? sala.capacidade_assentos : 0);

  dom.ticketModalBody.innerHTML = `
    <div class="ticket-summary-box">
      <h4 class="ticket-movie-title">${escapeHtml(tituloFilme)}</h4>
      <div class="ticket-meta-grid">
        <div class="ticket-meta-item">🏛️ Sala: <strong>${escapeHtml(nomeSala)}</strong></div>
        <div class="ticket-meta-item">📅 Data: <strong>${dataFormatada}</strong></div>
        <div class="ticket-meta-item">⏰ Início: <strong>${horario}</strong></div>
        <div class="ticket-meta-item">🎟️ Preço Unitário: <strong>R$ ${precoUnitario.toFixed(2).replace('.', ',')}</strong></div>
      </div>
    </div>

    <div class="ticket-selector-row">
      <div>
        <label style="font-weight: 700; color: #fff;">Quantidade de Ingressos:</label>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${vagas} assentos livres no momento</div>
      </div>
      <div class="qty-counter">
        <button type="button" class="btn-qty" id="btnQtyMinus" ${state.ticketQty <= 1 ? 'disabled' : ''}>-</button>
        <span class="qty-display">${state.ticketQty}</span>
        <button type="button" class="btn-qty" id="btnQtyPlus" ${state.ticketQty >= Math.min(5, vagas) ? 'disabled' : ''}>+</button>
      </div>
    </div>

    <div class="ticket-total-box">
      <span>Valor Total a Pagar:</span>
      <span class="ticket-total-val">R$ ${valorTotal}</span>
    </div>
  `;

  document.getElementById('btnQtyMinus').addEventListener('click', () => {
    if (state.ticketQty > 1) {
      state.ticketQty--;
      renderConteudoModalReserva();
    }
  });

  document.getElementById('btnQtyPlus').addEventListener('click', () => {
    if (state.ticketQty < Math.min(5, vagas)) {
      state.ticketQty++;
      renderConteudoModalReserva();
    }
  });
}

async function confirmarReserva() {
  if (!state.selectedSession) return;
  const sessao = state.selectedSession;

  try {
    dom.btnConfirmTicket.disabled = true;
    dom.btnConfirmTicket.textContent = 'Processando...';

    const res = await fetch(`${state.apiBase}/sessoes/${sessao.id}/reservar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: state.ticketQty })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Falha ao reservar ingresso.');
    }

    fecharModal(dom.ticketModal);
    showToast(`🎉 Reserva confirmada! ${state.ticketQty} ingresso(s) garantido(s).`, 'success');
    await carregarTodosOsDados();
  } catch (err) {
    console.error('Erro na reserva:', err);
    showToast(err.message, 'error');
  } finally {
    dom.btnConfirmTicket.disabled = false;
    dom.btnConfirmTicket.textContent = 'Confirmar Compra';
  }
}

// =============================================================================
// 12. AUXILIARES & UTILITÁRIOS VISUAIS
// =============================================================================
function abrirModal(modalElement) {
  if (modalElement) modalElement.classList.remove('hidden');
}

function fecharModal(modalElement) {
  if (modalElement) modalElement.classList.add('hidden');
}

function mostrarCarregando() {
  dom.loadingState.classList.remove('hidden');
  dom.errorState.classList.add('hidden');
}

function esconderCarregando() {
  dom.loadingState.classList.add('hidden');
  dom.errorState.classList.add('hidden');
}

function mostrarErro(titulo, desc) {
  dom.loadingState.classList.add('hidden');
  dom.errorState.classList.remove('hidden');
  dom.errorMessageTitle.textContent = titulo;
  dom.errorMessageDesc.textContent = desc;
}

function atualizarStatusApi(status, texto) {
  dom.apiStatusBadge.className = `api-status-badge ${status}`;
  dom.apiStatusText.textContent = texto;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = '✅';
  if (type === 'warning') icon = '⚠️';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

function getAgeClass(indicativa) {
  if (!indicativa) return 'age-livre';
  const str = indicativa.toLowerCase();
  if (str.includes('livre')) return 'age-livre';
  if (str.includes('10')) return 'age-10';
  if (str.includes('12')) return 'age-12';
  if (str.includes('14')) return 'age-14';
  if (str.includes('16')) return 'age-16';
  if (str.includes('18')) return 'age-18';
  return 'age-livre';
}

function formatarDataPtBr(dataIso) {
  if (!dataIso) return '--/--/----';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
