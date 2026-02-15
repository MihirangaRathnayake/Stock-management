import { escapeHtml, pageLayout } from "../layout";

export function renderDsaDemoPage(params: {
  notice?: string;
  error?: string;
  activityLast30: string[];
  activitySize: number;
  undoStack: string[];
  queue: number[];
  hashKeys: string[];
  bstNodeCount: number;
  graphSummary: { nodes: number; edges: number; hasCycle: boolean };
}): string {
  const activityRows = params.activityLast30.length
    ? params.activityLast30
        .map((entry, idx) => `<li class="rounded bg-slate-50 px-3 py-2 text-sm">${params.activityLast30.length - idx}. ${escapeHtml(entry)}</li>`)
        .join("")
    : `<li class="rounded bg-slate-50 px-3 py-2 text-sm text-slate-500">No activity</li>`;

  return pageLayout({
    title: "DSA Demo",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold">DSA Session State</h1>
        <form method="POST" action="/dsa-demo/reset">
          <button class="rounded bg-red-700 px-4 py-2 font-semibold text-white">Reset Session DS</button>
        </form>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="text-lg font-semibold">Linked List (Audit)</h2>
          <p class="text-sm text-slate-600">Total events: ${params.activitySize}</p>
          <ul class="mt-3 space-y-2">${activityRows}</ul>
        </article>

        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="text-lg font-semibold">Stack (Undo)</h2>
          <p class="mt-2 text-sm">Size: ${params.undoStack.length}</p>
          <p class="mt-2 text-sm">Top: ${escapeHtml(params.undoStack[params.undoStack.length - 1] ?? "Empty")}</p>
          <p class="mt-2 text-sm text-slate-600">Actions: ${escapeHtml(params.undoStack.join(" | ") || "-")}</p>
        </article>

        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="text-lg font-semibold">Queue (Inspection FIFO)</h2>
          <p class="mt-2 text-sm">Length: ${params.queue.length}</p>
          <p class="mt-2 text-sm">State: ${escapeHtml(params.queue.join(" -> ") || "Empty")}</p>
        </article>

        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="text-lg font-semibold">Hash Table</h2>
          <p class="mt-2 text-sm">Indexed references: ${params.hashKeys.length}</p>
          <p class="mt-2 text-sm text-slate-600">Sample keys: ${escapeHtml(params.hashKeys.slice(0, 10).join(", ") || "-")}</p>
        </article>

        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="text-lg font-semibold">BST</h2>
          <p class="mt-2 text-sm">Value nodes: ${params.bstNodeCount}</p>
          <p class="mt-2 text-sm text-slate-600">Used for range query report.</p>
        </article>

        <article class="rounded-xl bg-white p-4 shadow">
          <h2 class="text-lg font-semibold">Graph</h2>
          <p class="mt-2 text-sm">Nodes: ${params.graphSummary.nodes}</p>
          <p class="mt-2 text-sm">Edges: ${params.graphSummary.edges}</p>
          <p class="mt-2 text-sm">Cycle: ${params.graphSummary.hasCycle ? "Yes" : "No"}</p>
        </article>
      </section>
    `,
  });
}
