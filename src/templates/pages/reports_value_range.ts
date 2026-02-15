import { escapeHtml, formatNumber, pageLayout, statusPill } from "../layout";

type RangeRow = {
  id: number;
  referenceNo: string;
  importerName: string;
  status: string;
  totalValue: number;
};

export function renderReportsValueRangePage(params: {
  notice?: string;
  error?: string;
  min: number;
  max: number;
  rows: RangeRow[];
  bstNodeCount: number;
}): string {
  const rowsHtml = params.rows.length
    ? params.rows
        .map(
          (row) => `<tr class="border-b border-slate-100"><td class="px-3 py-2"><a class="text-cyan-700 underline" href="/shipments/${row.id}">${escapeHtml(row.referenceNo)}</a></td><td class="px-3 py-2">${escapeHtml(row.importerName)}</td><td class="px-3 py-2">${statusPill(row.status)}</td><td class="px-3 py-2">${formatNumber(row.totalValue)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="px-3 py-4 text-center text-slate-500">No shipments in range</td></tr>`;

  return pageLayout({
    title: "Value Range Report",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="rounded-xl bg-white p-6 shadow">
        <h1 class="text-2xl font-bold">BST Range Query: Shipment Value</h1>
        <p class="mt-1 text-sm text-slate-600">BST nodes loaded: ${params.bstNodeCount}</p>
        <form method="GET" action="/reports/value-range" class="mt-4 flex flex-wrap gap-3">
          <label class="text-sm font-medium">Min Value <input type="number" step="0.01" min="0" name="min" value="${params.min}" class="mt-1 w-40 rounded border px-3 py-2" /></label>
          <label class="text-sm font-medium">Max Value <input type="number" step="0.01" min="0" name="max" value="${params.max}" class="mt-1 w-40 rounded border px-3 py-2" /></label>
          <button class="self-end rounded bg-cyan-700 px-4 py-2 font-semibold text-white">Run BST Range Search</button>
        </form>
      </section>

      <section class="overflow-x-auto rounded-xl bg-white p-4 shadow">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">Reference</th><th class="px-3 py-2">Importer</th><th class="px-3 py-2">Status</th><th class="px-3 py-2">Total Value</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </section>
    `,
  });
}
