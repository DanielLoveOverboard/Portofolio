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

// Pilih kategori karya dan sinkronkan tombol stat-item dan cat-btn
export function selectCategory(cat) {
  currentCategory = cat || 'ALL';

  // Sinkronkan tombol stat-item (interaktif di mobile & desktop)
  document.querySelectorAll('.stat-item').forEach(b => {
    const isSelected = (b.dataset.category || '').toUpperCase() === currentCategory.toUpperCase();
    b.classList.toggle('active', isSelected);
    b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  // Sinkronkan tab kategori (jika ada di desktop)
  document.querySelectorAll('.cat-btn').forEach(b => {
    const isSelected = (b.dataset.category || '').toUpperCase() === currentCategory.toUpperCase();
    b.classList.toggle('active', isSelected);
    b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  // Perbarui indikator teks filter aktif
  const filterLabel = document.getElementById('filter-active-label');
  if (filterLabel) {
    filterLabel.textContent = currentCategory === 'ALL' ? 'FILTER // ALL WORKS' : `FILTER // ${currentCategory.toUpperCase()}`;
  }

  renderGallery();
}

// Filter karya berdasarkan klik pada tag
export function filterByTag(tag) {
  currentSearch = tag.toLowerCase().trim();
  if (searchInput) searchInput.value = `#${tag}`;
  selectCategory('ALL');

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

  // Perbarui jumlah hasil pada indikator filter
  const filterCount = document.getElementById('filter-active-count');
  if (filterCount) {
    filterCount.textContent = `(${filteredArtworks.length})`;
  }

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
  currentSearch = '';
  if (searchInput) searchInput.value = '';
  selectCategory('ALL');
};

// ==============================================================================
// TAB ROUTER (ABOUT / GALLERY / CONTACT)
// ==============================================================================
export function switchTab(tabName, updateHash = true) {
  const validTabs = ['about', 'gallery', 'contact'];
  const target = validTabs.includes(tabName) ? tabName : 'gallery';

  // Sinkronkan tombol tab navigasi atas
  document.querySelectorAll('.nav-tab-box, .top-tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === target;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Tampilkan/sembunyikan view panes
  const viewAbout = document.getElementById('view-about');
  const viewGallery = document.getElementById('view-gallery');
  const viewContact = document.getElementById('view-contact');

  if (viewAbout) viewAbout.style.display = target === 'about' ? 'block' : 'none';
  if (viewGallery) viewGallery.style.display = target === 'gallery' ? 'block' : 'none';
  if (viewContact) viewContact.style.display = target === 'contact' ? 'block' : 'none';

  // Perbarui hash di address bar (mulus tanpa jump yang canggung)
  if (updateHash) {
    if (window.location.hash !== `#${target}`) {
      window.history.pushState(null, '', `#${target}`);
    }
  }

  // Scroll ke atas halaman saat berpindah tab
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchTab = switchTab;

// Event Listeners
function setupEventListeners() {
  // Toggle Theme
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // 3-Tab Main Navigation Bar (About / Gallery / Contact)
  const navHub = document.getElementById('nav-hub');
  if (navHub) {
    navHub.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-tab-box');
      if (!btn) return;
      const tab = btn.dataset.tab;
      if (tab) {
        switchTab(tab);
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      }
    });
  }

  // About View: Expand / Collapse "LEBIH LENGKAP"
  const aboutExpandBtn = document.getElementById('about-expand-btn');
  const aboutDetailPane = document.getElementById('about-detail-pane');
  const aboutBtnText = document.getElementById('about-btn-text');
  const aboutBtnArrow = document.getElementById('about-btn-arrow');
  if (aboutExpandBtn && aboutDetailPane) {
    aboutExpandBtn.addEventListener('click', () => {
      const isExpanded = aboutDetailPane.classList.toggle('open');
      aboutExpandBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      aboutDetailPane.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
      if (aboutBtnText) aboutBtnText.textContent = isExpanded ? 'TUTUP INFO' : 'LEBIH LENGKAP';
      if (aboutBtnArrow) aboutBtnArrow.textContent = isExpanded ? '↑' : '↓';
    });
  }

  // About View -> Hubungi Saya trigger button
  const aboutContactTrigger = document.getElementById('about-contact-trigger-btn');
  if (aboutContactTrigger) {
    aboutContactTrigger.addEventListener('click', () => switchTab('contact'));
  }

  // Contact View: Salin Alamat Email
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'fachri@example.com';
      try {
        await navigator.clipboard.writeText(email);
        const originalText = copyEmailBtn.textContent;
        copyEmailBtn.textContent = '✓ ALAMAT EMAIL TERSALIN!';
        setTimeout(() => {
          copyEmailBtn.textContent = originalText;
        }, 2500);
      } catch (err) {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  // Filter Kategori via Interactive Stats Bar (Utama di Mobile, sinkron di Desktop)
  const statsBar = document.getElementById('stats-bar');
  if (statsBar) {
    statsBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.stat-item');
      if (!btn) return;
      const cat = btn.dataset.category;
      if (!cat) return;
      selectCategory(cat);
    });
  }

  // Filter Kategori via Tabs (di Desktop)
  if (categoryNav) {
    categoryNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;
      const cat = btn.dataset.category;
      if (!cat) return;
      selectCategory(cat);
    });
  }

  // Pencarian Real-Time
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

  // Browser Popstate & Hash Routing (Dukung tombol Back / Forward browser)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (['about', 'gallery', 'contact'].includes(hash)) {
      switchTab(hash, false);
    }
  });

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

  // Inisialisasi tab berdasarkan URL hash awal (misal #about atau #contact)
  const initialHash = window.location.hash.replace(/^#/, '');
  if (['about', 'gallery', 'contact'].includes(initialHash)) {
    switchTab(initialHash, false);
  } else {
    switchTab('gallery', false);
  }

  // Skeleton loading untuk galeri
  if (galleryGrid) {
    galleryGrid.innerHTML = `
      <div class="timeless-card" style="padding:24px;"><div class="timeless-skeleton" style="height:200px;margin-bottom:12px;"></div><div class="timeless-skeleton" style="width:60%;margin-bottom:8px;"></div><div class="timeless-skeleton" style="width:40%;"></div></div>
      <div class="timeless-card" style="padding:24px;"><div class="timeless-skeleton" style="height:200px;margin-bottom:12px;"></div><div class="timeless-skeleton" style="width:60%;margin-bottom:8px;"></div><div class="timeless-skeleton" style="width:40%;"></div></div>
      <div class="timeless-card" style="padding:24px;"><div class="timeless-skeleton" style="height:200px;margin-bottom:12px;"></div><div class="timeless-skeleton" style="width:60%;margin-bottom:8px;"></div><div class="timeless-skeleton" style="width:40%;"></div></div>
    `;
  }

  // Ambil data karya
  const { data, isLive, error } = await fetchArtworks('ALL');
  allArtworks = data || [];

  updateStats(allArtworks);
  renderGallery();
}

// Jalankan aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', initApp);
