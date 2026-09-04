-- ==============================================================================
-- TIMELESS PORTFOLIO — SUPABASE DATABASE & STORAGE SCHEMA
-- Author: Muh. Fachri Akbar
-- ==============================================================================
-- Skrip ini menyiapkan database dan penyimpanan file untuk portofolio karya kreatif.
-- Cara pakai:
-- 1. Buka dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih project Anda -> Masuk ke menu "SQL Editor" di bilah kiri
-- 3. Klik "New query", paste seluruh isi skrip ini, lalu klik "Run" (atau Ctrl+Enter)
-- ==============================================================================

-- 1. BUAT TABEL ARTWORKS
CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('3D', 'Photography', 'Painting', 'Sketching', 'Other')),
    year TEXT DEFAULT '',
    medium TEXT DEFAULT '',
    tags TEXT DEFAULT '', -- Tag karya, dipisahkan koma (misal: "cyberpunk, blender, neon")
    description TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    storage_path TEXT DEFAULT '',
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tambahkan kolom tags jika tabel sudah terlanjur dibuat sebelumnya
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='tags') THEN
        ALTER TABLE public.artworks ADD COLUMN tags TEXT DEFAULT '';
    END IF;
END $$;

-- Indeks untuk mempercepat query filtering kategori dan sorting tanggal
CREATE INDEX IF NOT EXISTS idx_artworks_category ON public.artworks (category);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks (created_at DESC);

-- ==============================================================================
-- 2. KEAMANAN: ROW LEVEL SECURITY (RLS) PADA TABEL ARTWORKS
-- ==============================================================================
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view artworks" ON public.artworks;
DROP POLICY IF EXISTS "Authenticated users can insert artworks" ON public.artworks;
DROP POLICY IF EXISTS "Authenticated users can update artworks" ON public.artworks;
DROP POLICY IF EXISTS "Authenticated users can delete artworks" ON public.artworks;

-- A. PUBLIK: Hanya dapat MELIHAT karya (SELECT)
CREATE POLICY "Public can view artworks" 
ON public.artworks 
FOR SELECT 
TO anon, authenticated
USING (true);

-- B. PEMILIK (MUH. FACHRI AKBAR): Hanya akun terotentikasi yang bisa MENAMBAH karya
CREATE POLICY "Authenticated users can insert artworks" 
ON public.artworks 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- C. PEMILIK: Hanya akun terotentikasi yang bisa MENGUBAH karya
CREATE POLICY "Authenticated users can update artworks" 
ON public.artworks 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- D. PEMILIK: Hanya akun terotentikasi yang bisa MENGHAPUS karya
CREATE POLICY "Authenticated users can delete artworks" 
ON public.artworks 
FOR DELETE 
TO authenticated 
USING (true);

-- ==============================================================================
-- 3. STORAGE BUCKET UNTUK GAMBAR KARYA ('portfolio-media')
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolio-media', 
    'portfolio-media', 
    true, 
    20971520, -- Maks. 20MB per gambar
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio media" ON storage.objects;

CREATE POLICY "Public can read portfolio media"
ON storage.objects 
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Authenticated users can upload portfolio media"
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Authenticated users can update portfolio media"
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Authenticated users can delete portfolio media"
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'portfolio-media');
