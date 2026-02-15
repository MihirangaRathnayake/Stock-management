export type SortAlgorithm = "bubble" | "insertion" | "merge" | "quick";

export function bubbleSort<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  const arr = [...items];
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      if (compare(arr[j], arr[j + 1]) > 0) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  return arr;
}

export function insertionSort<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  const arr = [...items];
  for (let i = 1; i < arr.length; i += 1) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && compare(arr[j], key) > 0) {
      arr[j + 1] = arr[j];
      j -= 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}

function merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i += 1;
    } else {
      result.push(right[j]);
      j += 1;
    }
  }

  while (i < left.length) {
    result.push(left[i]);
    i += 1;
  }

  while (j < right.length) {
    result.push(right[j]);
    j += 1;
  }

  return result;
}

export function mergeSort<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  if (items.length <= 1) return [...items];
  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), compare);
  const right = mergeSort(items.slice(middle), compare);
  return merge(left, right, compare);
}

export function quickSort<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  if (items.length <= 1) return [...items];

  const arr = [...items];

  const partition = (low: number, high: number): number => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j += 1) {
      if (compare(arr[j], pivot) <= 0) {
        i += 1;
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    }

    const tmp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = tmp;

    return i + 1;
  };

  const recursive = (low: number, high: number): void => {
    if (low < high) {
      const p = partition(low, high);
      recursive(low, p - 1);
      recursive(p + 1, high);
    }
  };

  recursive(0, arr.length - 1);
  return arr;
}

export function sortByAlgorithm<T>(
  algorithm: SortAlgorithm,
  items: T[],
  compare: (a: T, b: T) => number,
): T[] {
  switch (algorithm) {
    case "bubble":
      return bubbleSort(items, compare);
    case "insertion":
      return insertionSort(items, compare);
    case "merge":
      return mergeSort(items, compare);
    case "quick":
    default:
      return quickSort(items, compare);
  }
}
