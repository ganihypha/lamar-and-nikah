# Lamarr & Nikkah Planner

## Project Overview
- **Name**: Lamarr & Nikkah Planner
- **Goal**: Aplikasi deep research persiapan lamaran & pernikahan — kalkulator biaya, checklist pra-nikah, alur lamaran adat Jawa, timeline persiapan 6 bulan.
- **Features**:
  1. **Dashboard Persiapan** — Ringkasan progress checklist, estimasi biaya, timeline tasks, info akad KUA
  2. **Kalkulator Biaya** — 3 skenario (Hemat / Menengah / Premium) dengan input dinamis: jumlah tamu, venue, lokasi akad, dana cadangan
  3. **Checklist Interaktif Pra-Nikah** — 26 item dalam 5 kategori (Legal, Keuangan, Acara, Keluarga, Mental)
  4. **Alur Lamaran Adat Jawa** — 4 tahap edukatif: Congkong → Salar → Nontoni → Ngelamar + padanan modern
  5. **Timeline 6 Bulan** — 33 task dari H-6 bulan s/d H-1 hari, dikelompokkan per fase

## URLs
- **Production**: https://lamarr-nikkah-planner.pages.dev
- **Branch preview**: https://a971505a.lamarr-nikkah-planner.pages.dev
- **GitHub**: https://github.com/ganihypha/lamar-and-nikah
- **API Health**: https://lamarr-nikkah-planner.pages.dev/api/health

## Functional Entry URIs

### Frontend
- `GET /` — Halaman utama aplikasi (dashboard + semua fitur, SPA-style dengan anchor)

### API — Checklist
- `GET /api/checklist` — Ambil semua checklist items (optional query: `?category=legal|keuangan|acara|keluarga|mental`)
- `GET /api/checklist/stats` — Statistik progress per kategori
- `POST /api/checklist` — Tambah item baru (body: `{category, title, description?, pic?, target_time?, priority?}`)
- `POST /api/checklist/:id/toggle` — Toggle status selesai
- `DELETE /api/checklist/:id` — Hapus item

### API — Budget
- `GET /api/budget` — Ambil semua budget items (optional: `?bucket=lamaran|nikah|akad&scenario=hemat|menengah|premium`)
- `POST /api/budget/calculate` — Hitung estimasi dinamis (body: `{scenario, guest_count, venue_type, akad_location, reserve_pct}`)
- `POST /api/budget` — Tambah item budget
- `PUT /api/budget/:id` — Update actual amount & notes
- `DELETE /api/budget/:id` — Hapus item
- `POST /api/budget/plan` — Simpan budget plan
- `GET /api/budget/plans` — List semua saved plans

### API — Timeline
- `GET /api/timeline` — Ambil 33 task timeline (grouped per fase H-6 bulan s/d H-1 hari)
- `POST /api/timeline/:id/toggle` — Toggle status selesai

### API — Adat
- `GET /api/adat` — Ambil 4 tahap adat Jawa + padanan modern

### API — Health
- `GET /api/health` — Health check endpoint

## Data Architecture

### Data Models (Cloudflare D1 SQLite)
1. **`checklist_items`** — id, category, title, description, pic, target_time, priority, is_done, sort_order
2. **`budget_items`** — id, bucket, item_name, estimated_min, estimated_max, actual_amount, scenario, notes
3. **`timeline_tasks`** — id, phase, phase_order, task, owner, is_done
4. **`adat_stages`** — id, stage_name, stage_order, description, modern_equivalent
5. **`budget_plans`** — id, plan_name, guest_count, scenario, venue_type, akad_location, total_estimate, reserve_pct

### Storage Services
- **Cloudflare D1** (SQLite edge) — persistent storage untuk semua data
- **Local dev**: `.wrangler/state/v3/d1` (auto-created dengan `--local` flag)
- **Production DB ID**: `e2303780-8ab9-4b58-ab93-3786ae2c9013`

### Data Flow
```
Browser (TailwindCSS + Chart.js + Axios)
   │  HTTP/JSON
   ▼
Hono Router (/api/*)
   │  D1 prepared statements
   ▼
Cloudflare D1 SQLite (edge-replicated)
```

## User Guide

### Cara Pakai
1. Buka https://lamarr-nikkah-planner.pages.dev
2. **Dashboard** — Lihat ringkasan progress di bagian atas
3. **Kalkulator Biaya** — Pilih skenario, input jumlah tamu & venue, klik "Hitung Estimasi". Simpan plan dengan tombol "Simpan Plan"
4. **Checklist** — Filter per kategori, klik checkbox untuk tandai selesai. Progress bar update otomatis
5. **Adat Jawa** — Baca 4 tahap lamaran adat + padanan modernnya
6. **Timeline** — Klik task untuk tandai selesai, progress tersimpan di D1

### Estimasi Biaya Referensi (dari riset file input)
| Skenario | Total (200 tamu) | Include |
|----------|-----------------|---------|
| Hemat | Rp50–65 juta | Paket dasar + vendor terjangkau |
| Menengah | Rp65–75 juta | Gedung + katering premium |
| Premium | Rp75–90 juta | Mewah + live band |
| Akad di KUA | **GRATIS** | Sesuai Kemenag |
| Akad luar KUA | Rp600.000 | Sesuai Kemenag |

## Features Not Yet Implemented
- Export budget plan ke PDF/Excel
- Autentikasi multi-user (saat ini shared database)
- Notification reminder (H-minus countdown)
- Vendor directory & comparison
- Upload foto referensi dekor/busana
- Multi-adat (Sunda, Minang, Bugis, dll)
- Template undangan digital

## Recommended Next Steps
1. **Authentication** — Tambah Cloudflare Access atau Clerk untuk multi-user
2. **PDF Export** — Integrasi library PDF untuk export breakdown budget
3. **Countdown Widget** — Tambah tanggal target pernikahan + countdown di dashboard
4. **Vendor Database** — Tabel vendor baru (name, kategori, kota, kontak, rating)
5. **Mobile PWA** — Tambah manifest.json + service worker untuk install sebagai app
6. **Analytics** — Integrasi Cloudflare Web Analytics untuk track usage
7. **i18n** — Dukung English + Bahasa Daerah (Jawa, Sunda)

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active (Production)
- **Tech Stack**: Hono + TypeScript + Cloudflare D1 + TailwindCSS (CDN) + Chart.js + Axios
- **Build**: Vite 6 (SSR bundle, 60.34 kB)
- **Last Updated**: 2026-04-23

### Development Commands
```bash
# Local dev (setelah clone)
npm install
npm run build
npx wrangler d1 migrations apply lamarr-nikkah-planner-production --local
npx wrangler d1 execute lamarr-nikkah-planner-production --local --file=./seed.sql
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health

# Production deploy
npm run build
npx wrangler pages deploy dist --project-name lamarr-nikkah-planner --branch main
```
