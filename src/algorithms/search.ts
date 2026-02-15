export function linearSearch<T>(items: T[], predicate: (value: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of items) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}

export function binarySearchExact<T>(
  sortedItems: T[],
  target: number,
  getNumericValue: (value: T) => number,
): T | null {
  let left = 0;
  let right = sortedItems.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = getNumericValue(sortedItems[mid]);

    if (midValue === target) {
      return sortedItems[mid];
    }

    if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return null;
}
