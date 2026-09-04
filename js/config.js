// ==============================================================================
// TIMELESS PORTFOLIO — SUPABASE CONFIGURATION
// ==============================================================================
// Masukkan kredensial Supabase Anda di sini setelah membuat project di supabase.com.
// Panduan lengkap cara mendapatkan URL & Anon Key ada di: PANDUAN_SUPABASE_DAN_DEPLOY.md
//
// CATATAN KEAMANAN:
// 1. Kunci 'anonKey' (public key) AMAN diletakkan di sini karena dilindungi RLS database.
// 2. JANGAN PERNAH memasukkan 'service_role key' di sini!
// ==============================================================================

export const SUPABASE_CONFIG = {
  // Contoh: 'https://abcdefghijklmnopq.supabase.co'
  url: 'https://uytedcoadyshicqghkhq.supabase.co',

  // Contoh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGVkY29hZHlzaGljcWdoa2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MjMyNzAsImV4cCI6MjEwNDA5OTI3MH0.K84wOQWr7fM3fUVtnO3gRjQGugMGCDWWwacfS4cRyPc',
};

/**
 * Mengecek apakah kredensial Supabase sudah terisi dan valid
 */
export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.anonKey &&
    SUPABASE_CONFIG.url.startsWith('https://') &&
    SUPABASE_CONFIG.anonKey.length > 20
  );
}
