// Lamarr & Nikkah Planner - Frontend Logic

const API = '/api'
const fmtIDR = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID')

let currentChart = null
let lastCalcResult = null

// ====================== INIT ======================
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadDashboard(),
    loadChecklist('all'),
    loadAdat(),
    loadTimeline()
  ])

  // Calculator
  document.getElementById('btn-calculate').addEventListener('click', calculateBudget)
  document.getElementById('btn-save-plan').addEventListener('click', saveBudgetPlan)

  // Tab checklist
  document.querySelectorAll('#checklist-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#checklist-tabs .tab-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      loadChecklist(btn.dataset.cat)
    })
  })

  // Auto-calc on first load
  calculateBudget()
})

// ====================== DASHBOARD ======================
async function loadDashboard() {
  try {
    const [checklistStats, budgetRes, timelineRes] = await Promise.all([
      axios.get(`${API}/checklist/stats`),
      axios.get(`${API}/budget?scenario=menengah`),
      axios.get(`${API}/timeline`)
    ])

    const stats = checklistStats.data.data || []
    const totalChk = stats.reduce((a, b) => a + b.total, 0)
    const doneChk = stats.reduce((a, b) => a + (b.done || 0), 0)
    const pctChk = totalChk ? Math.round(doneChk / totalChk * 100) : 0

    const budgetItems = budgetRes.data.data || []
    const totalMin = budgetItems.reduce((a, b) => a + (b.estimated_min || 0), 0)
    const totalMax = budgetItems.reduce((a, b) => a + (b.estimated_max || 0), 0)

    const timeline = timelineRes.data.data || []
    const doneTl = timeline.filter(t => t.is_done).length

    const el = document.getElementById('dashboard-stats')
    el.innerHTML = `
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-gray-500 font-semibold uppercase">Progress Checklist</div>
          <i class="fas fa-list-check text-rose-400"></i>
        </div>
        <div class="text-3xl font-bold text-gray-800">${pctChk}%</div>
        <div class="text-xs text-gray-500 mt-1">${doneChk} dari ${totalChk} tugas selesai</div>
        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-3">
          <div class="bg-gradient-to-r from-rose-500 to-pink-500 h-1.5 rounded-full" style="width:${pctChk}%"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-gray-500 font-semibold uppercase">Est. Biaya Menengah</div>
          <i class="fas fa-sack-dollar text-emerald-400"></i>
        </div>
        <div class="text-xl font-bold text-gray-800">${fmtIDR(totalMin)}</div>
        <div class="text-xs text-gray-500">s/d ${fmtIDR(totalMax)}</div>
      </div>
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-gray-500 font-semibold uppercase">Timeline Tasks</div>
          <i class="fas fa-calendar-days text-amber-400"></i>
        </div>
        <div class="text-3xl font-bold text-gray-800">${doneTl}/${timeline.length}</div>
        <div class="text-xs text-gray-500 mt-1">Tugas timeline selesai</div>
      </div>
      <div class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-gray-500 font-semibold uppercase">Akad KUA</div>
          <i class="fas fa-mosque text-purple-400"></i>
        </div>
        <div class="text-3xl font-bold text-emerald-600">GRATIS</div>
        <div class="text-xs text-gray-500 mt-1">Luar KUA: Rp600.000</div>
      </div>
    `
  } catch (e) {
    console.error('Dashboard error:', e)
  }
}

// ====================== BUDGET CALCULATOR ======================
async function calculateBudget() {
  try {
    const payload = {
      scenario: document.getElementById('calc-scenario').value,
      guest_count: parseInt(document.getElementById('calc-guests').value) || 200,
      venue_type: document.getElementById('calc-venue').value,
      akad_location: document.getElementById('calc-akad').value,
      reserve_pct: parseInt(document.getElementById('calc-reserve').value) || 15
    }
    const res = await axios.post(`${API}/budget/calculate`, payload)
    const d = res.data.data
    lastCalcResult = d

    document.getElementById('calc-result').classList.remove('hidden')
    document.getElementById('result-min').textContent = fmtIDR(d.total_min)
    document.getElementById('result-max').textContent = fmtIDR(d.total_max)
    document.getElementById('result-reserve').textContent = fmtIDR(d.reserve_min) + ' - ' + fmtIDR(d.reserve_max)

    // Breakdown table
    const tbody = document.getElementById('breakdown-body')
    tbody.innerHTML = d.breakdown.map(b => `
      <tr class="breakdown-row">
        <td class="font-medium">
          <span class="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-700 mr-2">${b.bucket}</span>
          ${b.item_name}
        </td>
        <td class="text-right text-gray-600">${fmtIDR(b.estimated_min)}</td>
        <td class="text-right text-gray-800 font-semibold">${fmtIDR(b.estimated_max)}</td>
      </tr>
    `).join('')

    // Chart
    renderChart(d)
  } catch (e) {
    console.error('Calculate error:', e)
    alert('Gagal menghitung estimasi')
  }
}

