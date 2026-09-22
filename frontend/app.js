/**
 * CineTimber - Frontend Application (Vanilla JS)
 * Consumo da API REST e renderização dinâmica do catálogo de filmes e sessões.
 */

// 1. Configuração e Estado Global
const DEFAULT_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

const state = {
  apiBase: localStorage.getItem('cinetimber_api_url') || DEFAULT_API_BASE,
  filmes: [],
  salas: [],
  sessoes: [],
  selectedSession: null,
  reservationQty: 1,
  filters: {
    search: '',
    date: 'all',
    room: 'all'
  }
};

// 2. Elementos DOM
const dom = {
  apiStatusBadge: document.getElementById('apiStatusBadge'),
  apiStatusText: document.getElementById('apiStatusText'),
  btnSettings: document.getElementById('btnSettings'),
  settingsModal: document.getElementById('settingsModal'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),
  apiUrlInput: document.getElementById('apiUrlInput'),
  btnSaveApi: document.getElementById('btnSaveApi'),
  btnResetApi: document.getElementById('btnResetApi'),

  statFilmes: document.getElementById('statFilmes'),
  statSessoes: document.getElementById('statSessoes'),
  statSalas: document.getElementById('statSalas'),

  searchInput: document.getElementById('searchInput'),
  dateFilter: document.getElementById('dateFilter'),
  roomFilter: document.getElementById('roomFilter'),
  btnRefresh: document.getElementById('btnRefresh'),
  btnClearFilters: document.getElementById('btnClearFilters'),

  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  errorMessageTitle: document.getElementById('errorMessageTitle'),
  errorMessageDesc: document.getElementById('errorMessageDesc'),
  btnRetry: document.getElementById('btnRetry'),
  emptyState: document.getElementById('emptyState'),
  moviesGrid: document.getElementById('moviesGrid'),

  ticketModal: document.getElementById('ticketModal'),
  ticketModalTitle: document.getElementById('ticketModalTitle'),
  ticketModalBody: document.getElementById('ticketModalBody'),
  btnCloseTicket: document.getElementById('btnCloseTicket'),
  btnCancelTicket: document.getElementById('btnCancelTicket'),
  btnConfirmTicket: document.getElementById('btnConfirmTicket'),

  toastContainer: document.getElementById('toastContainer')
};

// 3. Inicialização
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  dom.apiUrlInput.value = state.apiBase;
  carregarDados();
});

// 4. Configuração de Eventos
function setupEventListeners() {
  // Modal de Configuração da API
  dom.btnSettings.addEventListener('click', () => {
    dom.apiUrlInput.value = state.apiBase;
    dom.settingsModal.classList.remove('hidden');
  });

  dom.btnCloseSettings.addEventListener('click', () => {
    dom.settingsModal.classList.add('hidden');
  });

  dom.btnResetApi.addEventListener('click', () => {
    dom.apiUrlInput.value = DEFAULT_API_BASE;
  });

  dom.btnSaveApi.addEventListener('click', () => {
    const novaUrl = dom.apiUrlInput.value.trim().replace(/\/$/, '');
    if (novaUrl) {
      state.apiBase = novaUrl;
      localStorage.setItem('cinetimber_api_url', novaUrl);
      dom.settingsModal.classList.add('hidden');
      showToast('URL da API atualizada com sucesso!', 'success');
      carregarDados();
    }
  });

  // Filtros
  dom.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value.toLowerCase().trim();
    aplicarFiltrosERenderizar();
  });

  dom.dateFilter.addEventListener('change', (e) => {
    state.filters.date = e.target.value;
    aplicarFiltrosERenderizar();
  });

  dom.roomFilter.addEventListener('change', (e) => {
    state.filters.room = e.target.value;
    aplicarFiltrosERenderizar();
  });

  dom.btnRefresh.addEventListener('click', () => carregarDados());
  dom.btnRetry.addEventListener('click', () => carregarDados());

  dom.btnClearFilters.addEventListener('click', () => {
    state.filters.search = '';
    state.filters.date = 'all';
    state.filters.room = 'all';
    dom.searchInput.value = '';
    dom.dateFilter.value = 'all';
    dom.roomFilter.value = 'all';
    aplicarFiltrosERenderizar();
  });

  // Modal de Reserva
  dom.btnCloseTicket.addEventListener('click', fecharModalReserva);
  dom.btnCancelTicket.addEventListener('click', fecharModalReserva);
  dom.btnConfirmTicket.addEventListener('click', confirmarReserva);

  // Fechar modals com clique fora
  [dom.settingsModal, dom.ticketModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });
}

