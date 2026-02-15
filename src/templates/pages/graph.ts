import { escapeHtml, pageLayout } from "../layout";

type Warehouse = { id: number; code: string; name: string };

export function renderGraphPage(params: {
  notice?: string;
  error?: string;
  warehouses: Warehouse[];
  startId: number;
  algorithm: "BFS" | "DFS";
  reachable: number[];
  adjacency: { [key: string]: number[] };
  hasCycle: boolean;
}): string {
  const options = params.warehouses
    .map(
      (w) => `<option value="${w.id}" ${params.startId === w.id ? "selected" : ""}>${escapeHtml(w.code)} - ${escapeHtml(w.name)}</option>`,
    )
    .join("");

  const idToCode: { [key: string]: string } = {};
  for (const warehouse of params.warehouses) {
    idToCode[String(warehouse.id)] = warehouse.code;
  }

  const adjacencyRows = Object.entries(params.adjacency)
    .map(([from, tos]) => {
      const fromLabel = idToCode[from] ?? from;
      const toLabel = tos.map((t) => idToCode[String(t)] ?? String(t)).join(", ") || "-";
      return `<tr class="border-b border-slate-100"><td class="px-3 py-2">${escapeHtml(fromLabel)}</td><td class="px-3 py-2">${escapeHtml(toLabel)}</td></tr>`;
    })
    .join("");

  const route = params.reachable.map((id) => idToCode[String(id)] ?? String(id)).join(" -> ");

  return pageLayout({
    title: "Transfer Graph",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="rounded-xl bg-white p-6 shadow">
        <h1 class="text-2xl font-bold">Warehouse Transfer Graph (BFS / DFS)</h1>
        <p class="mt-1 text-sm text-slate-600">Cycle detection: ${params.hasCycle ? "Detected suspicious transfer loop" : "No cycle found"}</p>

        <form method="GET" action="/graph" class="mt-4 flex flex-wrap items-end gap-3">
          <label class="text-sm font-medium">Start Warehouse
            <select name="startId" class="mt-1 w-64 rounded border px-3 py-2">${options}</select>
          </label>
          <label class="text-sm font-medium">Algorithm
            <select name="algorithm" class="mt-1 rounded border px-3 py-2">
              <option value="BFS" ${params.algorithm === "BFS" ? "selected" : ""}>BFS</option>
              <option value="DFS" ${params.algorithm === "DFS" ? "selected" : ""}>DFS</option>
            </select>
          </label>
          <button class="rounded bg-cyan-700 px-4 py-2 font-semibold text-white">Traverse</button>
        </form>

        <p class="mt-4 text-sm"><strong>Reachable Path:</strong> ${escapeHtml(route || "No route")}</p>
      </section>

      <section class="overflow-x-auto rounded-xl bg-white p-4 shadow">
        <h2 class="mb-3 text-lg font-semibold">Adjacency List</h2>
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-left"><tr><th class="px-3 py-2">From</th><th class="px-3 py-2">To</th></tr></thead>
          <tbody>${adjacencyRows || `<tr><td colspan="2" class="px-3 py-4 text-center text-slate-500">No transfer edges</td></tr>`}</tbody>
        </table>
      </section>
    `,
  });
}
