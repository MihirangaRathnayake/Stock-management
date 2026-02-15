
/// <reference types="bun-types" />

import { db, initDb, ShipmentItemRow } from "./db";
import { ValidationError, cleanQuery, optionalString, requireDate, requireEnum, requireInteger, requireNumber, requireString, toIsoNow } from "./validation";
import { sortByAlgorithm, SortAlgorithm } from "./algorithms/sort";
import { binarySearchExact, linearSearch } from "./algorithms/search";
import { SinglyLinkedList } from "./dsa/LinkedList";
import { Stack } from "./dsa/Stack";
import { Queue } from "./dsa/Queue";
import { HashTable } from "./dsa/HashTable";
import { BST } from "./dsa/BST";
import { Graph } from "./dsa/Graph";
import { pageLayout, escapeHtml } from "./templates/layout";
import { renderHomePage } from "./templates/pages/home";
import { renderDashboardPage } from "./templates/pages/dashboard";
import { renderShipmentsListPage } from "./templates/pages/shipments_list";
import { renderShipmentNewPage } from "./templates/pages/shipment_new";
import { renderShipmentViewPage } from "./templates/pages/shipment_view";
import { renderWarehousesPage } from "./templates/pages/warehouses";
import { renderWorkflowPage } from "./templates/pages/workflow";
import { renderInspectPage } from "./templates/pages/inspect";
import { renderReleaseNewPage } from "./templates/pages/release_new";
import { renderReleaseNotePage } from "./templates/pages/release_note";
import { renderTransferNewPage } from "./templates/pages/transfer_new";
import { renderReportsValueRangePage } from "./templates/pages/reports_value_range";
import { renderGraphPage } from "./templates/pages/graph";
import { renderDsaDemoPage } from "./templates/pages/dsa_demo";
import { renderNotesPage } from "./templates/pages/notes";
import { renderLoginPage } from "./templates/pages/login";

initDb();

type ShipmentSummary = {
  id: number; referenceNo: string; vesselName: string; arrivalDate: string; originCountry: string; importerName: string; status: string; createdAt: string; totalQty: number; totalValue: number;
};
type UndoAction =
  | { type: "RELEASE"; releaseId: number; releaseNo: string; shipmentId: number; lines: { shipmentItemId: number; qty: number; weightKg: number; value: number }[] }
  | { type: "TRANSFER"; transferId: number; shipmentItemId: number; fromWarehouseId: number; toWarehouseId: number; qty: number; weightKg: number };
type NotificationEntry = { id: string; message: string; createdAt: string; read: boolean };

type SessionState = {
  activityLinkedList: SinglyLinkedList<string>;
  activitySerialized: string;
  undoStack: Stack<UndoAction>;
  inspectionQueue: Queue<number>;
  shipmentHashTable: HashTable<ShipmentSummary>;
  valueBST: BST;
  transferGraph: Graph;
  authenticated: boolean;
  username: string | null;
  notifications: NotificationEntry[];
};
const store = new Map<string, SessionState>();
const newState = (): SessionState => ({
  activityLinkedList: new SinglyLinkedList<string>(),
  activitySerialized: "[]",
  undoStack: new Stack<UndoAction>(),
  inspectionQueue: new Queue<number>(),
  shipmentHashTable: new HashTable<ShipmentSummary>(),
  valueBST: new BST(),
  transferGraph: new Graph(),
  authenticated: false,
  username: null,
  notifications: [],
});
const AUTH_USERNAME = "customsadmin";
const AUTH_PASSWORD = "Port@12345";

const html = (b: string, s = 200) => new Response(b, { status: s, headers: { "Content-Type": "text/html; charset=utf-8" } });
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8" } });
const redir = (l: string) => new Response(null, { status: 302, headers: { Location: l } });
const flash = (p: string, m: { notice?: string; error?: string }) => { const u = new URL(p, "http://x"); if (m.notice) u.searchParams.set("notice", m.notice); if (m.error) u.searchParams.set("error", m.error); return `${u.pathname}${u.search}`; };
const unflash = (u: URL) => ({ notice: u.searchParams.get("notice") || undefined, error: u.searchParams.get("error") || undefined });
const parseCookies = (h: string | null) => Object.fromEntries((h || "").split(";").map(v => v.trim()).filter(Boolean).map(v => { const i = v.indexOf("="); return [v.slice(0, i), decodeURIComponent(v.slice(i + 1))]; }));
const session = (req: Request) => { const sid = parseCookies(req.headers.get("cookie")).sessionId; if (sid && store.has(sid)) return { sid, st: store.get(sid)! }; const id = crypto.randomUUID(); const st = newState(); store.set(id, st); return { sid: id, st }; };
const withSid = (r: Response, sid: string) => { const h = new Headers(r.headers); h.set("Set-Cookie", `sessionId=${sid}; Path=/; HttpOnly; SameSite=Lax`); return new Response(r.body, { status: r.status, headers: h }); };
const addNotification = (st: SessionState, message: string) => {
  st.notifications.unshift({ id: crypto.randomUUID(), message, createdAt: toIsoNow(), read: false });
  if (st.notifications.length > 40) st.notifications = st.notifications.slice(0, 40);
};
const addLog = (st: SessionState, m: string) => {
  st.activityLinkedList.append(`${new Date().toISOString()} | ${m}`);
  st.activitySerialized = st.activityLinkedList.serialize();
  addNotification(st, m);
};
const pForm = async (req: Request) => { const f = await req.formData(); const o: Record<string, string> = {}; for (const [k, v] of f.entries()) if (typeof v === "string") o[k] = v; return o; };
const dt = (x: string) => { const d = new Date(x); if (Number.isNaN(d.getTime())) throw new ValidationError("Invalid date-time"); return d.toISOString(); };
const back = (req: Request, f: string) => { const r = req.headers.get("referer"); if (!r) return f; try { const u = new URL(r); return `${u.pathname}${u.search}`; } catch { return f; } };
const match = (p: string, a: string) => { const x = p.split("/").filter(Boolean), y = a.split("/").filter(Boolean); if (x.length !== y.length) return null; const m: Record<string, string> = {}; for (let i = 0; i < x.length; i++) { if (x[i].startsWith(":")) m[x[i].slice(1)] = decodeURIComponent(y[i]); else if (x[i] !== y[i]) return null; } return m; };

