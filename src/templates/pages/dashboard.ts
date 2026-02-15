import { escapeHtml, formatNumber, pageLayout, statusPill } from "../layout";

type KPI = {
  totalShipments: number;
  underInspection: number;
  onHold: number;
  totalAvailableQty: number;
  totalAvailableWeight: number;
};

type UtilRow = {
  warehouseCode: string;
  warehouseName: string;
  usedQty: number;
  usedWeightKg: number;
  capacityQty: number;
  capacityWeightKg: number;
};

type DailyArrivalRow = {
  arrivalDate: string;
  count: number;
};

type HoldRow = {
  referenceNo: string;
  importerName: string;
  reason: string;
  requiredDocs: string;
};

type AgingRow = {
  referenceNo: string;
  status: string;
  ageDays: number;
};

export function renderDashboardPage(params: {
  notice?: string;
  error?: string;
  kpi: KPI;
  utilization: UtilRow[];
  dailyArrivals: DailyArrivalRow[];
  holdRows: HoldRow[];
  topHsCodes: { hsCode: string; totalValue: number }[];
  agingRows: AgingRow[];
}): string {
  const kpiCards = `
    <section class="grid gap-4 md:grid-cols-5">
      <div class="rounded-xl bg-white p-4 shadow"><p class="text-xs uppercase text-slate-500"><i class="fa-solid fa-boxes-stacked mr-2 text-cyan-700"></i>Shipments</p><p class="text-2xl font-bold">${params.kpi.totalShipments}</p></div>
      <div class="rounded-xl bg-white p-4 shadow"><p class="text-xs uppercase text-slate-500"><i class="fa-solid fa-magnifying-glass mr-2 text-cyan-700"></i>Under Inspection</p><p class="text-2xl font-bold">${params.kpi.underInspection}</p></div>
      <div class="rounded-xl bg-white p-4 shadow"><p class="text-xs uppercase text-slate-500"><i class="fa-solid fa-circle-exclamation mr-2 text-cyan-700"></i>On Hold</p><p class="text-2xl font-bold">${params.kpi.onHold}</p></div>
      <div class="rounded-xl bg-white p-4 shadow"><p class="text-xs uppercase text-slate-500"><i class="fa-solid fa-scale-balanced mr-2 text-cyan-700"></i>Available Qty</p><p class="text-2xl font-bold">${formatNumber(params.kpi.totalAvailableQty)}</p></div>
      <div class="rounded-xl bg-white p-4 shadow"><p class="text-xs uppercase text-slate-500"><i class="fa-solid fa-weight-hanging mr-2 text-cyan-700"></i>Available Weight (kg)</p><p class="text-2xl font-bold">${formatNumber(params.kpi.totalAvailableWeight)}</p></div>
    </section>
  `;

  const utilizationRows = params.utilization.length
    ? params.utilization
        .map((row) => {
          const qtyPct = row.capacityQty > 0 ? Math.min(100, (row.usedQty / row.capacityQty) * 100) : 0;
          const wtPct = row.capacityWeightKg > 0 ? Math.min(100, (row.usedWeightKg / row.capacityWeightKg) * 100) : 0;
          return `<tr class="border-b border-slate-100">
            <td class="px-3 py-2 font-medium">${escapeHtml(row.warehouseCode)}</td>
            <td class="px-3 py-2">${escapeHtml(row.warehouseName)}</td>
            <td class="px-3 py-2">${formatNumber(row.usedQty)} / ${formatNumber(row.capacityQty)} (${qtyPct.toFixed(1)}%)</td>
            <td class="px-3 py-2">${formatNumber(row.usedWeightKg)} / ${formatNumber(row.capacityWeightKg)} (${wtPct.toFixed(1)}%)</td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="4" class="px-3 py-4 text-center text-slate-500">No warehouses found</td></tr>`;

  const dailyRows = params.dailyArrivals.length
    ? params.dailyArrivals
        .map(
          (row) => `<tr class="border-b border-slate-100"><td class="px-3 py-2">${escapeHtml(row.arrivalDate)}</td><td class="px-3 py-2">${row.count}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="2" class="px-3 py-4 text-center text-slate-500">No arrivals</td></tr>`;

  const holdRows = params.holdRows.length
    ? params.holdRows
        .map(
          (row) => `<tr class="border-b border-slate-100"><td class="px-3 py-2">${escapeHtml(row.referenceNo)}</td><td class="px-3 py-2">${escapeHtml(row.importerName)}</td><td class="px-3 py-2">${escapeHtml(row.reason)}</td><td class="px-3 py-2">${escapeHtml(row.requiredDocs)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="px-3 py-4 text-center text-slate-500">No hold shipments</td></tr>`;

  const hsRows = params.topHsCodes.length
    ? params.topHsCodes
        .map(
          (row, idx) => `<tr class="border-b border-slate-100"><td class="px-3 py-2">${idx + 1}</td><td class="px-3 py-2">${escapeHtml(row.hsCode)}</td><td class="px-3 py-2">${formatNumber(row.totalValue)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="3" class="px-3 py-4 text-center text-slate-500">No HS data</td></tr>`;

  const agingRows = params.agingRows.length
    ? params.agingRows
        .map(
          (row) => `<tr class="border-b border-slate-100"><td class="px-3 py-2">${escapeHtml(row.referenceNo)}</td><td class="px-3 py-2">${statusPill(row.status)}</td><td class="px-3 py-2">${row.ageDays}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="3" class="px-3 py-4 text-center text-slate-500">No aging alerts</td></tr>`;

  return pageLayout({
    title: "Dashboard",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="space-y-4">
        <h1 class="text-2xl font-bold"><i class="fa-solid fa-gauge-high mr-2 text-cyan-700"></i>Operational Dashboard</h1>
        <div class="flex flex-wrap gap-2">
          <a href="/shipments/new" class="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"><i class="fa-solid fa-plus mr-2"></i>New Shipment</a>
          <a href="/workflow" class="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-semibold text-cyan-700"><i class="fa-solid fa-list-check mr-2"></i>Inspection Queue</a>
          <a href="/dsa-demo" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><i class="fa-solid fa-diagram-project mr-2"></i>DSA Monitor</a>
        </div>
        ${kpiCards}
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="mb-3 text-lg font-semibold">Warehouse Utilization</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">Code</th><th class="px-3 py-2">Name</th><th class="px-3 py-2">Qty</th><th class="px-3 py-2">Weight</th></tr></thead>
              <tbody>${utilizationRows}</tbody>
            </table>
          </div>
        </article>

        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="mb-3 text-lg font-semibold">Daily Arrivals</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">Date</th><th class="px-3 py-2">Count</th></tr></thead>
              <tbody>${dailyRows}</tbody>
            </table>
          </div>
        </article>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="mb-3 text-lg font-semibold">Stock On Hold</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">Reference</th><th class="px-3 py-2">Importer</th><th class="px-3 py-2">Reason</th><th class="px-3 py-2">Required Docs</th></tr></thead>
              <tbody>${holdRows}</tbody>
            </table>
          </div>
        </article>

        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="mb-3 text-lg font-semibold">Top HS Codes by Value</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">#</th><th class="px-3 py-2">HS Code</th><th class="px-3 py-2">Total Value</th></tr></thead>
              <tbody>${hsRows}</tbody>
            </table>
          </div>
        </article>
      </section>

      <section class="rounded-xl bg-white p-4 shadow">
        <h2 class="mb-3 text-lg font-semibold">Aging Report (Hold/Inspection)</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">Reference</th><th class="px-3 py-2">Status</th><th class="px-3 py-2">Age (days)</th></tr></thead>
            <tbody>${agingRows}</tbody>
          </table>
        </div>
      </section>
    `,
  });
}
