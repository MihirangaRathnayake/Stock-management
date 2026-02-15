export class Stack<T> {
  private items: T[] = [];

  push(value: T): void {
    this.items.push(value);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  toArray(): T[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }

  serialize(): string {
    return JSON.stringify(this.items);
  }

  static deserialize<T>(raw: string | null | undefined): Stack<T> {
    const stack = new Stack<T>();
    if (!raw) return stack;
    try {
      const arr = JSON.parse(raw) as T[];
      if (Array.isArray(arr)) {
        for (const value of arr) {
          stack.push(value);
        }
      }
    } catch {
      return stack;
    }
    return stack;
  }
}