// 5. Comunicação com a API
async function carregarDados() {
  mostrarCarregando();
  atualizarStatusApi('conectando', 'Conectando à API...');

  try {
    // Busca concorrente de sessões, filmes e salas
    const [resSessoes, resFilmes, resSalas] = await Promise.all([
      fetch(`${state.apiBase}/sessoes`),
      fetch(`${state.apiBase}/filmes`),
      fetch(`${state.apiBase}/salas`)
    ]);

    if (!resSessoes.ok || !resFilmes.ok || !resSalas.ok) {
      throw new Error(`Falha nas respostas da API: ${resSessoes.status}, ${resFilmes.status}`);
    }

    const dataSessoes = await resSessoes.json();
    const dataFilmes = await resFilmes.json();
    const dataSalas = await resSalas.json();

    state.sessoes = dataSessoes.data || [];
    state.filmes = dataFilmes.data || [];
    state.salas = dataSalas.data || [];

    atualizarStatusApi('online', 'API Conectada');
    atualizarEstatisticas();
    popularFiltros();
    aplicarFiltrosERenderizar();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    atualizarStatusApi('offline', 'API Offline');
    mostrarErro('Falha de Conexão', `Não foi possível carregar os dados de "${state.apiBase}". Verifique se o servidor backend está em execução.`);
  }
}

// 6. Atualização de Métricas e Filtros
function atualizarEstatisticas() {
  dom.statFilmes.textContent = state.filmes.length;
  dom.statSessoes.textContent = state.sessoes.length;
  dom.statSalas.textContent = state.salas.length;
}

function popularFiltros() {
  // Datas únicas extraídas das sessões
  const datas = [...new Set(state.sessoes.map(s => s.data_exibicao))].sort();
  const valorDataAtual = dom.dateFilter.value;

  dom.dateFilter.innerHTML = '<option value="all">Todas as Datas</option>';
  datas.forEach(dataIso => {
    const option = document.createElement('option');
    option.value = dataIso;
    option.textContent = formatarDataLegivel(dataIso);
    dom.dateFilter.appendChild(option);
  });
  if (datas.includes(valorDataAtual)) {
    dom.dateFilter.value = valorDataAtual;
  }

  // Salas únicas
  const valorSalaAtual = dom.roomFilter.value;
  dom.roomFilter.innerHTML = '<option value="all">Todas as Salas</option>';
  state.salas.forEach(sala => {
    const option = document.createElement('option');
    option.value = sala.id;
    option.textContent = sala.nome;
    dom.roomFilter.appendChild(option);
  });
  if (state.salas.some(s => s.id === valorSalaAtual)) {
    dom.roomFilter.value = valorSalaAtual;
  }
}

// 7. Filtragem e Renderização
function aplicarFiltrosERenderizar() {
  // Filtra as sessões com base nos critérios selecionados
  const sessoesFiltradas = state.sessoes.filter(sessao => {
    // Filtro por Data
    if (state.filters.date !== 'all' && sessao.data_exibicao !== state.filters.date) {
      return false;
    }
    // Filtro por Sala
    if (state.filters.room !== 'all' && sessao.sala_id !== state.filters.room) {
      return false;
    }
    // Filtro por Busca de Título
    if (state.filters.search) {
      const tituloFilme = sessao.filmes ? sessao.filmes.titulo.toLowerCase() : '';
      if (!tituloFilme.includes(state.filters.search)) {
        return false;
      }
    }
    return true;
  });

  // Agrupa sessões por Filme
  const mapaFilmesSessoes = new Map();

  // Garante que filmes que correspondam à busca apareçam mesmo se não houver filtro restritivo de sessões
  state.filmes.forEach(filme => {
    if (!state.filters.search || filme.titulo.toLowerCase().includes(state.filters.search)) {
      mapaFilmesSessoes.set(filme.id, {
        filme,
        sessoes: []
      });
    }
  });

  // Aloca as sessões filtradas aos filmes
  sessoesFiltradas.forEach(sessao => {
    const entrada = mapaFilmesSessoes.get(sessao.filme_id);
    if (entrada) {
      entrada.sessoes.push(sessao);
    } else if (sessao.filmes) {
      mapaFilmesSessoes.set(sessao.filme_id, {
        filme: sessao.filmes,
        sessoes: [sessao]
      });
    }
  });

  // Se houver filtros de data ou sala ativos, exibe apenas filmes que tenham sessões correspondentes
  let filmesParaRenderizar = Array.from(mapaFilmesSessoes.values());
  if (state.filters.date !== 'all' || state.filters.room !== 'all') {
    filmesParaRenderizar = filmesParaRenderizar.filter(item => item.sessoes.length > 0);
  }

  // Renderiza no DOM
  esconderEstados();

  if (filmesParaRenderizar.length === 0) {
    dom.emptyState.classList.remove('hidden');
    dom.moviesGrid.innerHTML = '';
    return;
  }

  dom.moviesGrid.innerHTML = filmesParaRenderizar.map(item => criarCardFilmeHTML(item.filme, item.sessoes)).join('');

  // Atribui listeners para os botões de reserva de cada sessão
  document.querySelectorAll('.btn-reserve').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sessaoId = e.currentTarget.dataset.sessaoId;
      abrirModalReserva(sessaoId);
    });
  });
}

