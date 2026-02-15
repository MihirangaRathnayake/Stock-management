import { escapeHtml, formatNumber, pageLayout } from "../layout";

type WarehouseRow = {
  id: number;
  code: string;
  name: string;
  capacityQty: number;
  capacityWeightKg: number;
  usedQty: number;
  usedWeightKg: number;
};

export function renderWarehousesPage(params: { notice?: string; error?: string; warehouses: WarehouseRow[] }): string {
  const rows = params.warehouses.length
    ? params.warehouses
        .map((w) => {
          const qtyPct = w.capacityQty > 0 ? ((w.usedQty / w.capacityQty) * 100).toFixed(1) : "0.0";
          const wtPct = w.capacityWeightKg > 0 ? ((w.usedWeightKg / w.capacityWeightKg) * 100).toFixed(1) : "0.0";
          return `<tr class="border-b border-slate-100">
            <td class="px-3 py-2">${escapeHtml(w.code)}</td>
            <td class="px-3 py-2">${escapeHtml(w.name)}</td>
            <td class="px-3 py-2">${formatNumber(w.usedQty)} / ${formatNumber(w.capacityQty)} (${qtyPct}%)</td>
            <td class="px-3 py-2">${formatNumber(w.usedWeightKg)} / ${formatNumber(w.capacityWeightKg)} (${wtPct}%)</td>
            <td class="px-3 py-2">
              <form method="POST" action="/warehouses/${w.id}/delete" onsubmit="return confirm('Delete warehouse?');">
                <button class="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white">Delete</button>
              </form>
            </td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="5" class="px-3 py-4 text-center text-slate-500">No warehouses</td></tr>`;

  return pageLayout({
    title: "Warehouses",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="grid gap-4 lg:grid-cols-3">
        <article class="rounded-xl bg-white p-5 shadow lg:col-span-1">
          <h1 class="mb-3 text-xl font-bold">Add / Update Warehouse</h1>
          <form method="POST" action="/warehouses" class="space-y-3">
            <input type="hidden" name="id" value="" />
            <label class="block text-sm font-medium">Code <input required name="code" class="mt-1 w-full rounded border px-3 py-2" placeholder="BW-01" /></label>
            <label class="block text-sm font-medium">Name <input required name="name" class="mt-1 w-full rounded border px-3 py-2" placeholder="North Bonded Yard" /></label>
            <label class="block text-sm font-medium">Capacity Qty <input required type="number" step="0.01" min="0" name="capacityQty" class="mt-1 w-full rounded border px-3 py-2" /></label>
            <label class="block text-sm font-medium">Capacity Weight (kg) <input required type="number" step="0.01" min="0" name="capacityWeightKg" class="mt-1 w-full rounded border px-3 py-2" /></label>
            <button class="rounded bg-cyan-700 px-4 py-2 font-semibold text-white">Save Warehouse</button>
          </form>
        </article>

        <article class="overflow-x-auto rounded-xl bg-white p-5 shadow lg:col-span-2">
          <h2 class="mb-3 text-xl font-bold">Warehouse Utilization</h2>
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">Code</th><th class="px-3 py-2">Name</th><th class="px-3 py-2">Quantity</th><th class="px-3 py-2">Weight</th><th class="px-3 py-2">Action</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </article>
      </section>
    `,
  });
}
