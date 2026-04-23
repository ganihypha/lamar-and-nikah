import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())
app.use(renderer)

// ====================== API ROUTES ======================

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', app: 'Lamarr & Nikkah Planner', time: new Date().toISOString() })
})

// ---- CHECKLIST ----
app.get('/api/checklist', async (c) => {
  const category = c.req.query('category')
  let query = 'SELECT * FROM checklist_items'
  const params: any[] = []
  if (category) {
    query += ' WHERE category = ?'
    params.push(category)
  }
  query += ' ORDER BY category, sort_order, id'
  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ success: true, data: results })
})

app.post('/api/checklist/:id/toggle', async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT is_done FROM checklist_items WHERE id = ?').bind(id).first<{ is_done: number }>()
  if (!row) return c.json({ success: false, error: 'not found' }, 404)
  const newVal = row.is_done ? 0 : 1
  await c.env.DB.prepare('UPDATE checklist_items SET is_done = ? WHERE id = ?').bind(newVal, id).run()
  return c.json({ success: true, is_done: newVal })
})

app.post('/api/checklist', async (c) => {
  const body = await c.req.json()
  const { category, title, description, pic, target_time, priority } = body
  if (!category || !title) return c.json({ success: false, error: 'category & title required' }, 400)
  const result = await c.env.DB.prepare(
    'INSERT INTO checklist_items (category, title, description, pic, target_time, priority) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(category, title, description || null, pic || null, target_time || null, priority || 'sedang').run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.delete('/api/checklist/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM checklist_items WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

app.get('/api/checklist/stats', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT category,
            COUNT(*) as total,
            SUM(CASE WHEN is_done = 1 THEN 1 ELSE 0 END) as done
     FROM checklist_items
     GROUP BY category`
  ).all()
  return c.json({ success: true, data: results })
})

// ---- BUDGET ----
app.get('/api/budget', async (c) => {
  const bucket = c.req.query('bucket')
  const scenario = c.req.query('scenario')
  let query = 'SELECT * FROM budget_items WHERE 1=1'
  const params: any[] = []
  if (bucket) { query += ' AND bucket = ?'; params.push(bucket) }
  if (scenario) { query += ' AND scenario = ?'; params.push(scenario) }
  query += ' ORDER BY bucket, id'
  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ success: true, data: results })
})

app.post('/api/budget', async (c) => {
  const body = await c.req.json()
  const { bucket, item_name, estimated_min, estimated_max, actual_amount, scenario, notes } = body
  if (!bucket || !item_name) return c.json({ success: false, error: 'bucket & item_name required' }, 400)
  const result = await c.env.DB.prepare(
    'INSERT INTO budget_items (bucket, item_name, estimated_min, estimated_max, actual_amount, scenario, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(bucket, item_name, estimated_min || 0, estimated_max || 0, actual_amount || 0, scenario || 'menengah', notes || null).run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.put('/api/budget/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { actual_amount, notes } = body
  await c.env.DB.prepare('UPDATE budget_items SET actual_amount = ?, notes = ? WHERE id = ?')
    .bind(actual_amount || 0, notes || null, id).run()
  return c.json({ success: true })
})

app.delete('/api/budget/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM budget_items WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// Kalkulator Budget dinamis
app.post('/api/budget/calculate', async (c) => {
  const body = await c.req.json()
  const { scenario = 'menengah', guest_count = 200, venue_type = 'gedung', akad_location = 'kua', reserve_pct = 15 } = body

  // Ambil semua item budget untuk skenario ini
  const { results: items } = await c.env.DB.prepare(
    "SELECT * FROM budget_items WHERE scenario = ? AND bucket IN ('lamaran', 'nikah')"
  ).bind(scenario).all<any>()

  let subtotal_min = 0, subtotal_max = 0
  for (const item of items) {
    subtotal_min += item.estimated_min || 0
    subtotal_max += item.estimated_max || 0
  }

  // Adjustment berdasar jumlah tamu (baseline 200)
  const guest_factor = guest_count / 200
  subtotal_min = Math.round(subtotal_min * guest_factor)
  subtotal_max = Math.round(subtotal_max * guest_factor)

  // Venue adjustment
  if (venue_type === 'rumah') {
    subtotal_min = Math.round(subtotal_min * 0.75)
    subtotal_max = Math.round(subtotal_max * 0.80)
  }

  // Akad cost
  const akad_cost = akad_location === 'kua' ? 0 : 600000

  // Dana cadangan
  const reserve_min = Math.round(subtotal_min * reserve_pct / 100)
  const reserve_max = Math.round(subtotal_max * reserve_pct / 100)

  const total_min = subtotal_min + akad_cost + reserve_min
  const total_max = subtotal_max + akad_cost + reserve_max

  return c.json({
    success: true,
    data: {
      scenario, guest_count, venue_type, akad_location, reserve_pct,
      subtotal_min, subtotal_max,
      akad_cost,
      reserve_min, reserve_max,
      total_min, total_max,
      breakdown: items
    }
  })
})

// Save budget plan
app.post('/api/budget/plan', async (c) => {
  const body = await c.req.json()
  const { plan_name, guest_count, scenario, venue_type, akad_location, total_estimate, reserve_pct } = body
  const result = await c.env.DB.prepare(
    'INSERT INTO budget_plans (plan_name, guest_count, scenario, venue_type, akad_location, total_estimate, reserve_pct) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(plan_name || 'Plan ' + Date.now(), guest_count || 200, scenario || 'menengah', venue_type || 'gedung', akad_location || 'kua', total_estimate || 0, reserve_pct || 15).run()
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.get('/api/budget/plans', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM budget_plans ORDER BY created_at DESC').all()
  return c.json({ success: true, data: results })
})

// ---- TIMELINE ----
app.get('/api/timeline', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM timeline_tasks ORDER BY phase_order, id'
  ).all()
  return c.json({ success: true, data: results })
})

app.post('/api/timeline/:id/toggle', async (c) => {
  const id = c.req.param('id')
  const row = await c.env.DB.prepare('SELECT is_done FROM timeline_tasks WHERE id = ?').bind(id).first<{ is_done: number }>()
  if (!row) return c.json({ success: false, error: 'not found' }, 404)
  const newVal = row.is_done ? 0 : 1
  await c.env.DB.prepare('UPDATE timeline_tasks SET is_done = ? WHERE id = ?').bind(newVal, id).run()
  return c.json({ success: true, is_done: newVal })
})

// ---- ADAT JAWA ----
app.get('/api/adat', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM adat_stages ORDER BY stage_order'
  ).all()
  return c.json({ success: true, data: results })
})

// ====================== FRONTEND ======================

app.get('/', (c) => {
  return c.render(
    <div>
      {/* HEADER */}
      <header class="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-xl">
        <div class="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-3">
            <div class="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
              <i class="fas fa-heart text-2xl"></i>
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Lamarr &amp; Nikkah Planner</h1>
              <p class="text-rose-100 text-sm">Deep research persiapan lamaran &amp; pernikahan</p>
            </div>
          </div>
          <nav class="flex items-center gap-2 text-sm">
            <a href="#dashboard" class="nav-link"><i class="fas fa-gauge mr-1"></i>Dashboard</a>
            <a href="#budget" class="nav-link"><i class="fas fa-sack-dollar mr-1"></i>Biaya</a>
            <a href="#checklist" class="nav-link"><i class="fas fa-list-check mr-1"></i>Checklist</a>
            <a href="#adat" class="nav-link"><i class="fas fa-scroll mr-1"></i>Adat</a>
            <a href="#timeline" class="nav-link"><i class="fas fa-calendar-days mr-1"></i>Timeline</a>
          </nav>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-8 space-y-12">

        {/* DASHBOARD */}
        <section id="dashboard">
          <div class="flex items-center gap-3 mb-6">
            <i class="fas fa-gauge-high text-rose-500 text-2xl"></i>
            <h2 class="text-3xl font-bold text-gray-800">Dashboard Persiapan</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats">
            {/* Populated by JS */}
            <div class="stat-card animate-pulse bg-white/60 rounded-2xl h-32"></div>
            <div class="stat-card animate-pulse bg-white/60 rounded-2xl h-32"></div>
            <div class="stat-card animate-pulse bg-white/60 rounded-2xl h-32"></div>
            <div class="stat-card animate-pulse bg-white/60 rounded-2xl h-32"></div>
          </div>
        </section>

        {/* BUDGET CALCULATOR */}
        <section id="budget" class="scroll-mt-24">
          <div class="flex items-center gap-3 mb-6">
            <i class="fas fa-sack-dollar text-rose-500 text-2xl"></i>
            <h2 class="text-3xl font-bold text-gray-800">Kalkulator Biaya</h2>
          </div>
          <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div>
                <label class="form-label">Skenario</label>
                <select id="calc-scenario" class="form-input">
                  <option value="hemat">Hemat (Rp50-65 jt)</option>
                  <option value="menengah" selected>Menengah (Rp65-75 jt)</option>
                  <option value="premium">Premium (Rp75-90 jt)</option>
                </select>
              </div>
              <div>
                <label class="form-label">Jumlah Tamu</label>
                <input type="number" id="calc-guests" value="200" min="50" max="1000" step="50" class="form-input" />
              </div>
              <div>
                <label class="form-label">Venue</label>
                <select id="calc-venue" class="form-input">
                  <option value="gedung" selected>Gedung</option>
                  <option value="rumah">Rumah (-20%)</option>
                </select>
              </div>
              <div>
                <label class="form-label">Lokasi Akad</label>
                <select id="calc-akad" class="form-input">
                  <option value="kua" selected>Kantor KUA (Gratis)</option>
                  <option value="luar_kua">Luar KUA (Rp600rb)</option>
                </select>
              </div>
              <div>
                <label class="form-label">Dana Cadangan (%)</label>
                <input type="number" id="calc-reserve" value="15" min="0" max="30" class="form-input" />
              </div>
            </div>
            <button id="btn-calculate" class="btn-primary">
              <i class="fas fa-calculator mr-2"></i>Hitung Estimasi
            </button>
          </div>

          <div id="calc-result" class="hidden">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="result-card from-emerald-500 to-green-600">
                <div class="text-sm opacity-90">Minimum</div>
                <div class="text-3xl font-bold" id="result-min">-</div>
                <div class="text-xs opacity-80 mt-1">Target terhemat</div>
              </div>
              <div class="result-card from-rose-500 to-pink-600">
                <div class="text-sm opacity-90">Maksimum</div>
                <div class="text-3xl font-bold" id="result-max">-</div>
                <div class="text-xs opacity-80 mt-1">Target nyaman</div>
              </div>
              <div class="result-card from-amber-500 to-orange-600">
                <div class="text-sm opacity-90">Dana Cadangan</div>
                <div class="text-3xl font-bold" id="result-reserve">-</div>
                <div class="text-xs opacity-80 mt-1">Buffer tak terduga</div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-800"><i class="fas fa-chart-pie text-rose-500 mr-2"></i>Breakdown Biaya</h3>
                <button id="btn-save-plan" class="btn-secondary text-sm">
                  <i class="fas fa-bookmark mr-1"></i>Simpan Plan
                </button>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <canvas id="budget-chart"></canvas>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-rose-50">
                      <tr>
                        <th class="text-left p-2">Item</th>
                        <th class="text-right p-2">Min</th>
                        <th class="text-right p-2">Max</th>
                      </tr>
                    </thead>
                    <tbody id="breakdown-body"></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHECKLIST */}
        <section id="checklist" class="scroll-mt-24">
          <div class="flex items-center gap-3 mb-6">
            <i class="fas fa-list-check text-rose-500 text-2xl"></i>
            <h2 class="text-3xl font-bold text-gray-800">Checklist Pra-Nikah</h2>
          </div>

          <div class="flex flex-wrap gap-2 mb-6" id="checklist-tabs">
            <button class="tab-btn active" data-cat="all"><i class="fas fa-globe mr-1"></i>Semua</button>
            <button class="tab-btn" data-cat="legal"><i class="fas fa-file-contract mr-1"></i>Legal</button>
            <button class="tab-btn" data-cat="keuangan"><i class="fas fa-wallet mr-1"></i>Keuangan</button>
            <button class="tab-btn" data-cat="acara"><i class="fas fa-champagne-glasses mr-1"></i>Acara</button>
            <button class="tab-btn" data-cat="keluarga"><i class="fas fa-people-roof mr-1"></i>Keluarga</button>
            <button class="tab-btn" data-cat="mental"><i class="fas fa-brain mr-1"></i>Mental</button>
          </div>

          <div id="checklist-progress" class="bg-white rounded-2xl shadow p-4 mb-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="font-semibold">Progress Keseluruhan</span>
              <span id="progress-text">0 / 0</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div id="progress-bar" class="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all" style="width: 0%"></div>
            </div>
          </div>

          <div id="checklist-list" class="space-y-3"></div>
        </section>

        {/* ADAT JAWA */}
        <section id="adat" class="scroll-mt-24">
          <div class="flex items-center gap-3 mb-6">
            <i class="fas fa-scroll text-rose-500 text-2xl"></i>
            <h2 class="text-3xl font-bold text-gray-800">Alur Lamaran Adat Jawa</h2>
          </div>
          <div id="adat-stages" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"></div>
        </section>

        {/* TIMELINE */}
        <section id="timeline" class="scroll-mt-24">
          <div class="flex items-center gap-3 mb-6">
            <i class="fas fa-calendar-days text-rose-500 text-2xl"></i>
            <h2 class="text-3xl font-bold text-gray-800">Timeline Persiapan 6 Bulan</h2>
          </div>
          <div id="timeline-phases" class="space-y-6"></div>
        </section>

        {/* FOOTER */}
        <footer class="text-center text-gray-500 text-sm py-8 border-t border-rose-100">
          <p><i class="fas fa-heart text-rose-500"></i> Lamarr &amp; Nikkah Planner &mdash; Deep Research based on file input</p>
          <p class="mt-1">Estimasi biaya bersifat indikatif. Biaya aktual tergantung kota, vendor, dan pilihan adat.</p>
        </footer>

      </main>
    </div>
  )
})

export default app
