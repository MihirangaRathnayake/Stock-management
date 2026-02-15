import { pageLayout } from "../layout";

export function renderShipmentNewPage(params: { notice?: string; error?: string }): string {
  return pageLayout({
    title: "New Shipment",
    notice: params.notice,
    error: params.error,
    content: `
      <section class="rounded-xl bg-white p-6 shadow">
        <h1 class="mb-4 text-2xl font-bold">Create Shipment</h1>
        <form method="POST" action="/shipments" class="grid gap-4 md:grid-cols-2">
          <label class="text-sm font-medium">Reference No <input required name="referenceNo" class="mt-1 w-full rounded border px-3 py-2" /></label>
          <label class="text-sm font-medium">Vessel Name <input required name="vesselName" class="mt-1 w-full rounded border px-3 py-2" /></label>
          <label class="text-sm font-medium">Arrival Date <input required type="date" name="arrivalDate" class="mt-1 w-full rounded border px-3 py-2" /></label>
          <label class="text-sm font-medium">Origin Country <input required name="originCountry" class="mt-1 w-full rounded border px-3 py-2" /></label>
          <label class="text-sm font-medium md:col-span-2">Importer Name <input required name="importerName" class="mt-1 w-full rounded border px-3 py-2" /></label>
          <div class="md:col-span-2">
            <button class="rounded-lg bg-cyan-700 px-4 py-2 font-semibold text-white">Create Shipment</button>
          </div>
        </form>
      </section>
    `,
  });
}
