import { escapeHtml, formatNumber, pageLayout } from "../layout";

type ItemMeta = {
  id: number;
  hsCode: string;
  itemName: string;
  availableQty: number;
  availableWeightKg: number;
  fromWarehouseId: number;
  fromWarehouseCode: string;
};

type WarehouseOption = { id: number; code: string; name: string };

export function renderTransferNewPage(params: {
  notice?: string;
  error?: string;
  item: ItemMeta;
  warehouses: WarehouseOption[];
}): string {
  const options = params.warehouses
    .filter((w) => w.id !== params.item.fromWarehouseId)
    .map((w) => `<option value="${w.id}">${escapeHtml(w.code)} - ${escapeHtml(w.name)}</option>`)
    .join("");

  return pageLayout({
    title: "Transfer Item",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="rounded-xl bg-white p-6 shadow">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h1 class="text-2xl font-bold">Transfer Cargo Item</h1>
          <form method="POST" action="/transfer/undo">
            <button class="rounded bg-amber-700 px-3 py-2 text-sm font-semibold text-white">Undo Last Action (Stack)</button>
          </form>
        </div>

        <div class="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
          <p><strong>Item:</strong> ${escapeHtml(params.item.itemName)} (${escapeHtml(params.item.hsCode)})</p>
          <p><strong>Current Warehouse:</strong> ${escapeHtml(params.item.fromWarehouseCode)}</p>
          <p><strong>Available Qty:</strong> ${formatNumber(params.item.availableQty)} | <strong>Available Weight:</strong> ${formatNumber(params.item.availableWeightKg)} kg</p>
        </div>

        <form method="POST" action="/transfer" class="mt-5 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="shipmentItemId" value="${params.item.id}" />
          <input type="hidden" name="fromWarehouseId" value="${params.item.fromWarehouseId}" />

          <label class="text-sm font-medium">To Warehouse
            <select required name="toWarehouseId" class="mt-1 w-full rounded border px-3 py-2">
              <option value="">Select destination</option>
              ${options}
            </select>
          </label>

          <label class="text-sm font-medium">Transferred At
            <input required type="datetime-local" name="transferredAt" class="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label class="text-sm font-medium">Quantity
            <input required type="number" step="0.01" min="0.01" max="${params.item.availableQty}" name="qty" class="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <label class="text-sm font-medium">Weight (kg)
            <input required type="number" step="0.01" min="0.01" max="${params.item.availableWeightKg}" name="weightKg" class="mt-1 w-full rounded border px-3 py-2" />
          </label>

          <div class="md:col-span-2">
            <button class="rounded bg-amber-700 px-4 py-2 font-semibold text-white">Create Transfer</button>
          </div>
        </form>
      </section>
    `,
  });
}
