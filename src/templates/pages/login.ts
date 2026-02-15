import { escapeHtml, pageLayout } from "../layout";

export function renderLoginPage(params: { notice?: string; error?: string; defaultUsername: string }): string {
  return pageLayout({
    title: "Login - Port Customs",
    notice: params.notice,
    error: params.error,
    hideNav: true,
    content: `
      <section class="mx-auto max-w-5xl">
        <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article class="rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-700 p-8 text-white shadow-2xl">
            <p class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <i class="fa-solid fa-shield-halved"></i> Secure Access
            </p>
            <h1 class="mt-5 text-4xl font-extrabold leading-tight">Port Customs Stock Management</h1>
            <p class="mt-4 max-w-xl text-slate-100/95">
              Authenticate to access bonded warehouse operations, inspection workflows, transfer network analytics, and DSA monitoring tools.
            </p>
            <div class="mt-8 grid gap-3 text-sm">
              <div class="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <span class="font-semibold text-cyan-100">Role:</span> Customs Operations Officer
              </div>
              <div class="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                <span class="font-semibold text-cyan-100">Hint Username:</span> ${escapeHtml(params.defaultUsername)}
              </div>
            </div>
          </article>

          <article class="rounded-3xl bg-white p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-slate-900">
              <i class="fa-solid fa-right-to-bracket mr-2 text-cyan-700"></i>Sign In
            </h2>
            <p class="mt-2 text-sm text-slate-600">Enter the hardcoded credentials to continue.</p>
            <form method="POST" action="/login" class="mt-6 space-y-4">
              <label class="block text-sm font-semibold text-slate-700">
                Username
                <input name="username" required autocomplete="username" class="mt-1 w-full rounded-xl border px-3 py-2.5" placeholder="Enter username" />
              </label>
              <label class="block text-sm font-semibold text-slate-700">
                Password
                <input type="password" name="password" required autocomplete="current-password" class="mt-1 w-full rounded-xl border px-3 py-2.5" placeholder="Enter password" />
              </label>
              <button type="submit" class="w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800">
                <i class="fa-solid fa-lock-open mr-2"></i>Access System
              </button>
            </form>
          </article>
        </div>
      </section>
    `,
  });
}

