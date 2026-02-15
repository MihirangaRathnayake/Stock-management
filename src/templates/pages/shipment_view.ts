import { escapeHtml, formatNumber, pageLayout, statusPill } from "../layout";

type ShipmentView = {
  id: number;
  referenceNo: string;
  vesselName: string;
  arrivalDate: string;
  originCountry: string;
  importerName: string;
  status: string;
};

type ItemView = {
  id: number;
  hsCode: string;
  itemName: string;
  unit: string;
  receivedQty: number;
  receivedWeightKg: number;
  declaredValue: number;
  warehouseCode: string;
  releasedQty: number;
  transferredOutQty: number;
  transferredInQty: number;
  availableQty: number;
};

export function renderShipmentViewPage(params: {
  notice?: string;
  error?: string;
  shipment: ShipmentView;
  items: ItemView[];
  itemSortField: string;
  itemSortAlgorithm: string;
  hsQuickFind: string;
  hsQuickFindItem: ItemView | null;
}): string {
  const rows = params.items.length
    ? params.items
        .map(
          (item) => `<tr class="border-b border-slate-100">
            <td class="px-3 py-2">${escapeHtml(item.hsCode)}</td>
            <td class="px-3 py-2">${escapeHtml(item.itemName)}</td>
            <td class="px-3 py-2">${escapeHtml(item.unit)}</td>
            <td class="px-3 py-2">${formatNumber(item.receivedQty)}</td>
            <td class="px-3 py-2">${formatNumber(item.receivedWeightKg)}</td>
            <td class="px-3 py-2">${formatNumber(item.declaredValue)}</td>
            <td class="px-3 py-2">${escapeHtml(item.warehouseCode)}</td>
            <td class="px-3 py-2">${formatNumber(item.availableQty)}</td>
            <td class="px-3 py-2">
              <div class="flex flex-wrap gap-2">
                <a class="rounded bg-emerald-700 px-2 py-1 text-xs font-semibold text-white" href="/release/new?shipmentId=${params.shipment.id}">Release</a>
                <a class="rounded bg-amber-700 px-2 py-1 text-xs font-semibold text-white" href="/transfer/new?itemId=${item.id}">Transfer</a>
                <form method="POST" action="/items/${item.id}/delete" onsubmit="return confirm('Delete item?');">
                  <button class="rounded bg-red-700 px-2 py-1 text-xs font-semibold text-white">Delete</button>
                </form>
              </div>
            </td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="9" class="px-3 py-5 text-center text-slate-500">No cargo items</td></tr>`;

  return pageLayout({
    title: `Shipment ${params.shipment.referenceNo}`,
    notice: params.notice,
    error: params.error,
    content: `
      <section class="rounded-xl bg-white p-5 shadow">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold">Shipment ${escapeHtml(params.shipment.referenceNo)}</h1>
            <p class="text-sm text-slate-600">Vessel: ${escapeHtml(params.shipment.vesselName)} | Arrival: ${escapeHtml(params.shipment.arrivalDate)} | Origin: ${escapeHtml(params.shipment.originCountry)}</p>
            <p class="text-sm text-slate-600">Importer: ${escapeHtml(params.shipment.importerName)}</p>
          </div>
          <div>${statusPill(params.shipment.status)}</div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <a href="/items/add?shipmentId=${params.shipment.id}" class="rounded bg-cyan-700 px-4 py-2 text-sm font-semibold text-white">Add Cargo Item</a>
          <form method="POST" action="/workflow/enqueue">
            <input type="hidden" name="shipmentId" value="${params.shipment.id}" />
            <button class="rounded bg-slate-700 px-4 py-2 text-sm font-semibold text-white">Enqueue for Inspection</button>
          </form>
          <a href="/release/new?shipmentId=${params.shipment.id}" class="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Release Items</a>
        </div>
      </section>

      <section class="rounded-xl bg-white p-4 shadow">
        <h2 class="mb-3 text-lg font-semibold">Items Sort + HS Quick Lookup (Hash Table)</h2>
        <form method="GET" action="/shipments/${params.shipment.id}" class="grid gap-3 md:grid-cols-4">
          <select name="itemSortField" class="rounded border px-3 py-2">
            <option value="quantity" ${params.itemSortField === "quantity" ? "selected" : ""}>Quantity</option>
            <option value="value" ${params.itemSortField === "value" ? "selected" : ""}>Declared Value</option>
          </select>
          <select name="itemSortAlgo" class="rounded border px-3 py-2">
            <option value="bubble" ${params.itemSortAlgorithm === "bubble" ? "selected" : ""}>Bubble</option>
            <option value="insertion" ${params.itemSortAlgorithm === "insertion" ? "selected" : ""}>Insertion</option>
            <option value="merge" ${params.itemSortAlgorithm === "merge" ? "selected" : ""}>Merge</option>
            <option value="quick" ${params.itemSortAlgorithm === "quick" ? "selected" : ""}>Quick</option>
          </select>
          <input name="hs" value="${escapeHtml(params.hsQuickFind)}" placeholder="HS code quick find" class="rounded border px-3 py-2" />
          <button class="rounded bg-slate-800 px-4 py-2 font-semibold text-white">Apply</button>
        </form>
        ${params.hsQuickFind ? `<p class="mt-2 text-sm">HS Lookup Result: ${params.hsQuickFindItem ? `${escapeHtml(params.hsQuickFindItem.itemName)} (Available ${formatNumber(params.hsQuickFindItem.availableQty)})` : "Not found"}</p>` : ""}
      </section>

      <section class="overflow-x-auto rounded-xl bg-white p-4 shadow">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left">
            <tr>
              <th class="px-3 py-2">HS Code</th>
              <th class="px-3 py-2">Item</th>
              <th class="px-3 py-2">Unit</th>
              <th class="px-3 py-2">Received Qty</th>
              <th class="px-3 py-2">Received Wt</th>
              <th class="px-3 py-2">Declared Value</th>
              <th class="px-3 py-2">Warehouse</th>
              <th class="px-3 py-2">Available Qty</th>
              <th class="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `,
  });
}