// 8. Templates HTML de Componentes
function criarCardFilmeHTML(filme, sessoes) {
  const classeRating = obterClasseClassificacao(filme.classificacao_indicativa);
  const duracaoFormatada = formatarDuracao(filme.duracao);
  const poster = filme.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';

  let sessoesHtml = '';
  if (sessoes && sessoes.length > 0) {
    sessoesHtml = `
      <div class="movie-sessions-container">
        <h4 class="sessions-title">🎟️ Horários e Salas Disponíveis (${sessoes.length})</h4>
        <div class="sessions-list">
          ${sessoes.map(sessao => criarItemSessaoHTML(sessao)).join('')}
        </div>
      </div>
    `;
  } else {
    sessoesHtml = `
      <div class="movie-sessions-container">
        <p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
          Nenhuma sessão programada para os filtros selecionados.
        </p>
      </div>
    `;
  }

  return `
    <article class="movie-card">
      <div class="movie-poster-wrapper">
        <img 
          src="${escapeHtml(poster)}" 
          alt="Pôster do filme ${escapeHtml(filme.titulo)}" 
          class="movie-poster"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'"
        >
        <span class="movie-rating-badge ${classeRating}">${escapeHtml(filme.classificacao_indicativa || 'Livre')}</span>
      </div>

      <div class="movie-details">
        <div class="movie-header">
          <div class="movie-meta-chips">
            <span class="meta-chip">⏱️ ${duracaoFormatada}</span>
            <span class="meta-chip">🎬 Em Cartaz</span>
          </div>
          <h3 class="movie-title">${escapeHtml(filme.titulo)}</h3>
          <p class="movie-synopsis">${escapeHtml(filme.sinopse || 'Sinopse não informada.')}</p>
        </div>

        ${sessoesHtml}
      </div>
    </article>
  `;
}

function criarItemSessaoHTML(sessao) {
  const nomeSala = sessao.salas ? sessao.salas.nome : 'Sala Principal';
  const capacidadeTotal = sessao.capacidade_total || (sessao.salas ? sessao.salas.capacidade_assentos : 0);
  const percentual = sessao.percentual_ocupacao || 0;
  const esgotado = sessao.assentos_disponiveis <= 0;

  let classePreenchimento = '';
  if (percentual >= 85) classePreenchimento = 'critical';
  else if (percentual >= 60) classePreenchimento = 'high';

  return `
    <div class="session-item ${esgotado ? 'sold-out' : ''}">
      <div class="session-top">
        <span class="session-room">${escapeHtml(nomeSala)}</span>
        <span class="session-date">${formatarDataLegivel(sessao.data_exibicao)}</span>
      </div>

      <div class="session-time">
        ${sessao.horario_inicio.substring(0, 5)} 
        <span class="session-time-end">até ${sessao.horario_termino.substring(0, 5)}</span>
      </div>

      <div class="session-occupancy">
        <div class="occupancy-info">
          <span>${esgotado ? '⚠️ Esgotado' : `${sessao.assentos_disponiveis} assentos livres`}</span>
          <span>${capacidadeTotal > 0 ? `${percentual}% ocupado` : ''}</span>
        </div>
        <div class="occupancy-bar">
          <div class="occupancy-fill ${classePreenchimento}" style="width: ${percentual}%"></div>
        </div>
      </div>

      <div class="session-action">
        <button 
          class="btn btn-primary btn-reserve" 
          data-sessao-id="${sessao.id}"
          ${esgotado ? 'disabled' : ''}
        >
          ${esgotado ? 'Esgotado' : `Garantir Ingresso &bull; R$ ${Number(sessao.preco || 32).toFixed(2)}`}
        </button>
      </div>
    </div>
  `;
}