const shipments = () => db.query(`SELECT s.*, COALESCE(SUM(si.receivedQty),0) totalQty, COALESCE(SUM(si.declaredValue),0) totalValue FROM shipments s LEFT JOIN shipment_items si ON si.shipmentId=s.id GROUP BY s.id ORDER BY s.id DESC`).all() as ShipmentSummary[];
const shipment = (id: number) => db.query(`SELECT * FROM shipments WHERE id=?`).get(id) as any;
const itemRows = (shipmentId: number) => db.query(`SELECT si.*, w.code warehouseCode FROM shipment_items si JOIN warehouses w ON w.id=si.warehouseId WHERE si.shipmentId=? ORDER BY si.id DESC`).all(shipmentId) as any[];
const whs = () => db.query(`SELECT * FROM warehouses ORDER BY code`).all() as any[];
const rel = (itemId: number) => (db.query(`SELECT COALESCE(SUM(qty),0) qty, COALESCE(SUM(weightKg),0) weightKg, COALESCE(SUM(value),0) value FROM release_items WHERE shipmentItemId=?`).get(itemId) as any) || { qty: 0, weightKg: 0, value: 0 };
const tr = (itemId: number) => (db.query(`SELECT COALESCE(SUM(qty),0) outQty, COALESCE(SUM(weightKg),0) outWeightKg, COALESCE(SUM(qty),0) inQty, COALESCE(SUM(weightKg),0) inWeightKg FROM transfers WHERE shipmentItemId=?`).get(itemId) as any) || { outQty: 0, outWeightKg: 0, inQty: 0, inWeightKg: 0 };
const bal = (i: ShipmentItemRow) => { const r = rel(i.id), t = tr(i.id); return { releasedQty: r.qty, releasedWeightKg: r.weightKg, transferredOutQty: t.outQty, transferredInQty: t.inQty, availableQty: i.receivedQty - r.qty - t.outQty + t.inQty, availableWeightKg: i.receivedWeightKg - r.weightKg - t.outWeightKg + t.inWeightKg }; };
const trs = () => db.query(`SELECT id, shipmentItemId, fromWarehouseId, toWarehouseId, qty, weightKg FROM transfers`).all() as any[];
const util = () => {
  const ws = whs(), t: Record<number, { q: number; w: number }> = {};
  for (const w of ws) t[w.id] = { q: 0, w: 0 };
  for (const i of db.query(`SELECT * FROM shipment_items`).all() as ShipmentItemRow[]) { const r = rel(i.id); t[i.warehouseId].q += i.receivedQty - r.qty; t[i.warehouseId].w += i.receivedWeightKg - r.weightKg; }
  for (const x of trs()) { t[x.fromWarehouseId].q -= x.qty; t[x.fromWarehouseId].w -= x.weightKg; t[x.toWarehouseId].q += x.qty; t[x.toWarehouseId].w += x.weightKg; }
  return ws.map(w => ({ warehouseId: w.id, warehouseCode: w.code, warehouseName: w.name, usedQty: Number((t[w.id]?.q || 0).toFixed(2)), usedWeightKg: Number((t[w.id]?.w || 0).toFixed(2)), capacityQty: w.capacityQty, capacityWeightKg: w.capacityWeightKg }));
};
const canFit = (warehouseId: number, q: number, w: number) => { const u = util().find(x => x.warehouseId === warehouseId); return !!u && u.usedQty + q <= u.capacityQty + 0.0001 && u.usedWeightKg + w <= u.capacityWeightKg + 0.0001; };
const itemWhBal = (itemId: number, warehouseId: number) => { const i = db.query(`SELECT * FROM shipment_items WHERE id=?`).get(itemId) as ShipmentItemRow | null; if (!i) return { qty: 0, weightKg: 0 }; const r = rel(itemId); let q = i.warehouseId === warehouseId ? i.receivedQty - r.qty : 0; let w = i.warehouseId === warehouseId ? i.receivedWeightKg - r.weightKg : 0; for (const t of db.query(`SELECT fromWarehouseId,toWarehouseId,qty,weightKg FROM transfers WHERE shipmentItemId=? ORDER BY id`).all(itemId) as any[]) { if (t.fromWarehouseId === warehouseId) { q -= t.qty; w -= t.weightKg; } if (t.toWarehouseId === warehouseId) { q += t.qty; w += t.weightKg; } } return { qty: q, weightKg: w }; };
const hsMap = () => { const o: Record<number, string[]> = {}; for (const r of db.query(`SELECT shipmentId, hsCode FROM shipment_items`).all() as any[]) { if (!o[r.shipmentId]) o[r.shipmentId] = []; o[r.shipmentId].push(String(r.hsCode).toLowerCase()); } const f: Record<number, string> = {}; for (const [k, v] of Object.entries(o)) f[Number(k)] = v.join(" "); return f; };
const topHs = (n = 5) => db.query(`SELECT hsCode, ROUND(SUM(declaredValue),2) totalValue FROM shipment_items GROUP BY hsCode ORDER BY totalValue DESC LIMIT ?`).all(n) as { hsCode: string; totalValue: number }[];
const rebuildHash = (st: SessionState, xs: ShipmentSummary[]) => { const h = new HashTable<ShipmentSummary>(); xs.forEach(x => h.set(x.referenceNo, x)); st.shipmentHashTable = h; };
const rebuildBST = (st: SessionState, xs: ShipmentSummary[]) => { const b = new BST(); xs.forEach(x => b.insert(x.totalValue, x.id)); st.valueBST = b; };
const rebuildGraph = (st: SessionState) => { const g = new Graph(); whs().forEach(w => g.addNode(w.id)); trs().forEach(t => g.addEdge(t.fromWarehouseId, t.toWarehouseId)); st.transferGraph = g; };

