// ==============================================================================
// TIMELESS PORTFOLIO — MAIN APPLICATION CONTROLLER
// Personal Archive: Muh. Fachri Akbar
// ==============================================================================

// Pembersih URL otomatis agar /index.html tidak pernah muncul di address bar
if (typeof window !== 'undefined' && window.location.pathname.endsWith('/index.html')) {
  const cleanPath = window.location.pathname.replace(/\/index\.html$/, '/') + window.location.search + window.location.hash;
  window.history.replaceState(null, '', cleanPath);
}

import { fetchArtworks } from './supabaseClient.js';
import { isSupabaseConfigured } from './config.js';

// State aplikasi
let currentCategory = 'ALL';
let currentSearch = '';
let allArtworks = [];
let filteredArtworks = [];
let activeModalIndex = -1;

// DOM Elements
const galleryGrid = document.getElementById('gallery-grid');
const categoryNav = document.getElementById('category-nav');
const searchInput = document.getElementById('search-input');
const modalBackdrop = document.getElementById('artwork-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalPrevBtn = document.getElementById('modal-prev-btn');
const modalNextBtn = document.getElementById('modal-next-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Sanitizer untuk mencegah XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Inisialisasi tema Light/Dark
function initTheme() {
  const saved = localStorage.getItem('timeless_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = initial;
}

export function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('timeless_theme', next);
}

// Update baris statistik jumlah karya
function updateStats(artworks) {
  const countTotal = artworks.length;
  const count3D = artworks.filter(a => a.category === '3D').length;
  const countPhoto = artworks.filter(a => a.category === 'Photography').length;
  const countPaint = artworks.filter(a => a.category === 'Painting').length;
  const countSketch = artworks.filter(a => a.category === 'Sketching').length;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val).padStart(2, '0');
  };

  setVal('stat-total', countTotal);
  setVal('stat-3d', count3D);
  setVal('stat-photo', countPhoto);
  setVal('stat-paint', countPaint);
  setVal('stat-sketch', countSketch);

  // Update badge tab
  const setTabCount = (cat, count) => {
    const el = document.querySelector(`[data-category="${cat}"] .cat-count`);
    if (el) el.textContent = `(${count})`;
  };
  setTabCount('ALL', countTotal);
  setTabCount('3D', count3D);
  setTabCount('Photography', countPhoto);
  setTabCount('Painting', countPaint);
  setTabCount('Sketching', countSketch);
}

