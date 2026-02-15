export type LinkedListNode<T> = {
  value: T;
  next: LinkedListNode<T> | null;
};

export class SinglyLinkedList<T> {
  private head: LinkedListNode<T> | null = null;
  private tail: LinkedListNode<T> | null = null;
  private length = 0;

  append(value: T): void {
    const node: LinkedListNode<T> = { value, next: null };
    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return;
    }
    if (this.tail) {
      this.tail.next = node;
      this.tail = node;
      this.length += 1;
    }
  }

  size(): number {
    return this.length;
  }

  toArray(limit?: number): T[] {
    const values: T[] = [];
    let cursor = this.head;
    while (cursor) {
      values.push(cursor.value);
      if (limit && values.length >= limit) {
        break;
      }
      cursor = cursor.next;
    }
    return values;
  }

  last(n: number): T[] {
    if (n <= 0) return [];
    const all = this.toArray();
    if (all.length <= n) return all;
    return all.slice(all.length - n);
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  serialize(): string {
    return JSON.stringify(this.toArray());
  }

  static deserialize<T>(raw: string | null | undefined): SinglyLinkedList<T> {
    const list = new SinglyLinkedList<T>();
    if (!raw) return list;
    try {
      const arr = JSON.parse(raw) as T[];
      if (Array.isArray(arr)) {
        for (const value of arr) {
          list.append(value);
        }
      }
    } catch {
      return list;
    }
    return list;
  }
}