const undo = (st: SessionState) => {
  const a = st.undoStack.pop(); if (!a) return { ok: false, message: "Undo stack is empty" };
  if (a.type === "RELEASE") {
    const ex = db.query(`SELECT id FROM releases WHERE id=?`).get(a.releaseId) as any; if (!ex) return { ok: false, message: "Release already removed" };
    const gw: Record<number, { q: number; w: number }> = {};
    for (const l of a.lines) { const it = db.query(`SELECT warehouseId FROM shipment_items WHERE id=?`).get(l.shipmentItemId) as any; if (!it) continue; if (!gw[it.warehouseId]) gw[it.warehouseId] = { q: 0, w: 0 }; gw[it.warehouseId].q += l.qty; gw[it.warehouseId].w += l.weightKg; }
    for (const [k, v] of Object.entries(gw)) if (!canFit(Number(k), v.q, v.w)) { st.undoStack.push(a); return { ok: false, message: "Undo blocked by capacity" }; }
    db.transaction(() => { db.query(`DELETE FROM release_items WHERE releaseId=?`).run(a.releaseId); db.query(`DELETE FROM releases WHERE id=?`).run(a.releaseId); db.query(`UPDATE shipments SET status='CLEARED' WHERE id=?`).run(a.shipmentId); })();
    addLog(st, `Undo RELEASE ${a.releaseNo}`); return { ok: true, message: `Undid release ${a.releaseNo}` };
  }
  const ex = db.query(`SELECT id FROM transfers WHERE id=?`).get(a.transferId) as any; if (!ex) return { ok: false, message: "Transfer already removed" };
  if (!canFit(a.fromWarehouseId, a.qty, a.weightKg)) { st.undoStack.push(a); return { ok: false, message: "Undo blocked by source capacity" }; }
  db.query(`DELETE FROM transfers WHERE id=?`).run(a.transferId); addLog(st, `Undo TRANSFER #${a.transferId}`); return { ok: true, message: `Undid transfer #${a.transferId}` };
};

