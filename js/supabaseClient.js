// ==============================================================================
// TIMELESS PORTFOLIO — SUPABASE CLIENT & DATA ACCESS LAYER
// Author: Muh. Fachri Akbar
// ==============================================================================
import { SUPABASE_CONFIG, isSupabaseConfigured, getCleanConfig } from './config.js';
import { MOCK_ARTWORKS } from './mockData.js';

let supabase = null;

/**
 * Mendapatkan atau menginisialisasi instance Supabase Client
 */
export async function getClient() {
  if (supabase) return supabase;
  if (!isSupabaseConfigured()) return null;

  const { url, anonKey } = getCleanConfig();

  try {
    // 1. Coba gunakan library vendor lokal (js/vendor/supabase.js) atau CDN global
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      supabase = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return supabase;
    }

    // 2. Fallback ke import ESM jika script tag belum siap
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabase;
  } catch (err) {
    console.error('Gagal menginisialisasi Supabase Client:', err);
    return null;
  }
}

/**
 * Mengambil daftar karya dari Supabase atau Mock Data
 */
export async function fetchArtworks(category = 'ALL') {
  const client = await getClient();

  // Jika Supabase belum dikonfigurasi, gunakan Mock Data
  if (!client) {
    let list = [...(window.MOCK_ARTWORKS || MOCK_ARTWORKS)];
    if (category && category.toUpperCase() !== 'ALL') {
      list = list.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    return { data: list, isLive: false, error: null };
  }

  try {
    let query = client
      .from('artworks')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category && category.toUpperCase() !== 'ALL') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { data: data || [], isLive: true, error: null };
  } catch (err) {
    console.error('Error query Supabase:', err);
    let list = [...(window.MOCK_ARTWORKS || MOCK_ARTWORKS)];
    if (category && category.toUpperCase() !== 'ALL') {
      list = list.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    return { data: list, isLive: false, error: err.message };
  }
}

/**
 * Upload gambar karya ke Supabase Storage (bucket: 'portfolio-media')
 */
export async function uploadArtworkImage(file) {
  const client = await getClient();
  if (!client) throw new Error('Koneksi Supabase belum aktif.');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format file tidak didukung. Harap upload gambar (JPG, PNG, WebP, GIF, SVG).');
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error('Ukuran file melebihi batas 20MB.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `artworks/${Date.now()}_${cleanName}`;

  const { error: uploadError } = await client.storage
    .from('portfolio-media')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Gagal upload ke storage: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = client.storage
    .from('portfolio-media')
    .getPublicUrl(storagePath);

  return { publicUrl, storagePath };
}

/**
 * Menambahkan karya baru ke tabel 'artworks'
 */
export async function insertArtwork(artwork) {
  const client = await getClient();
  if (!client) throw new Error('Koneksi Supabase belum aktif.');

  const { data, error } = await client
    .from('artworks')
    .insert([
      {
        title: artwork.title.trim(),
        category: artwork.category,
        year: artwork.year?.trim() || '',
        medium: artwork.medium?.trim() || '',
        tags: artwork.tags?.trim() || '',
        description: artwork.description?.trim() || '',
        image_url: artwork.image_url,
        storage_path: artwork.storage_path || '',
        featured: Boolean(artwork.featured)
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Menghapus karya dari tabel 'artworks' dan file terkait di Storage
 */
export async function deleteArtwork(id, storagePath) {
  const client = await getClient();
  if (!client) throw new Error('Koneksi Supabase belum aktif.');

  const { error: dbError } = await client
    .from('artworks')
    .delete()
    .eq('id', id);

  if (dbError) throw dbError;

  if (storagePath) {
    try {
      await client.storage.from('portfolio-media').remove([storagePath]);
    } catch (storageErr) {
      console.warn('File fisik storage mungkin sudah terhapus:', storageErr);
    }
  }

  return true;
}

/**
 * Autentikasi Pemilik / Admin
 */
export async function signInAdmin(email, password) {
  const client = await getClient();
  if (!client) {
    const { url, anonKey } = getCleanConfig();
    if (!url || !anonKey) {
      throw new Error('Kredensial Supabase (URL / Anon Key) belum terisi.');
    }
    throw new Error('Supabase SDK tidak dapat diinisialisasi.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: password
  });

  if (error) throw error;
  return data;
}

export async function signOutAdmin() {
  const client = await getClient();
  if (!client) return;
  await client.auth.signOut();
}

export async function getAdminSession() {
  const client = await getClient();
  if (!client) return null;
  const { data: { session } } = await client.auth.getSession();
  return session;
}

// Global reference
if (typeof window !== 'undefined') {
  window.SupabaseApp = {
    getClient,
    fetchArtworks,
    uploadArtworkImage,
    insertArtwork,
    deleteArtwork,
    signInAdmin,
    signOutAdmin,
    getAdminSession
  };
}
