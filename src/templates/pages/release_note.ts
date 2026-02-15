import { escapeHtml, formatNumber } from "../layout";

type ReleaseMeta = {
  id: number;
  releaseNo: string;
  releasedAt: string;
  officerName: string;
  referenceNo: string;
  importerName: string;
  vesselName: string;
};

type ReleaseLine = {
  hsCode: string;
  itemName: string;
  qty: number;
  weightKg: number;
  value: number;
};

export function renderReleaseNotePage(params: { release: ReleaseMeta; items: ReleaseLine[] }): string {
  const rows = params.items
    .map(
      (item, idx) => `<tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.hsCode)}</td>
        <td>${escapeHtml(item.itemName)}</td>
        <td>${formatNumber(item.qty)}</td>
        <td>${formatNumber(item.weightKg)}</td>
        <td>${formatNumber(item.value)}</td>
      </tr>`,
    )
    .join("");

  const totalQty = params.items.reduce((acc, item) => acc + item.qty, 0);
  const totalWeight = params.items.reduce((acc, item) => acc + item.weightKg, 0);
  const totalValue = params.items.reduce((acc, item) => acc + item.value, 0);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Release Note ${escapeHtml(params.release.releaseNo)}</title>
  <link rel="stylesheet" href="/assets/styles.css" />
</head>
<body class="bg-slate-100 p-6 print:bg-white print:p-0">
  <section class="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow print:shadow-none">
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold">Release Note</h1>
        <p class="text-sm text-slate-600">Release No: ${escapeHtml(params.release.releaseNo)}</p>
      </div>
      <button onclick="window.print()" class="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white print:hidden">Print</button>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <p><strong>Reference:</strong> ${escapeHtml(params.release.referenceNo)}</p>
      <p><strong>Released At:</strong> ${escapeHtml(params.release.releasedAt)}</p>
      <p><strong>Importer:</strong> ${escapeHtml(params.release.importerName)}</p>
      <p><strong>Officer:</strong> ${escapeHtml(params.release.officerName)}</p>
      <p><strong>Vessel:</strong> ${escapeHtml(params.release.vesselName)}</p>
    </div>

    <table class="mt-6 min-w-full text-sm">
      <thead class="bg-slate-100 text-left">
        <tr><th class="px-2 py-2">#</th><th class="px-2 py-2">HS Code</th><th class="px-2 py-2">Item</th><th class="px-2 py-2">Qty</th><th class="px-2 py-2">Weight (kg)</th><th class="px-2 py-2">Value</th></tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot class="bg-slate-100 font-semibold">
        <tr><td colspan="3" class="px-2 py-2">Total</td><td class="px-2 py-2">${formatNumber(totalQty)}</td><td class="px-2 py-2">${formatNumber(totalWeight)}</td><td class="px-2 py-2">${formatNumber(totalValue)}</td></tr>
      </tfoot>
    </table>

    <p class="mt-10 text-xs text-slate-500">This document certifies goods released from bonded warehouse under customs clearance.</p>
  </section>
</body>
</html>`;
}
