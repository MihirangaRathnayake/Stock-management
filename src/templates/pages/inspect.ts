import { escapeHtml, pageLayout, statusPill } from "../layout";

type InspectionShipment = {
  id: number;
  referenceNo: string;
  importerName: string;
  status: string;
};

export function renderInspectPage(params: { notice?: string; error?: string; shipment: InspectionShipment }): string {
  return pageLayout({
    title: `Inspect ${params.shipment.referenceNo}`,
    notice: params.notice,
    error: params.error,
    content: `
      <section class="rounded-xl bg-white p-6 shadow">
        <h1 class="text-2xl font-bold">Inspect Shipment ${escapeHtml(params.shipment.referenceNo)}</h1>
        <p class="mt-2 text-sm text-slate-600">Importer: ${escapeHtml(params.shipment.importerName)}</p>
        <p class="mt-1 text-sm">Current Status: ${statusPill(params.shipment.status)}</p>

        <form method="POST" action="/inspect/${params.shipment.id}" class="mt-5 grid gap-4 md:grid-cols-2">
          <label class="text-sm font-medium">Outcome
            <select required name="outcome" class="mt-1 w-full rounded border px-3 py-2">
              <option value="PASS">PASS (Clear shipment)</option>
              <option value="HOLD">HOLD (Create hold)</option>
              <option value="RECHECK">RECHECK (re-enqueue)</option>
            </select>
          </label>

          <label class="text-sm font-medium">Officer Notes
            <textarea name="notes" class="mt-1 w-full rounded border px-3 py-2" rows="2"></textarea>
          </label>

          <label class="text-sm font-medium">Hold Reason
            <input name="reason" class="mt-1 w-full rounded border px-3 py-2" placeholder="Only required for HOLD" />
          </label>

          <label class="text-sm font-medium">Required Documents
            <input name="requiredDocs" class="mt-1 w-full rounded border px-3 py-2" placeholder="Only required for HOLD" />
          </label>

          <div class="md:col-span-2">
            <button class="rounded bg-cyan-700 px-4 py-2 font-semibold text-white">Submit Inspection</button>
          </div>
        </form>
      </section>
    `,
  });
}
