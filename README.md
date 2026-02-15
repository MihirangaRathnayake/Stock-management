# Port Customs Stock Management System (Bun + DSA)

A Bun.js SSR web application for bonded warehouse customs operations that demonstrates real Data Structures and Algorithms in business workflows.

## Stack

- Bun runtime + `Bun.serve()`
- SQLite via `bun:sqlite`
- SSR HTML templates (no React)
- Tailwind CLI build (`bun run build:css`)
- Cookie session with in-memory `Map`

## Setup

```bash
bun install
bun run seed
bun run dev
```

Open: `http://localhost:3000`

## Features

- Shipment + cargo item management
- Warehouse utilization + capacity validation
- FIFO inspection queue with PASS/HOLD/RECHECK
- Partial release workflow with printable release note
- Transfer workflow with graph traversal (BFS/DFS)
- Reports: top HS, daily arrivals, hold stock, aging, BST value-range
- JSON APIs:
  - `GET /api/shipments`
  - `GET /api/shipments/:id`
  - `GET /api/reports/top-hs-codes`

## DSA Integration

- Linked List: audit activity feed
- Stack: undo release/transfer
- Queue: inspection FIFO
- Hash Table: quick lookup by shipment reference / HS quick find
- BST: declared value range queries
- Graph: transfer network traversal + cycle check

## Notes

- App uses prepared statements and input validation.
- Session-scoped DSA states are visible in `/dsa-demo` and resettable.
- Build CSS separately in watch mode with `bun run watch:css`.
- Viva quick guide: `README_VIVA.md`
