import { pageLayout } from "../layout";

export function renderHomePage(params: { notice?: string; error?: string }): string {
  return pageLayout({
    title: "Port Customs Stock Management",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-700 p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold">Port Customs Stock Management System (Bun + DSA)</h1>
        <p class="mt-3 max-w-3xl text-slate-100">
          Track bonded warehouse cargo, inspections, holds, releases, and transfers with real Data Structures and Algorithms powering day-to-day customs operations.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a class="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900" href="/shipments/new">Create Shipment</a>
          <a class="rounded-lg border border-white/60 px-4 py-2 font-semibold text-white" href="/workflow">Open Inspection Workflow</a>
          <a class="rounded-lg border border-white/60 px-4 py-2 font-semibold text-white" href="/dsa-demo">View DSA State</a>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <article class="rounded-xl bg-white p-5 shadow">
          <h2 class="text-lg font-semibold">Operational Dashboards</h2>
          <p class="mt-2 text-sm text-slate-600">Daily arrivals, hold stock, warehouse utilization, and aging shipments.</p>
        </article>
        <article class="rounded-xl bg-white p-5 shadow">
          <h2 class="text-lg font-semibold">Algorithms In Action</h2>
          <p class="mt-2 text-sm text-slate-600">Switch Bubble/Insertion/Merge/Quick sort and Linear/Binary search from the UI.</p>
        </article>
        <article class="rounded-xl bg-white p-5 shadow">
          <h2 class="text-lg font-semibold">Custom DSA Structures</h2>
          <p class="mt-2 text-sm text-slate-600">Queue, Stack, Linked List, Hash Table, BST, and Graph are integrated into workflows.</p>
        </article>
      </section>
    `,
  });
}
