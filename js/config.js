// ==============================================================================
// TIMELESS PORTFOLIO — SUPABASE CONFIGURATION
// Author: Muh. Fachri Akbar
// ==============================================================================

// KREDENSIAL DEFAULT PROYEK
// Anda dapat mengisinya di sini, atau memasukkannya langsung via formulir di admin.html
const HARDCODED_CONFIG = {
  url: 'https://uytedcoadyshicqghkhq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dGVkY29hZHlzaGljcWdoa2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MjMyNzAsImV4cCI6MjEwNDA5OTI3MH0.K84wOQWr7fM3fUVtnO3gRjQGugMGCDWWwacfS4cRyPc',
};

// Ambil kredensial dari browser localStorage jika pernah dimasukkan via web
function getStoredValue(key) {
  try {
    return typeof localStorage !== 'undefined' ? (localStorage.getItem(key) || '') : '';
  } catch (e) {
    return '';
  }
}

const localUrl = getStoredValue('timeless_supabase_url');
const localKey = getStoredValue('timeless_supabase_key');

// Sanitasi URL (membersihkan spasi, trailing slash, dan memastikan diawali https://)
function sanitizeUrl(rawUrl) {
  if (!rawUrl) return '';
  let u = String(rawUrl).trim();
  if (u && !u.startsWith('http://') && !u.startsWith('https://')) {
    u = 'https://' + u;
  }
  return u.replace(/\/+$/, '');
}

function sanitizeKey(rawKey) {
  if (!rawKey) return '';
  return String(rawKey).trim();
}

export const SUPABASE_CONFIG = {
  url: sanitizeUrl(HARDCODED_CONFIG.url) || sanitizeUrl(localUrl),
  anonKey: sanitizeKey(HARDCODED_CONFIG.anonKey) || sanitizeKey(localKey),
};

export function isSupabaseConfigured() {
  const cfg = getCleanConfig();
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    cfg.url.startsWith('https://') &&
    cfg.anonKey.length > 20
  );
}

export function getCleanConfig() {
  const u = sanitizeUrl(SUPABASE_CONFIG.url || (typeof window !== 'undefined' && window.SUPABASE_CONFIG?.url));
  const k = sanitizeKey(SUPABASE_CONFIG.anonKey || (typeof window !== 'undefined' && window.SUPABASE_CONFIG?.anonKey));
  return { url: u, anonKey: k };
}

if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.isSupabaseConfigured = isSupabaseConfigured;
  window.getCleanConfig = getCleanConfig;
}
