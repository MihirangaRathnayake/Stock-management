# Viva Guide: Port Customs Stock Management (Bun + DSA)

## 1) 30-Second Project Intro
This is a Bun.js + SQLite SSR system for port customs bonded warehouse operations.  
It manages shipments, cargo items, inspections, holds, releases, and warehouse transfers.  
Core DSA structures and algorithms are used in real workflows, not isolated demos.

## 2) Core Business Flow
1. Shipment arrives -> created in `shipments` table -> queued for inspection (FIFO queue).
2. Items are added with warehouse assignment and capacity validation.
3. Inspection outcome:
   - `PASS` -> shipment `CLEARED`
   - `HOLD` -> shipment `ON_HOLD` + hold record
   - `RECHECK` -> re-enqueue shipment to queue end
4. Release and transfer operations update stock availability.
5. Reports and dashboards show operational status.

## 3) Stock Logic (important viva point)
`availableQty = receivedQty - releasedQty - transferredOut + transferredIn`

Applied in `src/server.ts` via item balance helpers before release/transfer validation and in dashboards/reports.

## 4) Data Structures: Where + Why

### Arrays + Objects
- Where: query result processing, KPI/report grouping, utilization calculations.
- Why: base structure for row transformations and summary computations.

### Singly Linked List
- File: `src/dsa/LinkedList.ts`
- Used in: session `activityLinkedList`
- Route usage: all key operations append audit events; displayed in `/dsa-demo`.
- Why: efficient append + clear traversal for activity timeline.

### Stack
- File: `src/dsa/Stack.ts`
- Used in: session `undoStack`
- Route usage: push on `/release` and `/transfer`; pop on `/release/undo` and `/transfer/undo`.
- Why: LIFO undo of last operation.

### Queue
- File: `src/dsa/Queue.ts`
- Used in: session `inspectionQueue`
- Route usage: `/workflow/enqueue`, `/workflow/inspect-next`, `/inspect/:shipmentId` with `RECHECK`.
- Why: FIFO processing of inspection workflow.

### Hash Table
- File: `src/dsa/HashTable.ts`
- Used in:
  - Shipment quick lookup by `referenceNo` on `/shipments`
  - HS code quick lookup inside shipment page
- Why: average O(1) key lookup.

### BST
- File: `src/dsa/BST.ts`
- Used in: `/reports/value-range`
- Behavior: builds tree from shipment `totalValue`; executes range query `[min, max]`.
- Why: ordered value search for range reporting.

### Graph (Adjacency List)
- File: `src/dsa/Graph.ts`
- Used in: `/graph`
- Data source: transfer edges (`fromWarehouseId -> toWarehouseId`)
- Algorithms: BFS/DFS traversal + cycle detection.
- Why: transfer network reachability and suspicious loop detection.

## 5) Algorithms: Where + Why

### Sorting (switchable from UI)
- File: `src/algorithms/sort.ts`
- Algorithms: Bubble, Insertion, Merge, Quick
- Used in:
  - Shipment list sorting (`arrivalDate`, `totalValue`, `totalQty`)
  - Shipment item sorting (`quantity`, `value`)

### Searching
- File: `src/algorithms/search.ts`
- Linear search:
  - Used for contains search by reference/importer/vessel/HS.
- Binary search:
  - Used for exact numeric search when list is sorted (`value` or `quantity`).

### Graph Algorithms
- BFS / DFS in `src/dsa/Graph.ts`, triggered by `/graph?algorithm=BFS|DFS`.

### Tree Algorithms
- BST insert/search/range traversal in `src/dsa/BST.ts`, used by value-range report.

## 6) Complexity Cheat Sheet
- Linked List append: O(1), traversal: O(n)
- Stack push/pop: O(1)
- Queue enqueue/dequeue: O(1) amortized
- Hash table get/set: O(1) average
- BST insert/search/range: O(log n) average, O(n) worst
- BFS/DFS: O(V + E)
- Bubble/Insertion sort: O(n^2)
- Merge sort: O(n log n)
- Quick sort: O(n log n) average, O(n^2) worst
- Linear search: O(n)
- Binary search: O(log n)

## 7) Database + Safety Talking Points
- SQLite with `bun:sqlite`.
- Tables auto-created at startup in `src/db.ts`.
- Prepared statements used with `db.query(...).run/get/all(...)`.
- Input validation centralized in `src/validation.ts`.
- Capacity and stock checks enforced before inserts.

## 8) Session Architecture
- Cookie: `sessionId`
- In-memory store: `Map<string, SessionState>`
- Session-scoped DS objects:
  - `activityLinkedList`
  - `undoStack`
  - `inspectionQueue`
  - cached `shipmentHashTable`, `valueBST`, `transferGraph`
- Reset endpoint: `POST /dsa-demo/reset`

## 9) Quick Demo Script (for viva)
1. Open `/shipments/new`, create shipment.
2. Add item from `/items/add`.
3. Go `/workflow`, enqueue and inspect-next.
4. Submit `RECHECK` once to prove queue reinsert.
5. Submit `HOLD` or `PASS`.
6. Go `/release/new` and do partial release.
7. Undo last action from release page.
8. Go `/transfer/new`, create transfer, then undo.
9. Show `/shipments` sort and search algorithm switching.
10. Show `/reports/value-range` (BST) and `/graph` BFS/DFS.
11. Open `/dsa-demo` to show DS states.

## 10) Common Viva Q&A (Short Answers)

### Q: Why use Queue for inspections?
A: Inspection is first-arrived, first-inspected. FIFO queue naturally models that rule.

### Q: Why Stack for undo?
A: Undo is “last action first reversed,” which is exactly LIFO.

### Q: Why Hash Table if DB already has indexes?
A: This demonstrates in-memory O(1) lookup in the active user session and supports DSA teaching goals.

### Q: Where is BST practically used?
A: In shipment declared-value range reporting, where ordered keys make interval queries efficient.

### Q: Why Graph here?
A: Warehouses and transfers are naturally a directed network; BFS/DFS show reachability and cycle detection flags suspicious loops.

### Q: How do you prevent invalid release?
A: Before insert, release quantity is checked against computed available balance; operation is rejected if it exceeds availability.

### Q: How do you enforce warehouse capacity?
A: Utilization is computed from received/released/transferred amounts; item add and transfer validate destination capacity before commit.

### Q: What is persistent vs session data?
A: Business records are persistent in SQLite; DSA operational state is session-scoped in memory (linked list/stack/queue and caches).

### Q: Why SSR instead of SPA?
A: Simpler architecture for viva scope, deterministic server-side rendering, and direct route-action mapping to DSA workflows.

### Q: Biggest tradeoff in this design?
A: Session store is in-memory (not distributed). Great for demo/viva, but for production it should move to Redis or DB-backed sessions.

## 11) If Asked “What would you improve?”
1. Replace in-memory session store with Redis for multi-instance scaling.
2. Add automated tests for stock/undo invariants and route-level integration.
3. Add role-based auth and immutable audit persistence in DB.
4. Introduce migrations and stronger typed DB access layer.
