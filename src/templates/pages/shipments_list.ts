import { escapeHtml, formatNumber, pageLayout, statusPill } from "../layout";

type ShipmentListRow = {
  id: number;
  referenceNo: string;
  vesselName: string;
  arrivalDate: string;
  importerName: string;
  status: string;
  totalQty: number;
  totalValue: number;
};

export function renderShipmentsListPage(params: {
  notice?: string;
  error?: string;
  shipments: ShipmentListRow[];
  query: string;
  searchField: string;
  searchAlgorithm: string;
  sortField: string;
  sortAlgorithm: string;
  quickFindReference: string;
  quickFindResult: ShipmentListRow | null;
}): string {
  const rows = params.shipments.length
    ? params.shipments
        .map(
          (s) => `<tr class="border-b border-slate-100">
            <td class="px-3 py-2"><a class="text-cyan-700 underline" href="/shipments/${s.id}">${escapeHtml(s.referenceNo)}</a></td>
            <td class="px-3 py-2">${escapeHtml(s.vesselName)}</td>
            <td class="px-3 py-2">${escapeHtml(s.arrivalDate)}</td>
            <td class="px-3 py-2">${escapeHtml(s.importerName)}</td>
            <td class="px-3 py-2">${statusPill(s.status)}</td>
            <td class="px-3 py-2">${formatNumber(s.totalQty)}</td>
            <td class="px-3 py-2">${formatNumber(s.totalValue)}</td>
            <td class="px-3 py-2">
              <form method="POST" action="/shipments/${s.id}/delete" onsubmit="return confirm('Delete shipment?');">
                <button class="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white">Delete</button>
              </form>
            </td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="8" class="px-3 py-5 text-center text-slate-500">No shipments found</td></tr>`;

  return pageLayout({
    title: "Shipments",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold">Shipments</h1>
        <a href="/shipments/new" class="rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white">New Shipment</a>
      </section>

      <section class="rounded-xl bg-white p-4 shadow">
        <h2 class="mb-3 text-lg font-semibold">Search + Sort</h2>
        <form method="GET" action="/shipments" class="grid gap-3 md:grid-cols-6">
          <input name="q" value="${escapeHtml(params.query)}" placeholder="Search text or value" class="rounded border px-3 py-2 md:col-span-2" />
          <select name="field" class="rounded border px-3 py-2">
            <option value="reference" ${params.searchField === "reference" ? "selected" : ""}>Reference</option>
            <option value="importer" ${params.searchField === "importer" ? "selected" : ""}>Importer</option>
            <option value="vessel" ${params.searchField === "vessel" ? "selected" : ""}>Vessel</option>
            <option value="hs" ${params.searchField === "hs" ? "selected" : ""}>HS Code</option>
            <option value="value" ${params.searchField === "value" ? "selected" : ""}>Declared Value (exact)</option>
            <option value="quantity" ${params.searchField === "quantity" ? "selected" : ""}>Quantity (exact)</option>
          </select>
          <select name="searchAlgo" class="rounded border px-3 py-2">
            <option value="linear" ${params.searchAlgorithm === "linear" ? "selected" : ""}>Linear</option>
            <option value="binary" ${params.searchAlgorithm === "binary" ? "selected" : ""}>Binary (sorted)</option>
          </select>
          <select name="sortField" class="rounded border px-3 py-2">
            <option value="arrivalDate" ${params.sortField === "arrivalDate" ? "selected" : ""}>Sort: Arrival Date</option>
            <option value="totalValue" ${params.sortField === "totalValue" ? "selected" : ""}>Sort: Total Value</option>
            <option value="totalQty" ${params.sortField === "totalQty" ? "selected" : ""}>Sort: Total Quantity</option>
          </select>
          <select name="sortAlgo" class="rounded border px-3 py-2">
            <option value="bubble" ${params.sortAlgorithm === "bubble" ? "selected" : ""}>Bubble</option>
            <option value="insertion" ${params.sortAlgorithm === "insertion" ? "selected" : ""}>Insertion</option>
            <option value="merge" ${params.sortAlgorithm === "merge" ? "selected" : ""}>Merge</option>
            <option value="quick" ${params.sortAlgorithm === "quick" ? "selected" : ""}>Quick</option>
          </select>
          <button class="rounded bg-slate-800 px-4 py-2 font-semibold text-white md:col-span-6 md:w-fit">Apply</button>
        </form>
      </section>

      <section class="rounded-xl bg-white p-4 shadow">
        <h2 class="mb-3 text-lg font-semibold">Quick Find Shipment (Hash Table)</h2>
        <form method="GET" action="/shipments" class="flex flex-wrap items-center gap-3">
          <input name="quickRef" value="${escapeHtml(params.quickFindReference)}" class="rounded border px-3 py-2" placeholder="Reference No" />
          <input type="hidden" name="q" value="${escapeHtml(params.query)}" />
          <input type="hidden" name="field" value="${escapeHtml(params.searchField)}" />
          <input type="hidden" name="searchAlgo" value="${escapeHtml(params.searchAlgorithm)}" />
          <input type="hidden" name="sortField" value="${escapeHtml(params.sortField)}" />
          <input type="hidden" name="sortAlgo" value="${escapeHtml(params.sortAlgorithm)}" />
          <button class="rounded bg-cyan-700 px-4 py-2 font-semibold text-white">Quick Find</button>
        </form>
        ${params.quickFindReference ? `<p class="mt-3 text-sm">Result: ${params.quickFindResult ? `<a class="text-cyan-700 underline" href="/shipments/${params.quickFindResult.id}">${escapeHtml(params.quickFindResult.referenceNo)} / ${escapeHtml(params.quickFindResult.importerName)}</a>` : "Not found"}</p>` : ""}
      </section>

      <section class="overflow-x-auto rounded-xl bg-white p-4 shadow">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left">
            <tr>
              <th class="px-3 py-2">Reference</th>
              <th class="px-3 py-2">Vessel</th>
              <th class="px-3 py-2">Arrival</th>
              <th class="px-3 py-2">Importer</th>
              <th class="px-3 py-2">Status</th>
              <th class="px-3 py-2">Total Qty</th>
              <th class="px-3 py-2">Total Value</th>
              <th class="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `,
  });
}
