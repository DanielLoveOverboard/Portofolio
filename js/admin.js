// ==============================================================================
// TIMELESS PORTFOLIO — ADMIN DASHBOARD CONTROLLER
// ==============================================================================
import { 
  signInAdmin, 
  signOutAdmin, 
  getAdminSession, 
  fetchArtworks, 
  uploadArtworkImage, 
  insertArtwork, 
  deleteArtwork 
} from './supabaseClient.js';
import { isSupabaseConfigured } from './config.js';

// DOM Elements
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const uploadForm = document.getElementById('upload-form');
const logoutBtn = document.getElementById('admin-logout-btn');
const themeBtn = document.getElementById('admin-theme-btn');
const statusBadge = document.getElementById('admin-status-badge');
const unconfiguredWarning = document.getElementById('unconfigured-warning');
const feedbackBox = document.getElementById('admin-feedback');
const feedbackText = document.getElementById('feedback-text');
const userEmailDisplay = document.getElementById('user-email-display');
const artworksTableBody = document.getElementById('artworks-table-body');
const worksCount = document.getElementById('admin-works-count');
const refreshListBtn = document.getElementById('refresh-list-btn');

// Dropzone elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const dropzonePrompt = document.getElementById('dropzone-prompt');

let selectedFile = null;

// Sanitizer XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Inisialisasi Tema
function initTheme() {
  const saved = localStorage.getItem('timeless_theme') || 'light';
  document.documentElement.dataset.theme = saved;
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('timeless_theme', next);
}

// Tampilkan Pesan Feedback Timeless
function showFeedback(message, isError = false) {
  if (!feedbackBox || !feedbackText) return;
  feedbackText.textContent = isError ? `ERROR — ${message}` : `DONE — ${message}`;
  feedbackBox.style.display = 'block';
  feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => {
    feedbackBox.style.display = 'none';
  }, 6000);
}

