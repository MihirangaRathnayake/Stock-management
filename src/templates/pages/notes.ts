import { pageLayout } from "../layout";

export function renderNotesPage(): string {
  return pageLayout({
    title: "DSA Notes",
    content: `
      <section class="rounded-xl bg-white p-6 shadow">
        <h1 class="text-2xl font-bold">Complexity Notes (Viva)</h1>
        <p class="mt-2 text-sm text-slate-600">Data structures and algorithms used in the Port Customs Stock Management workflow.</p>

        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-left">
              <tr><th class="px-3 py-2">Component</th><th class="px-3 py-2">Operation</th><th class="px-3 py-2">Time</th><th class="px-3 py-2">Usage</th></tr>
            </thead>
            <tbody>
              <tr class="border-b"><td class="px-3 py-2">Linked List</td><td class="px-3 py-2">append/traverse</td><td class="px-3 py-2">O(1) / O(n)</td><td class="px-3 py-2">Audit trail of recent activity</td></tr>
              <tr class="border-b"><td class="px-3 py-2">Stack</td><td class="px-3 py-2">push/pop</td><td class="px-3 py-2">O(1)</td><td class="px-3 py-2">Undo release/transfer</td></tr>
              <tr class="border-b"><td class="px-3 py-2">Queue</td><td class="px-3 py-2">enqueue/dequeue</td><td class="px-3 py-2">O(1)</td><td class="px-3 py-2">Inspection FIFO</td></tr>
              <tr class="border-b"><td class="px-3 py-2">Hash Table</td><td class="px-3 py-2">set/get</td><td class="px-3 py-2">O(1) avg</td><td class="px-3 py-2">Quick find shipment by reference</td></tr>
              <tr class="border-b"><td class="px-3 py-2">BST</td><td class="px-3 py-2">insert/range</td><td class="px-3 py-2">O(log n) avg</td><td class="px-3 py-2">Declared value range report</td></tr>
              <tr class="border-b"><td class="px-3 py-2">Graph</td><td class="px-3 py-2">BFS/DFS</td><td class="px-3 py-2">O(V+E)</td><td class="px-3 py-2">Warehouse transfer reachability</td></tr>
              <tr class="border-b"><td class="px-3 py-2">Bubble Sort</td><td class="px-3 py-2">sort</td><td class="px-3 py-2">O(n^2)</td><td class="px-3 py-2">Switchable list sort</td></tr>
              <tr class="border-b"><td class="px-3 py-2">Insertion Sort</td><td class="px-3 py-2">sort</td><td class="px-3 py-2">O(n^2)</td><td class="px-3 py-2">Switchable list sort</td></tr>
              <tr class="border-b"><td class="px-3 py-2">Merge Sort</td><td class="px-3 py-2">sort</td><td class="px-3 py-2">O(n log n)</td><td class="px-3 py-2">Switchable list sort</td></tr>
              <tr><td class="px-3 py-2">Quick Sort</td><td class="px-3 py-2">sort</td><td class="px-3 py-2">O(n log n) avg</td><td class="px-3 py-2">Switchable list sort</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `,
  });
}
