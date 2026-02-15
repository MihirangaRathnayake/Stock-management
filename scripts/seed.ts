import { db, initDb } from "../src/db";

initDb();

const now = () => new Date().toISOString();

const clear = db.transaction(() => {
  db.exec(`
    DELETE FROM release_items;
    DELETE FROM releases;
    DELETE FROM transfers;
    DELETE FROM holds;
    DELETE FROM inspections;
    DELETE FROM shipment_items;
    DELETE FROM shipments;
    DELETE FROM warehouses;
    DELETE FROM sqlite_sequence;
  `);
});

const seed = db.transaction(() => {
  const warehouses = [
    ["BW-01", "North Bonded Yard", 15000, 120000],
    ["BW-02", "East Reefer Zone", 9000, 70000],
    ["BW-03", "Container Shed C", 20000, 180000],
  ];

  for (const w of warehouses) {
    db.query(`INSERT INTO warehouses(code, name, capacityQty, capacityWeightKg, createdAt) VALUES(?, ?, ?, ?, ?)`)
      .run(w[0], w[1], w[2], w[3], now());
  }

  const shipments = [
    ["REF-1001", "MV Ocean Pride", "2026-02-01", "Singapore", "Apex Imports", "ARRIVED"],
    ["REF-1002", "MV Harbor Star", "2026-02-02", "India", "Blue Trade", "UNDER_INSPECTION"],
    ["REF-1003", "MV Pacific Link", "2026-02-03", "China", "Metro Cargo", "ON_HOLD"],
    ["REF-1004", "MV Titan Sea", "2026-02-04", "UAE", "Delta Exim", "CLEARED"],
    ["REF-1005", "MV Coral Sky", "2026-02-06", "Germany", "Northline", "RELEASED"],
    ["REF-1006", "MV Harbor One", "2026-02-07", "Japan", "Zen Importers", "ARRIVED"],
    ["REF-1007", "MV Cargo Path", "2026-02-08", "Korea", "Omni Global", "ON_HOLD"],
    ["REF-1008", "MV Silk Route", "2026-02-10", "Thailand", "Vertex Logistics", "CLEARED"],
  ];

  for (const s of shipments) {
    db.query(`INSERT INTO shipments(referenceNo, vesselName, arrivalDate, originCountry, importerName, status, createdAt) VALUES(?, ?, ?, ?, ?, ?, ?)`)
      .run(s[0], s[1], s[2], s[3], s[4], s[5], now());
  }

  const idByRefStmt = db.query(`SELECT id FROM shipments WHERE referenceNo = ?`);
  const whByCodeStmt = db.query(`SELECT id FROM warehouses WHERE code = ?`);
  const sid = (ref: string) => (idByRefStmt.get(ref) as { id: number }).id;
  const wid = (code: string) => (whByCodeStmt.get(code) as { id: number }).id;

  const items = [
    [sid("REF-1001"), "850110", "Industrial motors", "pcs", 1200, 30000, 420000, wid("BW-01")],
    [sid("REF-1001"), "730890", "Steel structures", "kg", 5000, 5000, 240000, wid("BW-03")],
    [sid("REF-1002"), "040210", "Milk powder", "kg", 2000, 2000, 90000, wid("BW-02")],
    [sid("REF-1002"), "300490", "Medical supplies", "pcs", 1400, 900, 150000, wid("BW-01")],
    [sid("REF-1003"), "870899", "Auto spare parts", "pcs", 3400, 6500, 380000, wid("BW-03")],
    [sid("REF-1004"), "854449", "Electric cables", "pcs", 8000, 12000, 210000, wid("BW-01")],
    [sid("REF-1005"), "100630", "Rice bags", "kg", 12000, 12000, 130000, wid("BW-03")],
    [sid("REF-1006"), "392690", "Plastic components", "pcs", 2600, 1800, 98000, wid("BW-02")],
    [sid("REF-1007"), "720839", "Coiled steel", "kg", 9000, 9000, 450000, wid("BW-03")],
    [sid("REF-1008"), "950300", "Toys", "pcs", 7600, 3200, 175000, wid("BW-01")],
  ];

  for (const i of items) {
    db.query(`INSERT INTO shipment_items(shipmentId, hsCode, itemName, unit, receivedQty, receivedWeightKg, declaredValue, warehouseId, createdAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], now());
  }

  db.query(`INSERT INTO inspections(shipmentId, status, notes, inspectedAt) VALUES(?, 'HOLD', 'Value discrepancy', ?)`)
    .run(sid("REF-1003"), now());
  db.query(`INSERT INTO inspections(shipmentId, status, notes, inspectedAt) VALUES(?, 'PASS', 'Cleared after document review', ?)`)
    .run(sid("REF-1004"), now());
  db.query(`INSERT INTO inspections(shipmentId, status, notes, inspectedAt) VALUES(?, 'HOLD', 'Missing origin certificate', ?)`)
    .run(sid("REF-1007"), now());

  db.query(`INSERT INTO holds(shipmentId, reason, requiredDocs, createdAt) VALUES(?, ?, ?, ?)`)
    .run(sid("REF-1003"), "Label mismatch", "Packing list, COO", now());
  db.query(`INSERT INTO holds(shipmentId, reason, requiredDocs, createdAt) VALUES(?, ?, ?, ?)`)
    .run(sid("REF-1007"), "Safety concern", "Test report, insurance", now());

  db.query(`INSERT INTO releases(shipmentId, releaseNo, releasedAt, officerName) VALUES(?, ?, ?, ?)`)
    .run(sid("REF-1005"), "REL-2026-0005", now(), "Officer Ranaweera");
  const relId = (db.query(`SELECT id FROM releases WHERE releaseNo = 'REL-2026-0005'`).get() as { id: number }).id;
  const riceItem = (db.query(`SELECT id FROM shipment_items WHERE shipmentId = ? LIMIT 1`).get(sid("REF-1005")) as { id: number }).id;
  db.query(`INSERT INTO release_items(releaseId, shipmentItemId, qty, weightKg, value) VALUES(?, ?, ?, ?, ?)`)
    .run(relId, riceItem, 5000, 5000, 54166.67);

  const motors = (db.query(`SELECT id FROM shipment_items WHERE hsCode = '850110' LIMIT 1`).get() as { id: number }).id;
  const cables = (db.query(`SELECT id FROM shipment_items WHERE hsCode = '854449' LIMIT 1`).get() as { id: number }).id;
  db.query(`INSERT INTO transfers(shipmentItemId, fromWarehouseId, toWarehouseId, qty, weightKg, transferredAt) VALUES(?, ?, ?, ?, ?, ?)`)
    .run(motors, wid("BW-01"), wid("BW-03"), 200, 5000, now());
  db.query(`INSERT INTO transfers(shipmentItemId, fromWarehouseId, toWarehouseId, qty, weightKg, transferredAt) VALUES(?, ?, ?, ?, ?, ?)`)
    .run(cables, wid("BW-01"), wid("BW-02"), 1000, 1500, now());
  db.query(`INSERT INTO transfers(shipmentItemId, fromWarehouseId, toWarehouseId, qty, weightKg, transferredAt) VALUES(?, ?, ?, ?, ?, ?)`)
    .run(cables, wid("BW-02"), wid("BW-01"), 200, 300, now());
});

clear();
seed();

console.log("Seed complete: warehouses=3, shipments=8 with holds/releases/transfers");
