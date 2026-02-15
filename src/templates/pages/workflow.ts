import { escapeHtml, pageLayout, statusPill } from "../layout";

type QueueRow = {
  shipmentId: number;
  referenceNo: string;
  importerName: string;
  status: string;
};

type ShipmentOption = {
  id: number;
  referenceNo: string;
};

export function renderWorkflowPage(params: {
  notice?: string;
  error?: string;
  queueRows: QueueRow[];
  arrivals: ShipmentOption[];
}): string {
  const queueTable = params.queueRows.length
    ? params.queueRows
        .map(
          (row, idx) => `<tr class="border-b border-slate-100"><td class="px-3 py-2">${idx + 1}</td><td class="px-3 py-2">${escapeHtml(row.referenceNo)}</td><td class="px-3 py-2">${escapeHtml(row.importerName)}</td><td class="px-3 py-2">${statusPill(row.status)}</td><td class="px-3 py-2"><a class="text-cyan-700 underline" href="/inspect/${row.shipmentId}">Inspect</a></td></tr>`,
        )
        .join("")
    : `<tr><td colspan="5" class="px-3 py-4 text-center text-slate-500">Queue empty</td></tr>`;

  const options = params.arrivals
    .map((row) => `<option value="${row.id}">${escapeHtml(row.referenceNo)} (#${row.id})</option>`)
    .join("");

  return pageLayout({
    title: "Inspection Workflow",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="grid gap-4 lg:grid-cols-3">
        <article class="rounded-xl bg-white p-5 shadow lg:col-span-1">
          <h1 class="mb-3 text-xl font-bold">Inspection Queue (FIFO)</h1>
          <form method="POST" action="/workflow/enqueue" class="space-y-3">
            <label class="block text-sm font-medium">Enqueue Shipment
              <select required name="shipmentId" class="mt-1 w-full rounded border px-3 py-2">
                <option value="">Select shipment</option>
                ${options}
              </select>
            </label>
            <button class="rounded bg-cyan-700 px-4 py-2 font-semibold text-white">Enqueue</button>
          </form>

          <form method="POST" action="/workflow/inspect-next" class="mt-4">
            <button class="rounded bg-slate-800 px-4 py-2 font-semibold text-white">Inspect Next (Dequeue)</button>
          </form>
        </article>

        <article class="overflow-x-auto rounded-xl bg-white p-5 shadow lg:col-span-2">
          <h2 class="mb-3 text-xl font-bold">Queue State</h2>
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">Position</th><th class="px-3 py-2">Reference</th><th class="px-3 py-2">Importer</th><th class="px-3 py-2">Status</th><th class="px-3 py-2">Action</th></tr></thead>
            <tbody>${queueTable}</tbody>
          </table>
        </article>
      </section>
    `,
  });
}
