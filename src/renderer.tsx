import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lamarr & Nikkah Planner - Deep Research Lamaran & Pernikahan</title>
        <meta name="description" content="Deep research aplikasi persiapan lamaran & pernikahan: estimasi biaya, checklist, alur adat Jawa, timeline 6 bulan." />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/styles.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
      </head>
      <body class="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 min-h-screen">
        {children}
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
