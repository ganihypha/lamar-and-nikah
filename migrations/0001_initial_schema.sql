-- Lamarr & Nikkah Planner - Initial Schema

-- Checklist items (persiapan sebelum menikah)
CREATE TABLE IF NOT EXISTS checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- legal, keuangan, acara, keluarga, mental
  title TEXT NOT NULL,
  description TEXT,
  pic TEXT,                         -- Person in charge (suggested role)
  target_time TEXT,                 -- e.g. "H-6 bulan"
  priority TEXT DEFAULT 'sedang',   -- tinggi, sedang, rendah
  is_done INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Budget items (pos pengeluaran lamaran & nikah)
CREATE TABLE IF NOT EXISTS budget_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket TEXT NOT NULL,             -- lamaran, nikah, akad, cadangan, lainnya
  item_name TEXT NOT NULL,
  estimated_min INTEGER DEFAULT 0,  -- Rupiah
  estimated_max INTEGER DEFAULT 0,
  actual_amount INTEGER DEFAULT 0,
  scenario TEXT DEFAULT 'menengah', -- hemat, menengah, premium
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Timeline tasks (6 bulan sebelum acara)
CREATE TABLE IF NOT EXISTS timeline_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phase TEXT NOT NULL,              -- H-6bulan, H-5bulan, dst
  phase_order INTEGER NOT NULL,
  task TEXT NOT NULL,
  owner TEXT,                       -- pasangan, keluarga, vendor, wo
  is_done INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Adat Jawa stages (edukasi alur lamaran)
CREATE TABLE IF NOT EXISTS adat_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  description TEXT NOT NULL,
  modern_equivalent TEXT
);

-- User budget plan (estimasi custom dari kalkulator)
CREATE TABLE IF NOT EXISTS budget_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_name TEXT NOT NULL,
  guest_count INTEGER DEFAULT 200,
  scenario TEXT DEFAULT 'menengah',
  venue_type TEXT DEFAULT 'gedung', -- rumah, gedung
  akad_location TEXT DEFAULT 'kua', -- kua, luar_kua
  total_estimate INTEGER DEFAULT 0,
  reserve_pct INTEGER DEFAULT 15,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_checklist_category ON checklist_items(category);
CREATE INDEX IF NOT EXISTS idx_budget_bucket ON budget_items(bucket);
CREATE INDEX IF NOT EXISTS idx_timeline_phase ON timeline_tasks(phase_order);
CREATE INDEX IF NOT EXISTS idx_adat_order ON adat_stages(stage_order);