type H = (req: Request, url: URL, p: Record<string, string>, st: SessionState) => Promise<Response> | Response;
const R: { m: string; p: string; h: H }[] = [
  {
    m: "GET", p: "/login", h: (_r, u, _p, st) => {
      if (st.authenticated) return redir("/dashboard");
      return html(renderLoginPage({ ...unflash(u), defaultUsername: AUTH_USERNAME }));
    }
  },
  {
    m: "POST", p: "/login", h: async (req, _u, _p, st) => {
      try {
        const d = await pForm(req);
        const username = requireString(d.username, "Username", 64);
        const password = requireString(d.password, "Password", 128);
        if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
          throw new ValidationError("Invalid username or password");
        }
        st.authenticated = true;
        st.username = username;
        addNotification(st, "Login successful. Welcome to the customs dashboard.");
        return redir(flash("/dashboard", { notice: `Welcome, ${username}` }));
      } catch (e) {
        return redir(flash("/login", { error: e instanceof Error ? e.message : "Login failed" }));
      }
    }
  },
  {
    m: "POST", p: "/logout", h: (_r, _u, _p, st) => {
      st.authenticated = false;
      st.username = null;
      st.notifications = [];
      return redir(flash("/login", { notice: "Logged out successfully" }));
    }
  },
  { m: "GET", p: "/", h: (_r, u) => html(renderHomePage(unflash(u))) },
  {
    m: "GET", p: "/dashboard", h: (_r, u) => {
      const f = unflash(u), ss = shipments();
      const ui = db.query(`SELECT COUNT(*) c FROM shipments WHERE status='UNDER_INSPECTION'`).get() as any;
      const oh = db.query(`SELECT COUNT(*) c FROM shipments WHERE status='ON_HOLD'`).get() as any;
      let aq = 0, aw = 0; for (const i of db.query(`SELECT * FROM shipment_items`).all() as ShipmentItemRow[]) { const b = bal(i); aq += b.availableQty; aw += b.availableWeightKg; }
      const daily = db.query(`SELECT arrivalDate, COUNT(*) count FROM shipments GROUP BY arrivalDate ORDER BY arrivalDate DESC LIMIT 10`).all() as any[];
      const holds = db.query(`SELECT s.referenceNo, s.importerName, h.reason, h.requiredDocs FROM holds h JOIN shipments s ON s.id=h.shipmentId ORDER BY h.id DESC LIMIT 20`).all() as any[];
      const d = Number(u.searchParams.get("days") || "7"), now = Date.now();
      const aging = (db.query(`SELECT referenceNo,status,arrivalDate FROM shipments WHERE status IN ('ON_HOLD','UNDER_INSPECTION')`).all() as any[]).map(x => ({ referenceNo: x.referenceNo, status: x.status, ageDays: Math.floor((now - new Date(`${x.arrivalDate}T00:00:00Z`).getTime()) / 86400000) })).filter(x => x.ageDays > d);
      return html(renderDashboardPage({ ...f, kpi: { totalShipments: ss.length, underInspection: ui.c, onHold: oh.c, totalAvailableQty: aq, totalAvailableWeight: aw }, utilization: util(), dailyArrivals: daily, holdRows: holds, topHsCodes: topHs(5), agingRows: aging }));
    }
  },
  {
    m: "GET", p: "/shipments", h: (_r, u, _p, st) => {
      const f = unflash(u), q = cleanQuery(u.searchParams.get("q")), field = u.searchParams.get("field") || "reference", searchAlgo = u.searchParams.get("searchAlgo") || "linear", sortField = u.searchParams.get("sortField") || "arrivalDate", sortAlgo = (u.searchParams.get("sortAlgo") || "quick") as SortAlgorithm, quickRef = (u.searchParams.get("quickRef") || "").trim();
      const ss = shipments(); rebuildHash(st, ss); const hsm = hsMap();
      const sorted = sortByAlgorithm(sortAlgo, ss, (a, b) => sortField === "arrivalDate" ? a.arrivalDate.localeCompare(b.arrivalDate) : sortField === "totalQty" ? a.totalQty - b.totalQty : a.totalValue - b.totalValue);
      let rows = sorted;
      if (q) {
        if (searchAlgo === "binary" && (field === "value" || field === "quantity")) {
          const t = Number(q), c = Number.isFinite(t) ? binarySearchExact(sorted, t, x => field === "value" ? x.totalValue : x.totalQty) : null; rows = c ? [c] : [];
        } else rows = linearSearch(sorted, x => field === "reference" ? x.referenceNo.toLowerCase().includes(q) : field === "importer" ? x.importerName.toLowerCase().includes(q) : field === "vessel" ? x.vesselName.toLowerCase().includes(q) : field === "hs" ? (hsm[x.id] || "").includes(q) : field === "value" ? String(x.totalValue).includes(q) : String(x.totalQty).includes(q));
      }
      return html(renderShipmentsListPage({ ...f, shipments: rows, query: q, searchField: field, searchAlgorithm: searchAlgo, sortField, sortAlgorithm: sortAlgo, quickFindReference: quickRef, quickFindResult: quickRef ? st.shipmentHashTable.get(quickRef) || null : null }));
    }
  },
  { m: "GET", p: "/shipments/new", h: (_r, u) => html(renderShipmentNewPage(unflash(u))) },
  {
    m: "POST", p: "/shipments", h: async (req, _u, _p, st) => {
      try { const d = await pForm(req); const referenceNo = requireString(d.referenceNo, "Reference No", 40), vesselName = requireString(d.vesselName, "Vessel Name", 80), arrivalDate = requireDate(d.arrivalDate, "Arrival Date"), originCountry = requireString(d.originCountry, "Origin Country", 80), importerName = requireString(d.importerName, "Importer Name", 120);
        db.transaction(() => { db.query(`INSERT INTO shipments(referenceNo,vesselName,arrivalDate,originCountry,importerName,status,createdAt) VALUES(?,?,?,?,?,'ARRIVED',?)`).run(referenceNo, vesselName, arrivalDate, originCountry, importerName, toIsoNow()); const c = db.query(`SELECT id FROM shipments WHERE referenceNo=?`).get(referenceNo) as any; st.inspectionQueue.enqueue(c.id); })();
        addLog(st, `Created shipment ${referenceNo} and enqueued`); return redir(flash("/shipments", { notice: `Shipment ${referenceNo} created` }));
      } catch (e) { return redir(flash("/shipments/new", { error: e instanceof Error ? e.message : "Failed" })); }
    }
  },
  {
    m: "GET", p: "/shipments/:id", h: (_r, u, p) => {
      const f = unflash(u), id = Number(p.id), s = shipment(id); if (!s) return html(pageLayout({ title: "Not Found", error: "Shipment not found", content: "" }), 404);
      const sf = u.searchParams.get("itemSortField") || "quantity", sa = (u.searchParams.get("itemSortAlgo") || "quick") as SortAlgorithm, hs = (u.searchParams.get("hs") || "").trim();
      const is = itemRows(id).map(i => ({ ...i, ...bal(i) }));
      const sorted = sortByAlgorithm(sa, is, (a, b) => sf === "value" ? a.declaredValue - b.declaredValue : a.receivedQty - b.receivedQty);
      const ht = new HashTable<any>(); sorted.forEach(i => ht.set(i.hsCode, i));
      return html(renderShipmentViewPage({ ...f, shipment: s, items: sorted, itemSortField: sf, itemSortAlgorithm: sa, hsQuickFind: hs, hsQuickFindItem: hs ? ht.get(hs) || null : null }));
    }
  },
  {
    m: "POST", p: "/shipments/:id/delete", h: (_r, _u, p, st) => {
      const id = Number(p.id), s = shipment(id); if (!s) return redir(flash("/shipments", { error: "Shipment not found" }));
      const rc = (db.query(`SELECT COUNT(*) c FROM releases WHERE shipmentId=?`).get(id) as any).c; const tc = (db.query(`SELECT COUNT(*) c FROM transfers t JOIN shipment_items si ON si.id=t.shipmentItemId WHERE si.shipmentId=?`).get(id) as any).c;
      if (rc > 0 || tc > 0) return redir(flash("/shipments", { error: "Cannot delete shipment with release/transfer history" }));
      db.query(`DELETE FROM shipments WHERE id=?`).run(id); addLog(st, `Deleted shipment ${s.referenceNo}`); return redir(flash("/shipments", { notice: `Deleted ${s.referenceNo}` }));
    }
  },
  {
    m: "GET", p: "/items/add", h: (_r, u) => {
      const f = unflash(u), shipmentId = Number(u.searchParams.get("shipmentId")), s = shipment(shipmentId); if (!s) return redir(flash("/shipments", { error: "Shipment not found" }));
      const opts = whs().map(w => `<option value="${w.id}">${escapeHtml(w.code)} - ${escapeHtml(w.name)}</option>`).join("");
      return html(pageLayout({ title: "Add Item", ...f, content: `<section class="rounded-xl bg-white p-6 shadow"><h1 class="text-2xl font-bold">Add Cargo Item to ${escapeHtml(s.referenceNo)}</h1><form method="POST" action="/items" class="mt-4 grid gap-4 md:grid-cols-2"><input type="hidden" name="shipmentId" value="${shipmentId}" /><label class="text-sm font-medium">HS Code <input required name="hsCode" class="mt-1 w-full rounded border px-3 py-2" /></label><label class="text-sm font-medium">Item Name <input required name="itemName" class="mt-1 w-full rounded border px-3 py-2" /></label><label class="text-sm font-medium">Unit<select required name="unit" class="mt-1 w-full rounded border px-3 py-2"><option value="pcs">pcs</option><option value="kg">kg</option></select></label><label class="text-sm font-medium">Quantity <input required type="number" step="0.01" min="0.01" name="quantity" class="mt-1 w-full rounded border px-3 py-2" /></label><label class="text-sm font-medium">Weight (kg) <input required type="number" step="0.01" min="0.01" name="weightKg" class="mt-1 w-full rounded border px-3 py-2" /></label><label class="text-sm font-medium">Declared Value <input required type="number" step="0.01" min="0" name="declaredValue" class="mt-1 w-full rounded border px-3 py-2" /></label><label class="text-sm font-medium md:col-span-2">Warehouse<select required name="warehouseId" class="mt-1 w-full rounded border px-3 py-2"><option value="">Select warehouse</option>${opts}</select></label><div class="md:col-span-2"><button class="rounded bg-cyan-700 px-4 py-2 font-semibold text-white">Add Item</button></div></form></section>` }));
    }
  },
  {
    m: "POST", p: "/items", h: async (req, _u, _p, st) => {
      const d = await pForm(req);
      try { const shipmentId = requireInteger(d.shipmentId, "Shipment ID"); const s = shipment(shipmentId); if (!s) throw new ValidationError("Shipment not found"); const hsCode = requireString(d.hsCode, "HS Code", 40), itemName = requireString(d.itemName, "Item Name", 120), unit = requireEnum(d.unit, "Unit", ["pcs", "kg"]), quantity = requireNumber(d.quantity, "Quantity", 0.01), weightKg = requireNumber(d.weightKg, "Weight", 0.01), declaredValue = requireNumber(d.declaredValue, "Declared Value", 0), warehouseId = requireInteger(d.warehouseId, "Warehouse"); if (!canFit(warehouseId, quantity, weightKg)) throw new ValidationError("Warehouse capacity exceeded for quantity or weight"); db.query(`INSERT INTO shipment_items(shipmentId,hsCode,itemName,unit,receivedQty,receivedWeightKg,declaredValue,warehouseId,createdAt) VALUES(?,?,?,?,?,?,?,?,?)`).run(shipmentId, hsCode, itemName, unit, quantity, weightKg, declaredValue, warehouseId, toIsoNow()); addLog(st, `Added item ${hsCode} to shipment ${s.referenceNo}`); return redir(flash(`/shipments/${shipmentId}`, { notice: "Item added" })); }
      catch (e) { return redir(flash(`/items/add?shipmentId=${Number(d.shipmentId || "0")}`, { error: e instanceof Error ? e.message : "Failed" })); }
    }
  },
  {
    m: "POST", p: "/items/:id/delete", h: (_r, _u, p, st) => {
      const itemId = Number(p.id), i = db.query(`SELECT id,shipmentId,hsCode FROM shipment_items WHERE id=?`).get(itemId) as any; if (!i) return redir(flash("/shipments", { error: "Item not found" }));
      const rc = (db.query(`SELECT COUNT(*) c FROM release_items WHERE shipmentItemId=?`).get(itemId) as any).c, tc = (db.query(`SELECT COUNT(*) c FROM transfers WHERE shipmentItemId=?`).get(itemId) as any).c;
      if (rc > 0 || tc > 0) return redir(flash(`/shipments/${i.shipmentId}`, { error: "Cannot delete item with release/transfer history" }));
      db.query(`DELETE FROM shipment_items WHERE id=?`).run(itemId); addLog(st, `Deleted item ${i.hsCode}`); return redir(flash(`/shipments/${i.shipmentId}`, { notice: "Item deleted" }));
    }
  },
  {
    m: "GET", p: "/warehouses", h: (_r, u) => {
      const warehouses = util().map((w) => ({
        id: w.warehouseId,
        code: w.warehouseCode,
        name: w.warehouseName,
        capacityQty: w.capacityQty,
        capacityWeightKg: w.capacityWeightKg,
        usedQty: w.usedQty,
        usedWeightKg: w.usedWeightKg,
      }));
      return html(renderWarehousesPage({ ...unflash(u), warehouses }));
    }
  },
  {
    m: "POST", p: "/warehouses", h: async (req, _u, _p, st) => {
      try { const d = await pForm(req), id = Number(d.id || "0"), code = requireString(d.code, "Code", 30), name = requireString(d.name, "Name", 120), capacityQty = requireNumber(d.capacityQty, "Capacity Qty", 0), capacityWeightKg = requireNumber(d.capacityWeightKg, "Capacity Weight", 0);
        if (id > 0) { db.query(`UPDATE warehouses SET code=?,name=?,capacityQty=?,capacityWeightKg=? WHERE id=?`).run(code, name, capacityQty, capacityWeightKg, id); addLog(st, `Updated warehouse ${code}`); return redir(flash("/warehouses", { notice: `Warehouse ${code} updated` })); }
        db.query(`INSERT INTO warehouses(code,name,capacityQty,capacityWeightKg,createdAt) VALUES(?,?,?,?,?)`).run(code, name, capacityQty, capacityWeightKg, toIsoNow()); addLog(st, `Created warehouse ${code}`); return redir(flash("/warehouses", { notice: `Warehouse ${code} created` }));
      } catch (e) { return redir(flash("/warehouses", { error: e instanceof Error ? e.message : "Failed" })); }
    }
  },
  {
    m: "POST", p: "/warehouses/:id/delete", h: (_r, _u, p, st) => {
      const id = Number(p.id), inI = (db.query(`SELECT COUNT(*) c FROM shipment_items WHERE warehouseId=?`).get(id) as any).c, inT = (db.query(`SELECT COUNT(*) c FROM transfers WHERE fromWarehouseId=? OR toWarehouseId=?`).get(id, id) as any).c;
      if (inI > 0 || inT > 0) return redir(flash("/warehouses", { error: "Cannot delete warehouse with item/transfer history" }));
      const w = db.query(`SELECT code FROM warehouses WHERE id=?`).get(id) as any; db.query(`DELETE FROM warehouses WHERE id=?`).run(id); addLog(st, `Deleted warehouse ${w?.code || id}`); return redir(flash("/warehouses", { notice: "Warehouse deleted" }));
    }
  },
  {
    m: "GET", p: "/workflow", h: (_r, u, _p, st) => {
      const q = st.inspectionQueue.toArray().map(id => { const s = shipment(id); return { shipmentId: id, referenceNo: s?.referenceNo || `#${id}`, importerName: s?.importerName || "Unknown", status: s?.status || "N/A" }; });
      const arrivals = db.query(`SELECT id,referenceNo FROM shipments WHERE status IN ('ARRIVED','UNDER_INSPECTION','ON_HOLD','CLEARED') ORDER BY id DESC`).all() as any[];
      return html(renderWorkflowPage({ ...unflash(u), queueRows: q, arrivals }));
    }
  },
  {
    m: "POST", p: "/workflow/enqueue", h: async (req, _u, _p, st) => {
      try { const d = await pForm(req), id = requireInteger(d.shipmentId, "Shipment ID"), s = shipment(id); if (!s) throw new ValidationError("Shipment not found"); if (!st.inspectionQueue.toArray().includes(id)) st.inspectionQueue.enqueue(id); db.query(`UPDATE shipments SET status='ARRIVED' WHERE id=?`).run(id); addLog(st, `Enqueued shipment ${s.referenceNo}`); return redir(flash("/workflow", { notice: `${s.referenceNo} queued` })); }
      catch (e) { return redir(flash("/workflow", { error: e instanceof Error ? e.message : "Failed" })); }
    }
  },
  { m: "POST", p: "/workflow/inspect-next", h: (_r, _u, _p, st) => { const id = st.inspectionQueue.dequeue(); if (!id) return redir(flash("/workflow", { error: "Queue is empty" })); db.query(`UPDATE shipments SET status='UNDER_INSPECTION' WHERE id=?`).run(id); addLog(st, `Dequeued shipment #${id}`); return redir(`/inspect/${id}`); } },
  { m: "GET", p: "/inspect/:shipmentId", h: (_r, u, p) => { const s = shipment(Number(p.shipmentId)); if (!s) return redir(flash("/workflow", { error: "Shipment not found" })); return html(renderInspectPage({ ...unflash(u), shipment: s })); } },
  {
    m: "POST", p: "/inspect/:shipmentId", h: async (req, _u, p, st) => {
      try { const id = Number(p.shipmentId), s = shipment(id); if (!s) throw new ValidationError("Shipment not found"); const d = await pForm(req), out = requireEnum(d.outcome, "Outcome", ["PASS", "HOLD", "RECHECK"]), notes = optionalString(d.notes, 300); db.query(`INSERT INTO inspections(shipmentId,status,notes,inspectedAt) VALUES(?,?,?,?) ON CONFLICT(shipmentId) DO UPDATE SET status=excluded.status, notes=excluded.notes, inspectedAt=excluded.inspectedAt`).run(id, out, notes, toIsoNow());
        if (out === "PASS") { db.query(`UPDATE shipments SET status='CLEARED' WHERE id=?`).run(id); addLog(st, `Inspection PASS for ${s.referenceNo}`); return redir(flash("/workflow", { notice: `${s.referenceNo} marked CLEARED` })); }
        if (out === "HOLD") { const reason = requireString(d.reason, "Hold reason", 200), requiredDocs = requireString(d.requiredDocs, "Required documents", 200); db.query(`UPDATE shipments SET status='ON_HOLD' WHERE id=?`).run(id); db.query(`INSERT INTO holds(shipmentId,reason,requiredDocs,createdAt) VALUES(?,?,?,?)`).run(id, reason, requiredDocs, toIsoNow()); addLog(st, `Inspection HOLD for ${s.referenceNo}: ${reason}`); return redir(flash("/workflow", { notice: `${s.referenceNo} placed ON_HOLD` })); }
        st.inspectionQueue.enqueue(id); db.query(`UPDATE shipments SET status='UNDER_INSPECTION' WHERE id=?`).run(id); addLog(st, `Inspection RECHECK for ${s.referenceNo}`); return redir(flash("/workflow", { notice: `${s.referenceNo} moved to queue end` }));
      } catch (e) { return redir(flash(`/inspect/${p.shipmentId}`, { error: e instanceof Error ? e.message : "Failed" })); }
    }
  },
  {
    m: "GET", p: "/release/new", h: (_r, u) => {
      const shipmentId = Number(u.searchParams.get("shipmentId")), s = shipment(shipmentId); if (!s) return redir(flash("/shipments", { error: "Shipment not found" }));
      const items = itemRows(shipmentId).map(i => { const b = bal(i); return { id: i.id, hsCode: i.hsCode, itemName: i.itemName, unit: i.unit, availableQty: Number(b.availableQty.toFixed(2)), availableWeightKg: Number(b.availableWeightKg.toFixed(2)), declaredValue: i.declaredValue }; }).filter(i => i.availableQty > 0.0001);
      return html(renderReleaseNewPage({ ...unflash(u), shipment: { id: s.id, referenceNo: s.referenceNo }, items }));
    }
  },
  {
    m: "POST", p: "/release", h: async (req, _u, _p, st) => {
      const d = await pForm(req);
      try {
        const shipmentId = requireInteger(d.shipmentId, "Shipment ID"), s = shipment(shipmentId); if (!s) throw new ValidationError("Shipment not found");
        const releaseNo = requireString(d.releaseNo, "Release No", 50), releasedAt = dt(requireString(d.releasedAt, "Released At", 40)), officerName = requireString(d.officerName, "Officer Name", 120);
        const rows = itemRows(shipmentId), lines: { shipmentItemId: number; qty: number; weightKg: number; value: number }[] = [];
        for (const i of rows) { const q = Number(d[`releaseQty_${i.id}`] || "0"); if (!Number.isFinite(q) || q <= 0) continue; const b = bal(i); if (q > b.availableQty + 0.0001) throw new ValidationError(`Cannot release more than available for ${i.hsCode}`); const uw = i.receivedQty > 0 ? i.receivedWeightKg / i.receivedQty : 0, uv = i.receivedQty > 0 ? i.declaredValue / i.receivedQty : 0; lines.push({ shipmentItemId: i.id, qty: q, weightKg: Number((q * uw).toFixed(2)), value: Number((q * uv).toFixed(2)) }); }
        if (!lines.length) throw new ValidationError("Provide at least one release quantity > 0");
        let releaseId = 0; db.transaction(() => { const r = db.query(`INSERT INTO releases(shipmentId,releaseNo,releasedAt,officerName) VALUES(?,?,?,?)`).run(shipmentId, releaseNo, releasedAt, officerName) as any; releaseId = Number(r.lastInsertRowid); lines.forEach(l => db.query(`INSERT INTO release_items(releaseId,shipmentItemId,qty,weightKg,value) VALUES(?,?,?,?,?)`).run(releaseId, l.shipmentItemId, l.qty, l.weightKg, l.value)); })();
        const still = itemRows(shipmentId).some(i => bal(i).availableQty > 0.0001); db.query(`UPDATE shipments SET status=? WHERE id=?`).run(still ? "CLEARED" : "RELEASED", shipmentId);
        st.undoStack.push({ type: "RELEASE", releaseId, releaseNo, shipmentId, lines }); addLog(st, `Created release ${releaseNo} for shipment ${s.referenceNo}`); return redir(flash(`/release/${releaseId}`, { notice: `Release ${releaseNo} created` }));
      } catch (e) { return redir(flash(`/release/new?shipmentId=${Number(d.shipmentId || "0")}`, { error: e instanceof Error ? e.message : "Failed" })); }
    }
  },
  {
    m: "GET", p: "/release/:id", h: (_r, _u, p) => {
      const id = Number(p.id), r = db.query(`SELECT r.id,r.releaseNo,r.releasedAt,r.officerName,s.referenceNo,s.importerName,s.vesselName FROM releases r JOIN shipments s ON s.id=r.shipmentId WHERE r.id=?`).get(id) as any;
      if (!r) return html(pageLayout({ title: "Release Note", error: "Release not found", content: "" }), 404);
      const items = db.query(`SELECT si.hsCode,si.itemName,ri.qty,ri.weightKg,ri.value FROM release_items ri JOIN shipment_items si ON si.id=ri.shipmentItemId WHERE ri.releaseId=?`).all(id) as any[];
      return html(renderReleaseNotePage({ release: r, items }));
    }
  },
  { m: "POST", p: "/release/undo", h: (req, _u, _p, st) => { const x = undo(st); return redir(flash(back(req, "/dsa-demo"), x.ok ? { notice: x.message } : { error: x.message })); } },
  {
    m: "GET", p: "/transfer/new", h: (_r, u) => {
      const itemId = Number(u.searchParams.get("itemId"));
      const i = db.query(`SELECT si.id,si.hsCode,si.itemName,si.warehouseId,si.shipmentId,w.code warehouseCode,si.receivedQty,si.receivedWeightKg FROM shipment_items si JOIN warehouses w ON w.id=si.warehouseId WHERE si.id=?`).get(itemId) as any;
      if (!i) return redir(flash("/shipments", { error: "Item not found" }));
      const b = itemWhBal(itemId, i.warehouseId), ws = whs().map(w => ({ id: w.id, code: w.code, name: w.name }));
      return html(renderTransferNewPage({ ...unflash(u), item: { id: i.id, hsCode: i.hsCode, itemName: i.itemName, availableQty: Number(b.qty.toFixed(2)), availableWeightKg: Number(b.weightKg.toFixed(2)), fromWarehouseId: i.warehouseId, fromWarehouseCode: i.warehouseCode }, warehouses: ws }));
    }
  },
  {
    m: "POST", p: "/transfer", h: async (req, _u, _p, st) => {
      const d = await pForm(req);
      try { const shipmentItemId = requireInteger(d.shipmentItemId, "Item ID"), fromWarehouseId = requireInteger(d.fromWarehouseId, "From Warehouse"), toWarehouseId = requireInteger(d.toWarehouseId, "To Warehouse"), qty = requireNumber(d.qty, "Qty", 0.01), weightKg = requireNumber(d.weightKg, "Weight", 0.01), transferredAt = dt(requireString(d.transferredAt, "Transferred At", 40));
        if (fromWarehouseId === toWarehouseId) throw new ValidationError("Source and destination warehouse cannot match");
        const i = db.query(`SELECT id,shipmentId,hsCode FROM shipment_items WHERE id=?`).get(shipmentItemId) as any; if (!i) throw new ValidationError("Item not found");
        const fb = itemWhBal(shipmentItemId, fromWarehouseId); if (qty > fb.qty + 0.0001 || weightKg > fb.weightKg + 0.0001) throw new ValidationError("Transfer exceeds available stock in source warehouse");
        if (!canFit(toWarehouseId, qty, weightKg)) throw new ValidationError("Destination warehouse capacity exceeded");
        const r = db.query(`INSERT INTO transfers(shipmentItemId,fromWarehouseId,toWarehouseId,qty,weightKg,transferredAt) VALUES(?,?,?,?,?,?)`).run(shipmentItemId, fromWarehouseId, toWarehouseId, qty, weightKg, transferredAt) as any;
        const transferId = Number(r.lastInsertRowid); st.undoStack.push({ type: "TRANSFER", transferId, shipmentItemId, fromWarehouseId, toWarehouseId, qty, weightKg }); addLog(st, `Transferred ${i.hsCode} qty ${qty} from #${fromWarehouseId} to #${toWarehouseId}`); return redir(flash(`/shipments/${i.shipmentId}`, { notice: `Transfer #${transferId} recorded` }));
      } catch (e) { return redir(flash(`/transfer/new?itemId=${Number(d.shipmentItemId || "0")}`, { error: e instanceof Error ? e.message : "Failed" })); }
    }
  },
  { m: "POST", p: "/transfer/undo", h: (req, _u, _p, st) => { const x = undo(st); return redir(flash(back(req, "/dsa-demo"), x.ok ? { notice: x.message } : { error: x.message })); } },
  {
    m: "GET", p: "/reports/value-range", h: (_r, u, _p, st) => {
      const ss = shipments(); rebuildBST(st, ss); const min = Number(u.searchParams.get("min") || "0"), max = Number(u.searchParams.get("max") || "1000000000");
      const ids = st.valueBST.range(min, max).map(x => x.shipmentId), rows = ss.filter(x => ids.includes(x.id));
      return html(renderReportsValueRangePage({ ...unflash(u), min, max, rows, bstNodeCount: st.valueBST.countNodes() }));
    }
  },
  {
    m: "GET", p: "/graph", h: (_r, u, _p, st) => {
      rebuildGraph(st); const ws = whs().map(w => ({ id: w.id, code: w.code, name: w.name }));
      const startId = Number(u.searchParams.get("startId") || ws[0]?.id || 0), algorithm = u.searchParams.get("algorithm") === "DFS" ? "DFS" : "BFS";
      return html(renderGraphPage({ ...unflash(u), warehouses: ws, startId, algorithm, reachable: startId ? st.transferGraph.reachableFrom(startId, algorithm as any) : [], adjacency: st.transferGraph.toAdjacencyList(), hasCycle: st.transferGraph.hasCycle() }));
    }
  },
  {
    m: "GET", p: "/dsa-demo", h: (_r, u, _p, st) => html(renderDsaDemoPage({ ...unflash(u), activityLast30: st.activityLinkedList.last(30).reverse(), activitySize: st.activityLinkedList.size(), undoStack: st.undoStack.toArray().map(a => a.type === "RELEASE" ? `RELEASE:${a.releaseNo}` : `TRANSFER:#${a.transferId}`), queue: st.inspectionQueue.toArray(), hashKeys: st.shipmentHashTable.keys(), bstNodeCount: st.valueBST.countNodes(), graphSummary: { nodes: st.transferGraph.nodeCount(), edges: st.transferGraph.edgeCount(), hasCycle: st.transferGraph.hasCycle() } }))
  },
  { m: "POST", p: "/dsa-demo/reset", h: (_r, _u, _p, st) => { st.activityLinkedList.clear(); st.activitySerialized = st.activityLinkedList.serialize(); st.undoStack.clear(); st.inspectionQueue.clear(); st.shipmentHashTable = new HashTable<ShipmentSummary>(); st.valueBST.clear(); st.transferGraph.clear(); addLog(st, "Session data structures reset"); return redir(flash("/dsa-demo", { notice: "Session DS reset" })); } },
  { m: "GET", p: "/notes", h: () => html(renderNotesPage()) },
  {
    m: "GET", p: "/api/session-state", h: (_r, _u, _p, st) => {
      const unreadCount = st.notifications.filter(n => !n.read).length;
      return json({
        authenticated: st.authenticated,
        username: st.username,
        notifications: st.notifications.slice(0, 20).map(n => ({ message: n.message, createdAt: n.createdAt })),
        unreadCount,
      });
    }
  },
  {
    m: "POST", p: "/api/session-state/clear", h: (_r, _u, _p, st) => {
      st.notifications = [];
      return json({ ok: true });
    }
  },
  { m: "GET", p: "/api/shipments", h: () => json(shipments()) },
  { m: "GET", p: "/api/shipments/:id", h: (_r, _u, p) => { const id = Number(p.id), s = shipment(id); if (!s) return json({ error: "Shipment not found" }, 404); return json({ shipment: s, items: itemRows(id).map(i => ({ ...i, ...bal(i) })) }); } },
  { m: "GET", p: "/api/reports/top-hs-codes", h: () => json(topHs(10)) },
];

