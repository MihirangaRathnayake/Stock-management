import { Database } from "bun:sqlite";

export const db = new Database("./port_customs.db", { create: true });

db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");

export function initDb(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      capacityQty REAL NOT NULL,
      capacityWeightKg REAL NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referenceNo TEXT UNIQUE NOT NULL,
      vesselName TEXT NOT NULL,
      arrivalDate TEXT NOT NULL,
      originCountry TEXT NOT NULL,
      importerName TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shipment_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipmentId INTEGER NOT NULL,
      hsCode TEXT NOT NULL,
      itemName TEXT NOT NULL,
      unit TEXT NOT NULL,
      receivedQty REAL NOT NULL,
      receivedWeightKg REAL NOT NULL,
      declaredValue REAL NOT NULL,
      warehouseId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(shipmentId) REFERENCES shipments(id) ON DELETE CASCADE,
      FOREIGN KEY(warehouseId) REFERENCES warehouses(id)
    );

    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipmentId INTEGER UNIQUE NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      inspectedAt TEXT NOT NULL,
      FOREIGN KEY(shipmentId) REFERENCES shipments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS holds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipmentId INTEGER NOT NULL,
      reason TEXT NOT NULL,
      requiredDocs TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(shipmentId) REFERENCES shipments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS releases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipmentId INTEGER NOT NULL,
      releaseNo TEXT UNIQUE NOT NULL,
      releasedAt TEXT NOT NULL,
      officerName TEXT NOT NULL,
      FOREIGN KEY(shipmentId) REFERENCES shipments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS release_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      releaseId INTEGER NOT NULL,
      shipmentItemId INTEGER NOT NULL,
      qty REAL NOT NULL,
      weightKg REAL NOT NULL,
      value REAL NOT NULL,
      FOREIGN KEY(releaseId) REFERENCES releases(id) ON DELETE CASCADE,
      FOREIGN KEY(shipmentItemId) REFERENCES shipment_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipmentItemId INTEGER NOT NULL,
      fromWarehouseId INTEGER NOT NULL,
      toWarehouseId INTEGER NOT NULL,
      qty REAL NOT NULL,
      weightKg REAL NOT NULL,
      transferredAt TEXT NOT NULL,
      FOREIGN KEY(shipmentItemId) REFERENCES shipment_items(id) ON DELETE CASCADE,
      FOREIGN KEY(fromWarehouseId) REFERENCES warehouses(id),
      FOREIGN KEY(toWarehouseId) REFERENCES warehouses(id)
    );
  `);
}

export type WarehouseRow = {
  id: number;
  code: string;
  name: string;
  capacityQty: number;
  capacityWeightKg: number;
  createdAt: string;
};

export type ShipmentRow = {
  id: number;
  referenceNo: string;
  vesselName: string;
  arrivalDate: string;
  originCountry: string;
  importerName: string;
  status: string;
  createdAt: string;
};

export type ShipmentItemRow = {
  id: number;
  shipmentId: number;
  hsCode: string;
  itemName: string;
  unit: string;
  receivedQty: number;
  receivedWeightKg: number;
  declaredValue: number;
  warehouseId: number;
  createdAt: string;
};
