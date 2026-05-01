/* ── State ──────────────────────────────────────────────────────────── */
let allMachines  = [];
let selectedIds  = new Set();
let currentCat   = 'all';
let searchTerm   = '';

const WA_PHONE = '59167758038';  // (+591) 6775-8038 — Bolivia

/* ── Bootstrap ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadMachines();
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderGrid();
  });
});

/* ── API calls ──────────────────────────────────────────────────────── */
async function loadMachines() {
  try {
    const res  = await fetch('/api/machines');
    const data = await res.json();
    allMachines = data.machines;
    renderGrid();
  } catch (err) {
    document.getElementById('catalog-grid').innerHTML =
      '<div class="loading-state">Error al cargar el catálogo. Intente de nuevo.</div>';
  }
}

function waLink(machine) {
  const msg = encodeURIComponent(
    `Hola, me interesa la máquina: *${machine.name}* (${machine.generic}). ¿Podría brindarme más información y precio?`
  );
  return `https://wa.me/${WA_PHONE}?text=${msg}`;
}

/* ── Render ──────────────────────────────────────────────────────────── */
function renderGrid() {
  const grid = document.getElementById('catalog-grid');
  const noResults = document.getElementById('no-results');

  let list = allMachines.filter(m => !m.destaque);
  if (currentCat !== 'all') list = list.filter(m => m.category === currentCat);
  if (searchTerm) {
    list = list.filter(m =>
      m.name.toLowerCase().includes(searchTerm) ||
      m.generic.toLowerCase().includes(searchTerm) ||
      m.tags.some(t => t.toLowerCase().includes(searchTerm))
    );
  }

  if (list.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';
  grid.innerHTML = list.map(m => cardHTML(m)).join('');

  // Clique no card → página de detalhe
  grid.querySelectorAll('.machine-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Se clicou no botão de selecionar ou no link WA, não redireciona
      if (e.target.closest('.card-check') || e.target.closest('.card-wa')) return;
      window.location.href = `/machine/${card.dataset.id}`;
    });
  });

  // Clique no check → selecionar
  grid.querySelectorAll('.card-check').forEach(chk => {
    chk.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSelect(parseInt(chk.closest('.machine-card').dataset.id));
    });
  });

  updateSelCount();
}

function cardHTML(m) {
  const sel = selectedIds.has(m.id);
  const bgStyle = `background: ${m.color}18;`;
  const checkMark = sel ? '✓' : '';
  const selClass  = sel ? ' selected' : '';
  const tag = m.tags[0] ? m.tags[0].toUpperCase() : '';

  return `
  <div class="machine-card${selClass}" data-id="${m.id}" data-cat="${m.category}" style="cursor:pointer;">
    <div class="card-img" style="${m.imagen ? '' : bgStyle}">
      ${m.imagen ? `<img src="${m.imagen}" alt="${m.name}" style="width:100%;height:100%;object-fit:cover;object-position:center;">` : `<span class="card-icon">${m.icon}</span>`}
      <span class="card-num">${m.id}</span>
      <span class="card-tag">${tag}</span>
      <div class="card-check">${checkMark}</div>
    </div>
    <div class="card-body">
      <div class="card-title">${m.name}</div>
      <div class="card-subtitle">${m.generic}</div>
      <div class="card-desc">${m.desc}</div>
    </div>
    <div class="card-foot">
      <a class="card-wa" href="${waLink(m)}" target="_blank" onclick="event.stopPropagation()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Consultar vía WhatsApp
      </a>
      <span class="card-detail">Ver detalles →</span>
    </div>
  </div>`;
}

/* ── Selection ───────────────────────────────────────────────────────── */
function toggleSelect(id) {
  selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id);
  renderGrid();
}

function updateSelCount() {
  const n   = selectedIds.size;
  const cnt = document.getElementById('sel-count');
  const btn = document.getElementById('print-sel-btn');
  cnt.textContent = n > 0 ? `${n} seleccionada${n !== 1 ? 's' : ''}` : '';
  btn.style.display = n > 0 ? 'inline-block' : 'none';
}

/* ── Filter ──────────────────────────────────────────────────────────── */
function filterBy(cat, btn) {
  currentCat = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGrid();
}

/* ── Print selected ──────────────────────────────────────────────────── */
function printSelected() {
  const toHide = [];
  document.querySelectorAll('.machine-card').forEach(card => {
    if (!selectedIds.has(parseInt(card.dataset.id))) {
      card.style.display = 'none';
      toHide.push(card);
    }
  });
  window.print();
  toHide.forEach(c => (c.style.display = ''));
}
