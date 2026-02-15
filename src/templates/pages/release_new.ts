import { escapeHtml, formatNumber, pageLayout } from "../layout";

type ReleaseItem = {
  id: number;
  hsCode: string;
  itemName: string;
  unit: string;
  availableQty: number;
  availableWeightKg: number;
  declaredValue: number;
};

type ShipmentMeta = {
  id: number;
  referenceNo: string;
};

export function renderReleaseNewPage(params: {
  notice?: string;
  error?: string;
  shipment: ShipmentMeta;
  items: ReleaseItem[];
}): string {
  const rows = params.items.length
    ? params.items
        .map(
          (item) => `<tr class="border-b border-slate-100">
            <td class="px-3 py-2">${escapeHtml(item.hsCode)}</td>
            <td class="px-3 py-2">${escapeHtml(item.itemName)}</td>
            <td class="px-3 py-2">${escapeHtml(item.unit)}</td>
            <td class="px-3 py-2">${formatNumber(item.availableQty)}</td>
            <td class="px-3 py-2">${formatNumber(item.availableWeightKg)}</td>
            <td class="px-3 py-2">${formatNumber(item.declaredValue)}</td>
            <td class="px-3 py-2"><input type="number" step="0.01" min="0" max="${item.availableQty}" name="releaseQty_${item.id}" class="w-32 rounded border px-2 py-1" /></td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="7" class="px-3 py-4 text-center text-slate-500">No releasable items</td></tr>`;

  return pageLayout({
    title: `New Release ${params.shipment.referenceNo}`,
    notice: params.notice,
    error: params.error,
    content: `
      <section class="rounded-xl bg-white p-6 shadow">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h1 class="text-2xl font-bold">Create Release for ${escapeHtml(params.shipment.referenceNo)}</h1>
          <form method="POST" action="/release/undo">
            <button class="rounded bg-amber-700 px-3 py-2 text-sm font-semibold text-white">Undo Last Action (Stack)</button>
          </form>
        </div>

        <form method="POST" action="/release" class="mt-4 space-y-4">
          <input type="hidden" name="shipmentId" value="${params.shipment.id}" />
          <div class="grid gap-3 md:grid-cols-3">
            <label class="text-sm font-medium">Release No <input required name="releaseNo" class="mt-1 w-full rounded border px-3 py-2" placeholder="REL-2026-0001" /></label>
            <label class="text-sm font-medium">Released At <input required type="datetime-local" name="releasedAt" class="mt-1 w-full rounded border px-3 py-2" /></label>
            <label class="text-sm font-medium">Officer Name <input required name="officerName" class="mt-1 w-full rounded border px-3 py-2" /></label>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">HS</th><th class="px-3 py-2">Item</th><th class="px-3 py-2">Unit</th><th class="px-3 py-2">Avail Qty</th><th class="px-3 py-2">Avail Wt</th><th class="px-3 py-2">Value</th><th class="px-3 py-2">Release Qty</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          <button class="rounded bg-emerald-700 px-4 py-2 font-semibold text-white">Create Release</button>
        </form>
      </section>
    `,
  });
}