// Filter karya berdasarkan klik pada tag
export function filterByTag(tag) {
  currentCategory = 'ALL';
  currentSearch = tag.toLowerCase().trim();
  if (searchInput) searchInput.value = `#${tag}`;

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'ALL');
  });

  renderGallery();
  
  // Scroll ke galeri jika di mobile
  if (galleryGrid) {
    galleryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Render kartu-kartu karya di galeri
function renderGallery() {
  if (!galleryGrid) return;

  // Filter berdasarkan pencarian & kategori
  filteredArtworks = allArtworks.filter(item => {
    const matchCat = currentCategory === 'ALL' || item.category.toLowerCase() === currentCategory.toLowerCase();
    if (!matchCat) return false;

    if (!currentSearch) return true;
    const cleanQ = currentSearch.toLowerCase().replace(/^#/, '').trim();
    
    const titleMatch = item.title && item.title.toLowerCase().includes(cleanQ);
    const mediumMatch = item.medium && item.medium.toLowerCase().includes(cleanQ);
    const descMatch = item.description && item.description.toLowerCase().includes(cleanQ);
    const tagsMatch = item.tags && item.tags.toLowerCase().includes(cleanQ);
    const yearMatch = item.year && item.year.includes(cleanQ);

    return titleMatch || mediumMatch || descMatch || tagsMatch || yearMatch;
  });

  if (filteredArtworks.length === 0) {
    galleryGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3 class="empty-state-title">TIDAK ADA KARYA DITEMUKAN</h3>
        <p class="timeless-muted">Tidak ada karya yang cocok dengan pencarian "${escapeHtml(currentSearch)}".</p>
        <button class="timeless-btn" style="margin-top:16px;" onclick="resetFilters()">RESET FILTER</button>
      </div>
    `;
    return;
  }

  galleryGrid.innerHTML = filteredArtworks.map((item, index) => {
    const yearStr = item.year ? escapeHtml(item.year) : '—';
    const catStr = escapeHtml(item.category);
    const titleStr = escapeHtml(item.title);
    const mediumStr = escapeHtml(item.medium || 'Various Media');
    
    // Parse tags
    const tagsList = (item.tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const tagsHtml = tagsList.length > 0
      ? `<div class="art-tags">${tagsList.slice(0, 3).map(t => `<span class="art-tag-item">#${escapeHtml(t)}</span>`).join(' ')}</div>`
      : '';

    return `
      <article 
        class="art-card" 
        tabindex="0" 
        role="button" 
        aria-label="Lihat detail ${titleStr}"
        data-index="${index}"
      >
        <div class="art-media-wrap">
          <img 
            src="${escapeHtml(item.image_url)}" 
            alt="${titleStr}" 
            class="art-img" 
            loading="lazy"
            onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\' viewBox=\\'0 0 400 300\\'><rect fill=\\'%23111\\' width=\\'400\\' height=\\'300\\'/><text fill=\\'%23fff\\' x=\\'50%\\' y=\\'50%\\' text-anchor=\\'middle\\' font-family=\\'monospace\\' font-size=\\'14\\'>IMAGE NOT FOUND</text></svg>';"
          />
        </div>
        <div class="art-meta">
          <div class="art-meta-header">
            <span class="timeless-kicker">${catStr}</span>
            <span class="timeless-mono">${yearStr}</span>
          </div>
          <h3 class="art-title">${titleStr}</h3>
          <p class="art-medium" title="${mediumStr}">${mediumStr}</p>
          ${tagsHtml}
          <div class="art-footer">
            <span class="timeless-muted">DETAIL VIEW</span>
            <span>→</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach event listener ke setiap card
  galleryGrid.querySelectorAll('.art-card').forEach(card => {
    const idx = parseInt(card.dataset.index, 10);
    const openHandler = () => openModal(idx);

    card.addEventListener('click', openHandler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openHandler();
      }
    });
  });
}

// Modal Detail Karya
function openModal(index) {
  if (!filteredArtworks[index]) return;
  activeModalIndex = index;
  const item = filteredArtworks[index];

  document.getElementById('modal-art-img').src = item.image_url;
  document.getElementById('modal-art-img').alt = item.title;
  document.getElementById('modal-art-title').textContent = item.title;
  document.getElementById('modal-art-cat').textContent = item.category;
  document.getElementById('modal-art-year').textContent = item.year || '—';
  document.getElementById('modal-art-medium').textContent = item.medium || '—';
  document.getElementById('modal-art-desc').textContent = item.description || 'Tidak ada catatan tambahan.';
  
  // Render tags di modal
  const tagsContainer = document.getElementById('modal-art-tags');
  if (tagsContainer) {
    const tagsList = (item.tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (tagsList.length > 0) {
      tagsContainer.innerHTML = tagsList.map(t => `
        <button class="modal-tag-chip" type="button" data-tag="${escapeHtml(t)}">
          #${escapeHtml(t)}
        </button>
      `).join('');

      tagsContainer.querySelectorAll('.modal-tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const t = chip.dataset.tag;
          closeModal();
          filterByTag(t);
        });
      });
    } else {
      tagsContainer.innerHTML = `<span class="timeless-muted" style="font-size:12px;">—</span>`;
    }
  }

  const linkFull = document.getElementById('modal-art-link');
  if (linkFull) {
    linkFull.href = item.image_url;
  }

  // Update counter posisi modal (misal: 01 / 12)
  const posEl = document.getElementById('modal-art-pos');
  if (posEl) {
    posEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(filteredArtworks.length).padStart(2, '0')}`;
  }

  modalBackdrop.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.style.display = 'none';
  document.body.style.overflow = '';
  activeModalIndex = -1;
}

function nextModal() {
  if (activeModalIndex < filteredArtworks.length - 1) {
    openModal(activeModalIndex + 1);
  } else {
    openModal(0);
  }
}

function prevModal() {
  if (activeModalIndex > 0) {
    openModal(activeModalIndex - 1);
  } else {
    openModal(filteredArtworks.length - 1);
  }
}

// Reset filters
window.resetFilters = function() {
  currentCategory = 'ALL';
  currentSearch = '';
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'ALL');
  });

  renderGallery();
};

// Event Listeners
function setupEventListeners() {
  // Toggle Theme
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Filter Kategori
  if (categoryNav) {
    categoryNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;
      
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentCategory = btn.dataset.category;
      renderGallery();
    });
  }

  // Pencarian
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        renderGallery();
      }, 150);
    });
  }

  // Modal actions
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalNextBtn) modalNextBtn.addEventListener('click', nextModal);
  if (modalPrevBtn) modalPrevBtn.addEventListener('click', prevModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Keyboard navigation & Secret Admin Shortcut (Alt + A)
  window.addEventListener('keydown', (e) => {
    // Pintu masuk rahasia Admin untuk Muh. Fachri Akbar: Alt + A
    if (e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      window.location.href = './admin.html';
      return;
    }

    if (modalBackdrop && modalBackdrop.style.display === 'flex') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextModal();
      if (e.key === 'ArrowLeft') prevModal();
    }
  });
}

// Main load routine
async function initApp() {
  initTheme();
  setupEventListeners();

  // Skeleton loading
  if (galleryGrid) {
    galleryGrid.innerHTML = `
      <div class="timeless-card" style="padding:24px;"><div class="timeless-skeleton" style="height:200px;margin-bottom:12px;"></div><div class="timeless-skeleton" style="width:60%;margin-bottom:8px;"></div><div class="timeless-skeleton" style="width:40%;"></div></div>
      <div class="timeless-card" style="padding:24px;"><div class="timeless-skeleton" style="height:200px;margin-bottom:12px;"></div><div class="timeless-skeleton" style="width:60%;margin-bottom:8px;"></div><div class="timeless-skeleton" style="width:40%;"></div></div>
      <div class="timeless-card" style="padding:24px;"><div class="timeless-skeleton" style="height:200px;margin-bottom:12px;"></div><div class="timeless-skeleton" style="width:60%;margin-bottom:8px;"></div><div class="timeless-skeleton" style="width:40%;"></div></div>
    `;
  }

  // Ambil data
  const { data, isLive, error } = await fetchArtworks('ALL');
  allArtworks = data || [];

  updateStats(allArtworks);
  renderGallery();
}

// Jalankan aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', initApp);
