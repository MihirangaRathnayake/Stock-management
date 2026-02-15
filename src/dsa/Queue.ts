export class Queue<T> {
  private items: T[] = [];
  private head = 0;

  enqueue(value: T): void {
    this.items.push(value);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const value = this.items[this.head];
    this.head += 1;

    if (this.head > 50 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return value;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  size(): number {
    return this.items.length - this.head;
  }

  toArray(): T[] {
    return this.items.slice(this.head);
  }

  clear(): void {
    this.items = [];
    this.head = 0;
  }

  serialize(): string {
    return JSON.stringify(this.toArray());
  }

  static deserialize<T>(raw: string | null | undefined): Queue<T> {
    const queue = new Queue<T>();
    if (!raw) return queue;
    try {
      const arr = JSON.parse(raw) as T[];
      if (Array.isArray(arr)) {
        for (const value of arr) {
          queue.enqueue(value);
        }
      }
    } catch {
      return queue;
    }
    return queue;
  }
}