Bun.serve({
  port: 3000,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/assets/")) { const file = Bun.file(`./public${url.pathname}`); if (await file.exists()) return new Response(file, { headers: { "Content-Type": url.pathname.endsWith(".css") ? "text/css; charset=utf-8" : "application/octet-stream" } }); return new Response("Not found", { status: 404 }); }
    const { sid, st } = session(req);
    const isPublicPath = url.pathname === "/login" || url.pathname === "/api/session-state" || url.pathname === "/api/session-state/clear";
    if (!st.authenticated && !isPublicPath) {
      return withSid(redir(flash("/login", { error: "Please login to access the system" })), sid);
    }
    if (st.authenticated && url.pathname === "/login" && req.method === "GET") {
      return withSid(redir("/dashboard"), sid);
    }
    for (const r of R) if (r.m === req.method) { const p = match(r.p, url.pathname); if (p) try { const out = await r.h(req, url, p, st); store.set(sid, st); return withSid(out, sid); } catch (e) { return withSid(html(pageLayout({ title: "Error", error: e instanceof Error ? e.message : "Server error", content: "<p class='text-sm text-slate-600'>Request failed.</p>" }), 500), sid); } }
    return withSid(html(pageLayout({ title: "404", error: "Page not found", content: "" }), 404), sid);
  },
});

console.log("Port Customs Stock Management System running at http://localhost:3000");
