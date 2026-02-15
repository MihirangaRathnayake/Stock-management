type HashEntry<V> = {
  key: string;
  value: V;
};

export class HashTable<V> {
  private buckets: HashEntry<V>[][];

  constructor(size = 101) {
    this.buckets = Array.from({ length: size }, () => []);
  }

  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = (hash * 31 + key.charCodeAt(i)) % this.buckets.length;
    }
    return hash;
  }

  set(key: string, value: V): void {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    for (const entry of bucket) {
      if (entry.key === key) {
        entry.value = value;
        return;
      }
    }
    bucket.push({ key, value });
  }

  get(key: string): V | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    for (const entry of bucket) {
      if (entry.key === key) return entry.value;
    }
    return undefined;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  remove(key: string): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const pos = bucket.findIndex((entry) => entry.key === key);
    if (pos === -1) return false;
    bucket.splice(pos, 1);
    return true;
  }

  keys(): string[] {
    const result: string[] = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        result.push(entry.key);
      }
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        result.push(entry.value);
      }
    }
    return result;
  }

  size(): number {
    return this.keys().length;
  }

  toJSON(): { key: string; value: V }[] {
    const entries: { key: string; value: V }[] = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        entries.push({ key: entry.key, value: entry.value });
      }
    }
    return entries;
  }

  static fromEntries<V>(entries: { key: string; value: V }[], size = 101): HashTable<V> {
    const table = new HashTable<V>(size);
    for (const entry of entries) {
      table.set(entry.key, entry.value);
    }
    return table;
  }
}
