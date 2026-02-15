import { pageLayout } from "../layout";

export function renderHomePage(params: { notice?: string; error?: string }): string {
  return pageLayout({
    title: "Port Customs Stock Management",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-800 p-8 text-white shadow-2xl md:p-10">
        <div aria-hidden="true" class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl"></div>
        <div aria-hidden="true" class="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl"></div>
        <div class="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p class="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              Bonded Warehouse Intelligence
            </p>
            <h1 class="mt-4 text-4xl font-extrabold leading-tight tracking-tight">
              Port Customs Stock Management System
            </h1>
            <p class="mt-4 max-w-3xl text-lg text-slate-100/95">
              Real customs operations mapped to real DSA: queue-based inspections, stack-based undo, hash quick-find, BST value range reports, and graph transfer routes.
            </p>
            <div class="mt-7 flex flex-wrap gap-3">
              <a class="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5" href="/shipments/new"><i class="fa-solid fa-plus mr-2"></i>Create Shipment</a>
              <a class="rounded-xl border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20" href="/workflow"><i class="fa-solid fa-list-check mr-2"></i>Run Inspection Workflow</a>
              <a class="rounded-xl border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20" href="/dsa-demo"><i class="fa-solid fa-diagram-project mr-2"></i>Open DSA Monitor</a>
            </div>
          </div>
          <aside class="grid gap-3 self-end">
            <article class="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p class="text-xs uppercase tracking-[0.2em] text-cyan-100">Inspection Mode</p>
              <p class="mt-1 text-2xl font-extrabold">FIFO Queue</p>
              <p class="mt-1 text-sm text-slate-100/90">Dequeues by arrival priority and supports RECHECK re-enqueue.</p>
            </article>
            <article class="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p class="text-xs uppercase tracking-[0.2em] text-cyan-100">Control Mode</p>
              <p class="mt-1 text-2xl font-extrabold">Undo Stack</p>
              <p class="mt-1 text-sm text-slate-100/90">Safely reverses latest release or transfer with validation.</p>
            </article>
          </aside>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <article class="rounded-2xl bg-white p-5 shadow">
          <h2 class="text-lg font-bold"><i class="fa-solid fa-chart-pie mr-2 text-cyan-700"></i>Operational Dashboards</h2>
          <p class="mt-2 text-sm text-slate-600">Track daily arrivals, hold inventory, utilization pressure, and aging risk in one command center.</p>
          <a class="mt-4 inline-block text-sm font-semibold text-cyan-700 underline" href="/dashboard">Open Dashboard</a>
        </article>
        <article class="rounded-2xl bg-white p-5 shadow">
          <h2 class="text-lg font-bold"><i class="fa-solid fa-gears mr-2 text-cyan-700"></i>Algorithms In Action</h2>
          <p class="mt-2 text-sm text-slate-600">Switch Bubble, Insertion, Merge, and Quick sort plus Linear/Binary search directly from list pages.</p>
          <a class="mt-4 inline-block text-sm font-semibold text-cyan-700 underline" href="/shipments">Try Shipments Page</a>
        </article>
        <article class="rounded-2xl bg-white p-5 shadow">
          <h2 class="text-lg font-bold"><i class="fa-solid fa-cubes-stacked mr-2 text-cyan-700"></i>Custom DSA Structures</h2>
          <p class="mt-2 text-sm text-slate-600">Queue, Stack, Linked List, Hash Table, BST, and Graph are visible and testable during operations.</p>
          <a class="mt-4 inline-block text-sm font-semibold text-cyan-700 underline" href="/dsa-demo">Inspect DSA State</a>
        </article>
      </section>
    `,
  });
}
