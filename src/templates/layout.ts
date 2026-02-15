export function escapeHtml(input: unknown): string {
  const text = String(input ?? "");
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function statusPill(status: string): string {
  const palette: Record<string, string> = {
    ARRIVED: "bg-slate-200 text-slate-800",
    UNDER_INSPECTION: "bg-blue-200 text-blue-800",
    ON_HOLD: "bg-red-200 text-red-800",
    CLEARED: "bg-emerald-200 text-emerald-800",
    RELEASED: "bg-green-200 text-green-900",
    PASS: "bg-emerald-200 text-emerald-800",
    HOLD: "bg-red-200 text-red-800",
    RECHECK: "bg-amber-200 text-amber-800",
    PENDING: "bg-slate-200 text-slate-800",
  };

  const classes = palette[status] ?? "bg-slate-200 text-slate-800";
  return `<span class="inline-block rounded-full px-3 py-1 text-xs font-semibold ${classes}">${escapeHtml(status)}</span>`;
}

export function navLink(href: string, label: string): string {
  return `<a href="${href}" class="rounded-md px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700">${label}</a>`;
}

export function pageLayout(params: {
  title: string;
  content: string;
  notice?: string;
  error?: string;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(params.title)}</title>
  <link rel="stylesheet" href="/assets/styles.css" />
</head>
<body class="min-h-screen bg-slate-100 text-slate-900">
  <nav class="sticky top-0 z-10 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
      <a href="/" class="mr-3 text-lg font-bold tracking-tight text-white">Port Customs Stock</a>
      ${navLink("/dashboard", "Dashboard")}
      ${navLink("/shipments", "Shipments")}
      ${navLink("/warehouses", "Warehouses")}
      ${navLink("/workflow", "Workflow")}
      ${navLink("/graph", "Transfer Graph")}
      ${navLink("/reports/value-range", "Value Range")}
      ${navLink("/dsa-demo", "DSA Demo")}
      ${navLink("/notes", "Notes")}
    </div>
  </nav>

  <main class="mx-auto max-w-7xl space-y-6 px-4 py-6">
    ${params.notice ? `<div class="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800">${escapeHtml(params.notice)}</div>` : ""}
    ${params.error ? `<div class="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-800">${escapeHtml(params.error)}</div>` : ""}
    ${params.content}
  </main>
</body>
</html>`;
}