function renderChart(d) {
  const ctx = document.getElementById('budget-chart')
  if (currentChart) currentChart.destroy()

  // Group by bucket
  const byBucket = {}
  d.breakdown.forEach(b => {
    byBucket[b.bucket] = (byBucket[b.bucket] || 0) + (b.estimated_max || 0)
  })

  currentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(byBucket).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      datasets: [{
        data: Object.values(byBucket),
        backgroundColor: ['#f43f5e', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: `Breakdown ${d.scenario.toUpperCase()} - ${d.guest_count} tamu` },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${fmtIDR(ctx.parsed)}`
          }
        }
      }
    }
  })
}

async function saveBudgetPlan() {
  if (!lastCalcResult) return alert('Hitung estimasi dulu')
  const name = prompt('Nama plan:', `Plan ${new Date().toLocaleDateString('id-ID')}`)
  if (!name) return
  try {
    await axios.post(`${API}/budget/plan`, {
      plan_name: name,
      guest_count: lastCalcResult.guest_count,
      scenario: lastCalcResult.scenario,
      venue_type: lastCalcResult.venue_type,
      akad_location: lastCalcResult.akad_location,
      total_estimate: lastCalcResult.total_max,
      reserve_pct: lastCalcResult.reserve_pct
    })
    alert('✅ Plan tersimpan!')
  } catch (e) {
    alert('Gagal simpan plan')
  }
}

// ====================== CHECKLIST ======================
async function loadChecklist(category) {
  try {
    const url = category === 'all' ? `${API}/checklist` : `${API}/checklist?category=${category}`
    const res = await axios.get(url)
    const items = res.data.data || []

    const total = items.length
    const done = items.filter(i => i.is_done).length
    const pct = total ? Math.round(done / total * 100) : 0

    document.getElementById('progress-text').textContent = `${done} / ${total} (${pct}%)`
    document.getElementById('progress-bar').style.width = pct + '%'

    // Group by category if showing all
    const list = document.getElementById('checklist-list')
    if (category === 'all') {
      const byCat = {}
      items.forEach(it => {
        if (!byCat[it.category]) byCat[it.category] = []
        byCat[it.category].push(it)
      })
      const catLabels = {
        legal: { name: 'Legal & Administrasi', icon: 'fa-file-contract' },
        keuangan: { name: 'Keuangan', icon: 'fa-wallet' },
        acara: { name: 'Acara Inti', icon: 'fa-champagne-glasses' },
        keluarga: { name: 'Keluarga & Adat', icon: 'fa-people-roof' },
        mental: { name: 'Mental & Rumah Tangga', icon: 'fa-brain' }
      }
      list.innerHTML = Object.keys(byCat).map(cat => `
        <div class="mb-6">
          <h3 class="text-lg font-bold text-rose-600 mb-3 flex items-center gap-2">
            <i class="fas ${catLabels[cat]?.icon || 'fa-tag'}"></i>
            ${catLabels[cat]?.name || cat}
            <span class="text-xs font-normal text-gray-500">(${byCat[cat].length} item)</span>
          </h3>
          <div class="space-y-2">
            ${byCat[cat].map(renderChecklistItem).join('')}
          </div>
        </div>
      `).join('')
    } else {
      list.innerHTML = items.map(renderChecklistItem).join('')
    }

    // Attach click handlers
    list.querySelectorAll('[data-toggle-id]').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.toggleId
        await axios.post(`${API}/checklist/${id}/toggle`)
        loadChecklist(category)
        loadDashboard()
      })
    })
  } catch (e) {
    console.error('Checklist error:', e)
  }
}

function renderChecklistItem(it) {
  const done = it.is_done ? 'done' : ''
  return `
    <div class="check-item ${done}">
      <div class="check-checkbox" data-toggle-id="${it.id}">
        <i class="fas fa-check text-sm"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="check-title font-semibold text-gray-800">${escapeHtml(it.title)}</div>
          <span class="priority-badge priority-${it.priority || 'sedang'}">${it.priority || 'sedang'}</span>
        </div>
        ${it.description ? `<div class="text-sm text-gray-600 mt-1">${escapeHtml(it.description)}</div>` : ''}
        <div class="flex items-center gap-3 text-xs text-gray-500 mt-2 flex-wrap">
          ${it.pic ? `<span><i class="fas fa-user mr-1"></i>${escapeHtml(it.pic)}</span>` : ''}
          ${it.target_time ? `<span><i class="fas fa-clock mr-1"></i>${escapeHtml(it.target_time)}</span>` : ''}
        </div>
      </div>
    </div>
  `
}

// ====================== ADAT JAWA ======================
async function loadAdat() {
  try {
    const res = await axios.get(`${API}/adat`)
    const stages = res.data.data || []
    document.getElementById('adat-stages').innerHTML = stages.map((s, i) => `
      <div class="adat-card">
        <div class="adat-number">${s.stage_order}</div>
        <h3 class="text-xl font-bold text-rose-600 mt-3 mb-2">${escapeHtml(s.stage_name)}</h3>
        <p class="text-sm text-gray-700 leading-relaxed mb-3">${escapeHtml(s.description)}</p>
        <div class="border-t border-rose-100 pt-3">
          <div class="text-xs text-gray-500 font-semibold uppercase mb-1">
            <i class="fas fa-arrow-right-arrow-left mr-1"></i>Versi Modern
          </div>
          <div class="text-sm text-gray-800">${escapeHtml(s.modern_equivalent || '-')}</div>
        </div>
      </div>
    `).join('')
  } catch (e) {
    console.error('Adat error:', e)
  }
}

// ====================== TIMELINE ======================
async function loadTimeline() {
  try {
    const res = await axios.get(`${API}/timeline`)
    const tasks = res.data.data || []

    // Group by phase
    const byPhase = {}
    tasks.forEach(t => {
      if (!byPhase[t.phase]) byPhase[t.phase] = { order: t.phase_order, tasks: [] }
      byPhase[t.phase].tasks.push(t)
    })

    const phaseIcons = {
      'H-6 bulan': 'fa-flag',
      'H-5 bulan': 'fa-handshake',
      'H-4 bulan': 'fa-file-signature',
      'H-3 bulan': 'fa-clipboard-list',
      'H-2 bulan': 'fa-shirt',
      'H-1 bulan': 'fa-magnifying-glass-chart',
      'H-2 minggu': 'fa-phone',
      'H-1 hari': 'fa-bed'
    }

    const sorted = Object.entries(byPhase).sort((a, b) => a[1].order - b[1].order)
    document.getElementById('timeline-phases').innerHTML = sorted.map(([phase, data]) => {
      const done = data.tasks.filter(t => t.is_done).length
      return `
        <div class="timeline-phase">
          <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 class="text-xl font-bold text-rose-600 flex items-center gap-2">
              <i class="fas ${phaseIcons[phase] || 'fa-circle'}"></i>${escapeHtml(phase)}
            </h3>
            <span class="text-xs text-gray-500">${done} / ${data.tasks.length} selesai</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            ${data.tasks.map(t => `
              <div class="timeline-task ${t.is_done ? 'done' : ''}" data-timeline-id="${t.id}">
                <i class="fas ${t.is_done ? 'fa-check-circle text-emerald-500' : 'fa-circle text-gray-300'}"></i>
                <span class="text-sm flex-1">${escapeHtml(t.task)}</span>
                ${t.owner ? `<span class="text-xs text-gray-400">${escapeHtml(t.owner)}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `
    }).join('')

    // Attach handlers
    document.querySelectorAll('[data-timeline-id]').forEach(el => {
      el.addEventListener('click', async () => {
        await axios.post(`${API}/timeline/${el.dataset.timelineId}/toggle`)
        loadTimeline()
        loadDashboard()
      })
    })
  } catch (e) {
    console.error('Timeline error:', e)
  }
}

// ====================== UTILS ======================
function escapeHtml(s) {
  if (s == null) return ''
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
