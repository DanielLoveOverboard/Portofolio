# TIMELESS CREATIVE PORTFOLIO

Website portofolio karya kreatif (*3D*, *Photography*, *Painting*, *Sketching*) dengan filosofi desain **Timeless UI v1.0** (monokrom, tipografi Swiss/editorial, minimalis dan fungsional tanpa ornamen tren semu).

Terintegrasi penuh dengan backend cloud gratis **Supabase** (Database Postgres + File Storage) dan sistem keamanan ketat **Row Level Security (RLS)**, serta siap di-deploy secara gratis ke **GitHub Pages**.

---

## Fitur Utama

- **Estetika Timeless UI**:
  - Palet monokrom dua nada murni (Hitam `#000000` dan Putih `#FFFFFF`).
  - *Light / Dark Inversion Mode* instan (tersimpan di `localStorage`).
  - Border fungsional 1px & 2px, radius 0px/2px, tanpa gradien, tanpa shadow palsu, tanpa glassmorphism.
- **Dua Mode Tampilan Responsif (Desktop & Mobile)**:
  - **Desktop**: Galeri editorial multi-kolom, filter kategori instan, live stat counter, dan modal detail split-pane.
  - **Mobile**: Komposisi bertumpuk khusus layar sentuh (min-target 44px), navigasi horizontal swipeable, modal adaptif layar penuh.
- **4 Kategori Karya Utama**:
  1. **3D**: Pemodelan 3D, CGI, procedural geometry, visual effects.
  2. **Photography**: Analog 35mm/medium format, digital street & landscape.
  3. **Painting**: Cat minyak (oil), akrilik, tekstur kanvas.
  4. **Sketching**: Sketsa gestur pensil, arang (charcoal), tinta (ink), concept art.
- **Pencarian Real-Time & Detail Modal**:
  - Filter pencarian instan berdasarkan judul, media/alat yang digunakan, atau tahun pembuatan.
  - Lightbox modal dengan gambar resolusi tinggi, navigasi Prev/Next, dan pintasan keyboard (`Esc`, `←`, `→`).
- **Database & Media Storage Gratis (Supabase)**:
  - Database Postgres gratis untuk menyimpan metadata karya.
  - Bucket Supabase Storage untuk menyimpan file gambar asli hingga 20MB/file.
- **Keamanan Tingkat Tinggi (Row Level Security)**:
  - Publik hanya dapat melihat (*read-only* / `SELECT`).
  - Hanya akun pemilik (*authenticated*) yang dapat mengunggah (`INSERT`), mengedit (`UPDATE`), dan menghapus (`DELETE`).
  - Pendaftaran publik dimatikan (*disabled sign-ups*).
- **Portal Admin Mandiri (`admin.html`)**:
  - Form login khusus pemilik.
  - Drag & Drop file uploader dengan pratinjau gambar instan.
  - Tabel manajemen karya dengan tombol hapus langsung.
- **Data Demo Cadangan (Offline Fallback)**:
  - Dilengkapi data dummy kurasi karya untuk langsung dicoba tanpa harus menunggu akun Supabase aktif.

---

## Panduan Pengaturan & Deployment

Panduan lengkap dari nol (Bahasa Indonesia) dapat dibaca di:
👉 **[PANDUAN_SUPABASE_DAN_DEPLOY.md](./PANDUAN_SUPABASE_DAN_DEPLOY.md)**

### Ringkasan Langkah:
1. Jalankan skrip `supabase_schema.sql` di SQL Editor Supabase.
2. Buat user Admin di Supabase Authentication dan matikan opsi sign-up publik.
3. Masukkan `Project URL` dan `Anon Key` ke dalam file `js/config.js`.
4. Buka `admin.html` untuk login dan upload karya Anda.
5. Push ke GitHub dan aktifkan GitHub Pages di menu *Settings -> Pages*.