// 9. Lógica de Reserva Interativa
function abrirModalReserva(sessaoId) {
  const sessao = state.sessoes.find(s => s.id === sessaoId);
  if (!sessao) return;

  state.selectedSession = sessao;
  state.reservationQty = 1;

  const nomeFilme = sessao.filmes ? sessao.filmes.titulo : 'Filme';
  const nomeSala = sessao.salas ? sessao.salas.nome : 'Sala';
  const precoUnitario = Number(sessao.preco || 32);

  dom.ticketModalTitle.textContent = `🎟️ Reservar: ${nomeFilme}`;
  dom.ticketModalBody.innerHTML = `
    <div class="ticket-summary">
      <div class="ticket-row">
        <span class="label">Sessão:</span>
        <span class="val">${sessao.horario_inicio.substring(0, 5)} (${formatarDataLegivel(sessao.data_exibicao)})</span>
      </div>
      <div class="ticket-row">
        <span class="label">Sala:</span>
        <span class="val">${escapeHtml(nomeSala)}</span>
      </div>
      <div class="ticket-row">
        <span class="label">Vagas Disponíveis:</span>
        <span class="val" id="modalVagasDisponiveis">${sessao.assentos_disponiveis}</span>
      </div>
      <div class="ticket-row">
        <span class="label">Valor Unitário:</span>
        <span class="val">R$ ${precoUnitario.toFixed(2)}</span>
      </div>
    </div>

    <label>Quantidade de Ingressos:</label>
    <div class="seat-stepper">
      <button class="btn-step" id="btnMinusQty">-</button>
      <span class="step-qty" id="qtyDisplay">1</span>
      <button class="btn-step" id="btnPlusQty">+</button>
    </div>

    <div style="margin-top: 18px; text-align: right; font-weight: 700; font-size: 1.1rem; color: var(--accent-gold);">
      Total: R$ <span id="modalTotalValor">${precoUnitario.toFixed(2)}</span>
    </div>
  `;

  // Handlers do Stepper
  document.getElementById('btnMinusQty').addEventListener('click', () => {
    if (state.reservationQty > 1) {
      state.reservationQty--;
      atualizarValoresModal(precoUnitario, sessao.assentos_disponiveis);
    }
  });

  document.getElementById('btnPlusQty').addEventListener('click', () => {
    if (state.reservationQty < sessao.assentos_disponiveis) {
      state.reservationQty++;
      atualizarValoresModal(precoUnitario, sessao.assentos_disponiveis);
    } else {
      showToast('Limite de vagas disponíveis atingido.', 'error');
    }
  });

  dom.ticketModal.classList.remove('hidden');
}

function atualizarValoresModal(precoUnitario, limiteVagas) {
  document.getElementById('qtyDisplay').textContent = state.reservationQty;
  document.getElementById('modalTotalValor').textContent = (state.reservationQty * precoUnitario).toFixed(2);
}

function fecharModalReserva() {
  dom.ticketModal.classList.add('hidden');
  state.selectedSession = null;
}

async function confirmarReserva() {
  if (!state.selectedSession) return;

  dom.btnConfirmTicket.disabled = true;
  dom.btnConfirmTicket.textContent = 'Processando...';

  try {
    const res = await fetch(`${state.apiBase}/sessoes/${state.selectedSession.id}/reservar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: state.reservationQty })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Erro ao processar reserva.');
    }

    fecharModalReserva();
    showToast(`✅ ${state.reservationQty} ingresso(s) reservado(s) com sucesso! Bom filme!`, 'success');

    // Recarrega dados para atualizar contadores e barras de lotação
    await carregarDados();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  } finally {
    dom.btnConfirmTicket.disabled = false;
    dom.btnConfirmTicket.textContent = 'Confirmar Reserva';
  }
}

// 10. Funções Utilitárias e Formatação
function formatarDataLegivel(dataIso) {
  if (!dataIso) return '';
  const hojeIso = new Date().toISOString().split('T')[0];
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const amanhaIso = amanha.toISOString().split('T')[0];

  if (dataIso === hojeIso) return 'Hoje';
  if (dataIso === amanhaIso) return 'Amanhã';

  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDuracao(minutos) {
  if (!minutos || isNaN(minutos)) return '-';
  const horas = Math.floor(minutos / 60);
  const restoMin = minutos % 60;
  return `${minutos} min (${horas}h ${restoMin.toString().padStart(2, '0')}m)`;
}

function obterClasseClassificacao(classificacao) {
  const limpa = String(classificacao || '').toLowerCase();
  if (limpa.includes('livre')) return 'rating-livre';
  if (limpa.includes('10')) return 'rating-10';
  if (limpa.includes('12')) return 'rating-12';
  if (limpa.includes('14')) return 'rating-14';
  if (limpa.includes('16')) return 'rating-16';
  if (limpa.includes('18')) return 'rating-18';
  return 'rating-livre';
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

function mostrarCarregando() {
  esconderEstados();
  dom.loadingState.classList.remove('hidden');
}

function mostrarErro(titulo, desc) {
  esconderEstados();
  dom.errorMessageTitle.textContent = titulo;
  dom.errorMessageDesc.textContent = desc;
  dom.errorState.classList.remove('hidden');
}

function esconderEstados() {
  dom.loadingState.classList.add('hidden');
  dom.errorState.classList.add('hidden');
  dom.emptyState.classList.add('hidden');
}

function atualizarStatusApi(status, texto) {
  dom.apiStatusBadge.className = `api-status-badge ${status}`;
  dom.apiStatusText.textContent = texto;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
