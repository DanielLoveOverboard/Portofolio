// ==============================================================================
// TIMELESS PORTFOLIO — MOCK DATA (MUH. FACHRI AKBAR)
// ==============================================================================

export const MOCK_ARTWORKS = [
  // --- 3D WORKS ---
  {
    id: "demo-3d-01",
    title: "Brutalist Monolith 04",
    category: "3D",
    year: "2026",
    medium: "Blender 4.2 / Cycles",
    tags: "brutalist, architecture, concrete, 3d, procedural",
    description: "Eksplorasi bentuk arsitektur brutalist prosedural dengan pencahayaan satu arah berkontras tinggi.",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    featured: true,
    created_at: "2026-08-20T00:00:00Z"
  },
  {
    id: "demo-3d-02",
    title: "Kinetic Tension III",
    category: "3D",
    year: "2026",
    medium: "Cinema 4D / Octane",
    tags: "sculpture, metallic, physics, kinetic, 3d",
    description: "Simulasi fisik keseimbangan antara logam padat dan kabel elastis.",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    created_at: "2026-07-15T00:00:00Z"
  },
  {
    id: "demo-3d-03",
    title: "Anatomical Void",
    category: "3D",
    year: "2025",
    medium: "ZBrush / Houdini",
    tags: "anatomy, wireframe, digital, dark, 3d",
    description: "Studi dekonstruksi bentuk tengkorak manusia ke dalam topologi kawat presisi digital.",
    image_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    created_at: "2025-11-12T00:00:00Z"
  },

  // --- PHOTOGRAPHY WORKS ---
  {
    id: "demo-photo-01",
    title: "Shibuya Rain — Frame 14",
    category: "Photography",
    year: "2026",
    medium: "Leica M6 / Ilford HP5+ 400",
    tags: "street, analog, blackandwhite, rain, 35mm",
    description: "Fotografi jalanan analog di persimpangan jalan malam hari saat hujan lebat.",
    image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80",
    featured: true,
    created_at: "2026-08-01T00:00:00Z"
  },
  {
    id: "demo-photo-02",
    title: "Concrete Geometry IX",
    category: "Photography",
    year: "2025",
    medium: "Hasselblad 500C/M / Tri-X 400",
    tags: "minimal, architecture, shadow, geometry, mediumformat",
    description: "Komposisi sudut tajam fasad gedung apartemen modernis dengan ritme bayangan tajam.",
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    created_at: "2025-10-05T00:00:00Z"
  },
  {
    id: "demo-photo-03",
    title: "Solitary Horizon",
    category: "Photography",
    year: "2025",
    medium: "Sony A7R V / 24-70mm",
    tags: "landscape, sea, fog, silence, monochrome",
    description: "Pemandangan pesisir berkabut tebal di musim dingin. Ruang tenang nan meditatif.",
    image_url: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    created_at: "2025-06-18T00:00:00Z"
  },

  // --- PAINTING WORKS ---
  {
    id: "demo-paint-01",
    title: "Residual Silence",
    category: "Painting",
    year: "2026",
    medium: "Oil on Raw Belgian Linen",
    tags: "oilpainting, abstract, texture, linen, monochrome",
    description: "Karya lukis ekspresif monokromatik dengan tumpukan pigmen jelaga hitam dan titanium putih.",
    image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1400&q=80",
    featured: true,
    created_at: "2026-07-28T00:00:00Z"
  },
  {
    id: "demo-paint-02",
    title: "Fractured Horizon II",
    category: "Painting",
    year: "2025",
    medium: "Acrylic and Gesso on Wood",
    tags: "acrylic, woodpanel, texture, minimal, gestural",
    description: "Goresan garis horizontal yang dipotong oleh retakan gesso tebal di atas bidang kayu.",
    image_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    created_at: "2025-09-14T00:00:00Z"
  },

  // --- SKETCHING WORKS ---
  {
    id: "demo-sketch-01",
    title: "Gestural Study of Hands No. 7",
    category: "Sketching",
    year: "2026",
    medium: "Charcoal & Chalk on Kraft Paper",
    tags: "charcoal, gesture, anatomy, study, hands",
    description: "Sketsa gestur cepat mempelajari pergerakan buku-buku jari dan otot tangan.",
    image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=80",
    featured: true,
    created_at: "2026-08-15T00:00:00Z"
  },
  {
    id: "demo-sketch-02",
    title: "Industrial Rig Concept",
    category: "Sketching",
    year: "2026",
    medium: "Pencil & Ink on Arches 300gsm",
    tags: "conceptart, industrial, mechanical, ink, drawing",
    description: "Sketsa konsep mekanisme sambungan hidrolik industri futuristik.",
    image_url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    created_at: "2026-06-22T00:00:00Z"
  },
  {
    id: "demo-sketch-03",
    title: "Draped Fabric Study in Graphite",
    category: "Sketching",
    year: "2025",
    medium: "Graphite on Bristol Smooth",
    tags: "graphite, fabric, shadow, shading, drapery",
    description: "Eksplorasi jatuhnya lipatan kain sutra di atas balok kubus.",
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1400&q=80",
    featured: false,
    created_at: "2025-04-10T00:00:00Z"
  }
];

if (typeof window !== 'undefined') {
  window.MOCK_ARTWORKS = MOCK_ARTWORKS;
}