// Refresh Daftar Karya di Tabel Admin
async function loadArtworksTable() {
  if (!artworksTableBody) return;
  artworksTableBody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center;padding:24px;" class="timeless-muted">
        Memperbarui daftar karya...
      </td>
    </tr>
  `;

  const { data, isLive, error } = await fetchArtworks('ALL');

  if (error) {
    artworksTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:24px;font-weight:700;">
          ERROR — Gagal mengambil data: ${escapeHtml(error)}
        </td>
      </tr>
    `;
    return;
  }

  const list = data || [];
  if (worksCount) worksCount.textContent = list.length;

  if (list.length === 0) {
    artworksTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:32px;" class="timeless-muted">
          Belum ada karya yang diunggah. Gunakan form di sebelah kiri untuk menambah karya pertama Anda.
        </td>
      </tr>
    `;
    return;
  }

  artworksTableBody.innerHTML = list.map(item => {
    const isMock = String(item.id).startsWith('demo-');
    return `
      <tr data-id="${item.id}" data-storage="${escapeHtml(item.storage_path || '')}">
        <td style="vertical-align:middle;">
          <img 
            src="${escapeHtml(item.image_url)}" 
            alt="" 
            style="width:48px;height:48px;object-fit:cover;border:1px solid var(--timeless-border);display:block;" 
          />
        </td>
        <td>
          <strong style="display:block;font-size:14px;">${escapeHtml(item.title)}</strong>
          <span class="timeless-kicker" style="font-size:11px;">${escapeHtml(item.category)}</span>
          ${item.tags ? `<div class="timeless-mono" style="font-size:10px;opacity:0.65;margin-top:3px;">Tags: ${escapeHtml(item.tags)}</div>` : ''}
        </td>
        <td>
          <div style="font-size:13px;">${escapeHtml(item.medium || '—')}</div>
          <span class="timeless-mono" style="font-size:11px;opacity:0.72;">${escapeHtml(item.year || '—')}</span>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          ${isMock 
            ? `<span class="timeless-badge" style="font-size:10px;">DEMO DATA</span>` 
            : `<button class="timeless-btn delete-btn" data-id="${item.id}" data-storage="${escapeHtml(item.storage_path || '')}" style="min-height:32px;padding:0 8px;font-size:11px;">HAPUS [✕]</button>`
          }
        </td>
      </tr>
    `;
  }).join('');

  // Pasang event delete ke tombol
  artworksTableBody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      const storagePath = btn.dataset.storage;
      
      const confirmDelete = window.confirm('Yakin ingin menghapus karya ini secara permanen dari database dan storage?');
      if (!confirmDelete) return;

      btn.disabled = true;
      btn.textContent = 'MENGHAPUS...';

      try {
        await deleteArtwork(id, storagePath);
        showFeedback('Karya berhasil dihapus secara permanen.');
        loadArtworksTable();
      } catch (err) {
        showFeedback(err.message, true);
        btn.disabled = false;
        btn.textContent = 'HAPUS [✕]';
      }
    });
  });
}

// Cek Status Autentikasi Saat Halaman Dimuat
async function checkAuthSession() {
  initTheme();

  // Cek apakah Supabase sudah dikonfigurasi
  const loginConnStatus = document.getElementById('login-conn-status');
  const loginConnDetail = document.getElementById('login-conn-detail');
  const configured = isSupabaseConfigured();

  if (!configured) {
    if (unconfiguredWarning) unconfiguredWarning.style.display = 'block';
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="status-dot" style="opacity:0.3"></span> BELUM TERHUBUNG`;
    }
    if (loginConnStatus) loginConnStatus.textContent = 'BELUM AKTIF';
    if (loginConnDetail) loginConnDetail.textContent = 'Kredensial belum terdeteksi. Gunakan form di atas untuk menghubungkan.';
    // Tampilkan form login sebagai mock
    if (loginView) loginView.style.display = 'block';
    if (dashboardView) dashboardView.style.display = 'none';
    return;
  }

  const cleanCfg = typeof getCleanConfig === 'function' ? getCleanConfig() : (window.getCleanConfig ? window.getCleanConfig() : { url: '' });
  if (unconfiguredWarning) unconfiguredWarning.style.display = 'none';
  if (loginConnStatus) loginConnStatus.textContent = 'SIAP / TERHUBUNG';
  if (loginConnDetail) loginConnDetail.textContent = 'Target: ' + (cleanCfg.url || 'Supabase');

  try {
    const session = await getAdminSession();
    if (session && session.user) {
      // User sudah login
      if (statusBadge) statusBadge.innerHTML = `<span class="status-dot"></span> ADMIN ACTIVE`;
      if (loginView) loginView.style.display = 'none';
      if (dashboardView) dashboardView.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (userEmailDisplay) userEmailDisplay.textContent = session.user.email;
      loadArtworksTable();
    } else {
      // User belum login
      if (statusBadge) statusBadge.innerHTML = `<span class="status-dot"></span> LOGIN REQUIRED`;
      if (loginView) loginView.style.display = 'block';
      if (dashboardView) dashboardView.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  } catch (err) {
    console.error('Session error:', err);
    if (loginView) loginView.style.display = 'block';
  }
}

