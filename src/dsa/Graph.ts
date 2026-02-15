export type TraversalResult = {
  order: number[];
  parent: { [key: string]: number | null };
};

export class Graph {
  private adjacency: { [key: string]: number[] } = {};

  addNode(node: number): void {
    const key = String(node);
    if (!this.adjacency[key]) {
      this.adjacency[key] = [];
    }
  }

  addEdge(from: number, to: number): void {
    this.addNode(from);
    this.addNode(to);
    const key = String(from);
    if (!this.adjacency[key].includes(to)) {
      this.adjacency[key].push(to);
    }
  }

  bfs(start: number): TraversalResult {
    const visited: { [key: string]: boolean } = {};
    const parent: { [key: string]: number | null } = {};
    const queue: number[] = [];
    const order: number[] = [];

    if (!this.adjacency[String(start)]) {
      return { order, parent };
    }

    queue.push(start);
    visited[String(start)] = true;
    parent[String(start)] = null;

    while (queue.length > 0) {
      const current = queue.shift() as number;
      order.push(current);

      const neighbors = this.adjacency[String(current)] || [];
      for (const neighbor of neighbors) {
        if (!visited[String(neighbor)]) {
          visited[String(neighbor)] = true;
          parent[String(neighbor)] = current;
          queue.push(neighbor);
        }
      }
    }

    return { order, parent };
  }

  dfs(start: number): TraversalResult {
    const visited: { [key: string]: boolean } = {};
    const parent: { [key: string]: number | null } = {};
    const order: number[] = [];

    const walk = (node: number): void => {
      visited[String(node)] = true;
      order.push(node);

      const neighbors = this.adjacency[String(node)] || [];
      for (const neighbor of neighbors) {
        if (!visited[String(neighbor)]) {
          parent[String(neighbor)] = node;
          walk(neighbor);
        }
      }
    };

    if (!this.adjacency[String(start)]) {
      return { order, parent };
    }

    parent[String(start)] = null;
    walk(start);

    return { order, parent };
  }

  reachableFrom(start: number, algorithm: "BFS" | "DFS"): number[] {
    const result = algorithm === "BFS" ? this.bfs(start) : this.dfs(start);
    return result.order;
  }

  hasCycle(): boolean {
    const visited: { [key: string]: boolean } = {};
    const stack: { [key: string]: boolean } = {};

    const detect = (node: number): boolean => {
      const key = String(node);
      if (!visited[key]) {
        visited[key] = true;
        stack[key] = true;

        const neighbors = this.adjacency[key] || [];
        for (const neighbor of neighbors) {
          const nKey = String(neighbor);
          if (!visited[nKey] && detect(neighbor)) {
            return true;
          }
          if (stack[nKey]) {
            return true;
          }
        }
      }

      stack[key] = false;
      return false;
    };

    for (const key of Object.keys(this.adjacency)) {
      if (detect(Number(key))) return true;
    }
    return false;
  }

  toAdjacencyList(): { [key: string]: number[] } {
    const clone: { [key: string]: number[] } = {};
    for (const [node, neighbors] of Object.entries(this.adjacency)) {
      clone[node] = [...neighbors];
    }
    return clone;
  }

  edgeCount(): number {
    let count = 0;
    for (const neighbors of Object.values(this.adjacency)) {
      count += neighbors.length;
    }
    return count;
  }

  nodeCount(): number {
    return Object.keys(this.adjacency).length;
  }

  clear(): void {
    this.adjacency = {};
  }
}
