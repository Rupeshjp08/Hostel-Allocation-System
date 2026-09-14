import { useEffect, useState } from 'react'

const apiBase = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [health, setHealth] = useState({
    loading: true,
    message: 'Checking API connection...',
    database: 'unknown',
  })

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiBase}/health`)
        const payload = await response.json()

        setHealth({
          loading: false,
          message: payload.message || 'API responded',
          database: payload.data?.database || 'unknown',
        })
      } catch (error) {
        setHealth({
          loading: false,
          message: 'Frontend is running, but the API is not reachable yet.',
          database: 'offline',
        })
      }
    }

    checkHealth()
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950 px-6 py-16 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.16),transparent_28%)]" />

      <section className="relative mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass backdrop-blur-xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">
          Phase 1 setup
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Hostel Room Allocation System
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          The project structure, Vite frontend, Express backend, Tailwind theme,
          and MongoDB connection are now in place. Authentication and dashboards
          will be added in the next phases.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-navy-900/70 p-5">
            <h2 className="text-sm font-medium text-slate-400">API status</h2>
            <p className="mt-2 text-lg text-white">
              {health.loading ? 'Checking...' : health.message}
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-navy-900/70 p-5">
            <h2 className="text-sm font-medium text-slate-400">Database</h2>
            <p className="mt-2 text-lg capitalize text-white">{health.database}</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