// Setup Event Listeners
function setupAdminEvents() {
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Quick Config Form (jika user memasukkan kredensial langsung lewat browser)
  const quickForm = document.getElementById('quick-config-form');
  if (quickForm) {
    const urlInput = document.getElementById('quick-supabase-url');
    const keyInput = document.getElementById('quick-supabase-key');
    if (urlInput && localStorage.getItem('timeless_supabase_url')) {
      urlInput.value = localStorage.getItem('timeless_supabase_url');
    }
    if (keyInput && localStorage.getItem('timeless_supabase_key')) {
      keyInput.value = localStorage.getItem('timeless_supabase_key');
    }

    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputUrl = document.getElementById('quick-supabase-url').value.trim();
      const inputKey = document.getElementById('quick-supabase-key').value.trim();

      if (!inputUrl.startsWith('https://') || inputKey.length < 20) {
        showFeedback('URL harus diawali https:// dan Anon Key harus valid.', true);
        return;
      }

      localStorage.setItem('timeless_supabase_url', inputUrl);
      localStorage.setItem('timeless_supabase_key', inputKey);
      SUPABASE_CONFIG.url = inputUrl;
      SUPABASE_CONFIG.anonKey = inputKey;

      showFeedback('Kredensial Supabase berhasil disimpan! Menghubungkan...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    });
  }

  // Form Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = document.getElementById('login-submit-btn');

      if (!isSupabaseConfigured()) {
        showFeedback('Kredensial Supabase belum diisi. Gunakan form di atas untuk memasukkan URL & Anon Key.', true);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'MEMVERIFIKASI...';

      try {
        await signInAdmin(email, password);
        showFeedback('Login berhasil!');
        checkAuthSession();
      } catch (err) {
        let msg = err.message || '';
        if (msg.toLowerCase().includes('invalid login credentials')) {
          msg = 'Email atau password salah. Pastikan Anda sudah membuat akun ini di Supabase Dashboard (Menu: Authentication -> Users -> Add user).';
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          msg = 'Email belum dikonfirmasi. Di Supabase Dashboard (Authentication -> Users), centang opsi "Auto Confirm User".';
        }
        showFeedback(`Login gagal: ${msg}`, true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'MASUK KE DASHBOARD →';
      }
    });
  }

  // Tombol Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOutAdmin();
      showFeedback('Anda telah berhasil logout.');
      checkAuthSession();
    });
  }

  // Refresh Table
  if (refreshListBtn) {
    refreshListBtn.addEventListener('click', () => {
      loadArtworksTable();
    });
  }

  // Dropzone drag & drop
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  // Handle selected file
  function handleFileSelection(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      showFeedback('Hanya file gambar (JPG, PNG, WebP, GIF, SVG) yang diperbolehkan.', true);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showFeedback('Ukuran file melebihi 20MB.', true);
      return;
    }

    selectedFile = file;

    // Pratinjau gambar
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
      dropzonePrompt.innerHTML = `<strong>${escapeHtml(file.name)}</strong> (${(file.size / (1024 * 1024)).toFixed(2)} MB)<div class="timeless-muted" style="font-size:11px;">Klik untuk mengganti gambar</div>`;
    };
    reader.readAsDataURL(file);
  }

  // Form Upload Submit
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!selectedFile) {
        showFeedback('Harap pilih gambar karya terlebih dahulu.', true);
        return;
      }

      const title = document.getElementById('art-title').value.trim();
      const category = document.getElementById('art-category').value;
      const year = document.getElementById('art-year').value.trim();
      const medium = document.getElementById('art-medium').value.trim();
      const tags = document.getElementById('art-tags') ? document.getElementById('art-tags').value.trim() : '';
      const description = document.getElementById('art-desc').value.trim();
      const submitBtn = document.getElementById('upload-submit-btn');

      if (!title) {
        showFeedback('Judul karya wajib diisi.', true);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'MENGUNGGAH GAMBAR KE STORAGE...';

      try {
        // Step 1: Upload file ke Supabase Storage
        const { publicUrl, storagePath } = await uploadArtworkImage(selectedFile);

        submitBtn.textContent = 'MENYIMPAN DATA KARYA KE DATABASE...';

        // Step 2: Simpan record ke tabel 'artworks'
        await insertArtwork({
          title,
          category,
          year,
          medium,
          tags,
          description,
          image_url: publicUrl,
          storage_path: storagePath
        });

        // Sukses!
        showFeedback(`Karya "${title}" berhasil diunggah dan dipublikasikan!`);
        
        // Reset form & state
        uploadForm.reset();
        selectedFile = null;
        imagePreview.style.display = 'none';
        dropzonePrompt.innerHTML = `<strong>KLIK ATAU SERET GAMBAR KE SINI</strong><div class="timeless-muted" style="font-size:12px;margin-top:4px;">Mendukung: JPG, PNG, WebP, GIF, SVG</div>`;

        // Refresh tabel
        loadArtworksTable();

      } catch (err) {
        showFeedback(`Gagal mengunggah karya: ${err.message}`, true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'PUBLISH KARYA KE PORTOFOLIO →';
      }
    });
  }
}

// Jalankan inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  setupAdminEvents();
  checkAuthSession();
});
