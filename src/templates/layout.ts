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

function navLink(href: string, label: string, icon: string): string {
  return `<a data-nav-link href="${href}" class="nav-link rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition">
    <i class="${icon} mr-1.5"></i>${label}
  </a>`;
}

export function pageLayout(params: {
  title: string;
  content: string;
  notice?: string;
  error?: string;
  hideNav?: boolean;
}): string {
  const shell = `
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl"></div>
    <div class="absolute right-0 top-56 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl"></div>
    <div class="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl"></div>
  </div>
  `;

  const nav = `
  <nav class="sticky top-0 z-30 border-b border-slate-700/90 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-lg">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
      <div class="flex items-center gap-3">
        <a href="/" class="brand-title text-xl font-extrabold tracking-tight text-white">
          <i class="fa-solid fa-anchor mr-2 text-cyan-300"></i>Port Customs Stock
        </a>
      </div>

      <button id="mobileNavButton" class="inline-flex rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-100 md:hidden" type="button">
        <i class="fa-solid fa-bars mr-2"></i>Menu
      </button>

      <div id="primaryNav" class="hidden flex-wrap items-center gap-1 md:flex">
        ${navLink("/dashboard", "Dashboard", "fa-solid fa-chart-pie")}
        ${navLink("/shipments", "Shipments", "fa-solid fa-boxes-stacked")}
        ${navLink("/warehouses", "Warehouses", "fa-solid fa-warehouse")}
        ${navLink("/workflow", "Workflow", "fa-solid fa-clipboard-check")}
        ${navLink("/graph", "Transfer Graph", "fa-solid fa-share-nodes")}
        ${navLink("/reports/value-range", "Value Range", "fa-solid fa-chart-line")}
        ${navLink("/dsa-demo", "DSA Demo", "fa-solid fa-diagram-project")}
        ${navLink("/notes", "Notes", "fa-solid fa-note-sticky")}
      </div>

      <div id="sessionControls" class="hidden items-center gap-2 md:flex">
        <button id="notificationBtn" type="button" class="relative rounded-lg border border-slate-600 px-3 py-2 text-slate-100 hover:bg-slate-800">
          <i class="fa-regular fa-bell"></i>
          <span id="notificationBadge" class="absolute -right-1 -top-1 hidden min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold text-white">0</span>
        </button>
        <div id="sessionUser" class="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200">
          Guest
        </div>
        <a id="loginBtn" href="/login" class="rounded-lg border border-cyan-400/70 bg-cyan-400/15 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/25">
          <i class="fa-solid fa-right-to-bracket mr-1"></i>Login
        </a>
        <form id="logoutForm" method="POST" action="/logout" class="hidden" data-confirm="Are you sure you want to logout?">
          <button class="rounded-lg border border-red-400/70 bg-red-400/15 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-400/25">
            <i class="fa-solid fa-right-from-bracket mr-1"></i>Logout
          </button>
        </form>
      </div>
    </div>

    <div id="mobileNav" class="hidden border-t border-slate-700/80 px-4 pb-3 md:hidden">
      <div class="grid gap-1 pt-3">
        ${navLink("/dashboard", "Dashboard", "fa-solid fa-chart-pie")}
        ${navLink("/shipments", "Shipments", "fa-solid fa-boxes-stacked")}
        ${navLink("/warehouses", "Warehouses", "fa-solid fa-warehouse")}
        ${navLink("/workflow", "Workflow", "fa-solid fa-clipboard-check")}
        ${navLink("/graph", "Transfer Graph", "fa-solid fa-share-nodes")}
        ${navLink("/reports/value-range", "Value Range", "fa-solid fa-chart-line")}
        ${navLink("/dsa-demo", "DSA Demo", "fa-solid fa-diagram-project")}
        ${navLink("/notes", "Notes", "fa-solid fa-note-sticky")}
        <div class="mt-2 border-t border-slate-700 pt-2">
          <div id="mobileSessionUser" class="mb-1 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200">Guest</div>
          <a id="mobileLoginBtn" href="/login" class="block rounded-lg px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-slate-800"><i class="fa-solid fa-right-to-bracket mr-2"></i>Login</a>
          <form id="mobileLogoutForm" method="POST" action="/logout" class="hidden" data-confirm="Are you sure you want to logout?">
            <button class="mt-1 w-full rounded-lg border border-red-400/70 bg-red-400/15 px-3 py-2 text-left text-sm font-semibold text-red-100 hover:bg-red-400/25">
              <i class="fa-solid fa-right-from-bracket mr-2"></i>Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  </nav>

  <div id="notificationPanel" class="fixed right-4 top-[72px] z-40 hidden w-[330px] rounded-2xl border border-slate-700 bg-slate-950/95 p-3 text-slate-100 shadow-2xl backdrop-blur">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-bold"><i class="fa-regular fa-bell mr-2 text-cyan-300"></i>Notifications</h3>
      <button id="clearNotificationsBtn" class="text-xs font-semibold text-cyan-300 hover:text-cyan-200">Clear</button>
    </div>
    <div id="notificationList" class="max-h-[300px] space-y-2 overflow-auto pr-1 text-xs"></div>
  </div>
  `;

  const bodyMain = `
  <main class="app-main mx-auto max-w-7xl space-y-6 px-4 py-6">
    ${params.notice ? `<div class="rounded-xl border border-emerald-300 bg-emerald-50/90 px-4 py-3 text-emerald-900 shadow-sm">${escapeHtml(params.notice)}</div>` : ""}
    ${params.error ? `<div class="rounded-xl border border-red-300 bg-red-50/90 px-4 py-3 text-red-900 shadow-sm">${escapeHtml(params.error)}</div>` : ""}
    ${params.content}
  </main>
  `;

  const confirmModal = `
  <div id="confirmModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/50 p-4">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
      <h3 class="text-lg font-bold text-slate-900"><i class="fa-solid fa-triangle-exclamation mr-2 text-amber-500"></i>Confirm Action</h3>
      <p id="confirmModalMessage" class="mt-2 text-sm text-slate-600">Are you sure?</p>
      <div class="mt-4 flex justify-end gap-2">
        <button id="confirmCancelBtn" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Cancel</button>
        <button id="confirmOkBtn" class="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Confirm</button>
      </div>
    </div>
  </div>
  `;

  const script = `
  <script>
    (() => {
      const currentPath = window.location.pathname;
      document.querySelectorAll('[data-nav-link]').forEach((el) => {
        const href = el.getAttribute('href') || '';
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
          el.classList.add('is-active');
        }
      });

      const mobileButton = document.getElementById('mobileNavButton');
      const mobileNav = document.getElementById('mobileNav');
      if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', () => mobileNav.classList.toggle('hidden'));
      }

      const revealTargets = Array.from(document.querySelectorAll('main section, main article, main form, main table, main .rounded-xl, main .rounded-2xl'));
      revealTargets.forEach((node, index) => {
        node.classList.add('reveal-on-scroll');
        node.style.setProperty('--reveal-delay', String(Math.min(index, 10) * 45) + 'ms');
      });
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      revealTargets.forEach((node) => observer.observe(node));

      const notificationBtn = document.getElementById('notificationBtn');
      const notificationPanel = document.getElementById('notificationPanel');
      const notificationList = document.getElementById('notificationList');
      const notificationBadge = document.getElementById('notificationBadge');
      const userEl = document.getElementById('sessionUser');
      const loginBtn = document.getElementById('loginBtn');
      const logoutForm = document.getElementById('logoutForm');
      const mobileLoginBtn = document.getElementById('mobileLoginBtn');
      const mobileLogoutForm = document.getElementById('mobileLogoutForm');
      const mobileUserEl = document.getElementById('mobileSessionUser');
      const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');

      const renderNotifications = (items) => {
        const esc = (value) => String(value ?? '')
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
        if (!notificationList) return;
        if (!items || items.length === 0) {
          notificationList.innerHTML = '<div class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-400">No notifications.</div>';
          return;
        }
        notificationList.innerHTML = items.map((n) => (
          '<div class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">' +
          '<div class="text-[11px] text-slate-400">' + new Date(n.createdAt).toLocaleString() + '</div>' +
          '<div class="mt-1 text-sm text-slate-100">' + esc(n.message) + '</div>' +
          '</div>'
        )).join('');
      };

      const loadSessionState = async () => {
        try {
          const res = await fetch('/api/session-state', { credentials: 'same-origin' });
          const data = await res.json();
          if (userEl) userEl.textContent = data.authenticated ? ('User: ' + data.username) : 'Guest';
          if (mobileUserEl) mobileUserEl.textContent = data.authenticated ? ('User: ' + data.username) : 'Guest';
          if (loginBtn) loginBtn.classList.toggle('hidden', !!data.authenticated);
          if (logoutForm) logoutForm.classList.toggle('hidden', !data.authenticated);
          if (mobileLoginBtn) mobileLoginBtn.classList.toggle('hidden', !!data.authenticated);
          if (mobileLogoutForm) mobileLogoutForm.classList.toggle('hidden', !data.authenticated);
          if (notificationBtn) notificationBtn.classList.toggle('hidden', !data.authenticated);
          if (notificationPanel && !data.authenticated) notificationPanel.classList.add('hidden');
          renderNotifications(data.notifications || []);
          const unread = Number(data.unreadCount || 0);
          if (notificationBadge) {
            notificationBadge.textContent = String(unread);
            notificationBadge.classList.toggle('hidden', unread <= 0);
          }
        } catch {}
      };

      if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', () => notificationPanel.classList.toggle('hidden'));
        document.addEventListener('click', (e) => {
          if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationPanel.classList.add('hidden');
          }
        });
      }

      if (clearNotificationsBtn) {
        clearNotificationsBtn.addEventListener('click', async () => {
          try {
            await fetch('/api/session-state/clear', { method: 'POST', credentials: 'same-origin' });
            loadSessionState();
          } catch {}
        });
      }

      const confirmModal = document.getElementById('confirmModal');
      const confirmMessage = document.getElementById('confirmModalMessage');
      const confirmCancelBtn = document.getElementById('confirmCancelBtn');
      const confirmOkBtn = document.getElementById('confirmOkBtn');
      let pendingResolve = null;
      let pendingReject = null;

      const openConfirm = (message) => {
        if (!confirmModal || !confirmMessage) return Promise.resolve(window.confirm(message));
        confirmMessage.textContent = message;
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');
        return new Promise((resolve, reject) => {
          pendingResolve = resolve;
          pendingReject = reject;
        });
      };

      const closeConfirm = (result) => {
        if (!confirmModal) return;
        confirmModal.classList.add('hidden');
        confirmModal.classList.remove('flex');
        if (pendingResolve) pendingResolve(result);
        pendingResolve = null;
        pendingReject = null;
      };

      if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', () => closeConfirm(false));
      if (confirmOkBtn) confirmOkBtn.addEventListener('click', () => closeConfirm(true));
      if (confirmModal) confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) closeConfirm(false); });

      document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', async (event) => {
          const action = form.getAttribute('action') || '';
          const hasConfirm = form.hasAttribute('data-confirm') || /\\/(delete|undo|logout)/.test(action);
          if (form.getAttribute('data-confirmed') === 'true') return;
          if (hasConfirm) {
            event.preventDefault();
            const msg = form.getAttribute('data-confirm') || 'Are you sure you want to continue?';
            const ok = await openConfirm(msg);
            if (!ok) return;
            form.setAttribute('data-confirmed', 'true');
            form.submit();
            return;
          }

          const submit = form.querySelector('button[type="submit"], button:not([type])');
          if (!submit) return;
          if (form.method.toUpperCase() === 'POST') {
            submit.setAttribute('data-original-text', submit.textContent || '');
            submit.textContent = 'Processing...';
            submit.setAttribute('disabled', 'true');
          }
        });
      });

      loadSessionState();
    })();
  </script>
  `;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(params.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="/assets/styles.css" />
</head>
<body class="min-h-screen bg-slate-50 text-slate-900">
  ${shell}
  ${params.hideNav ? "" : nav}
  ${bodyMain}
  ${confirmModal}
  ${script}
</body>
</html>`;
}
