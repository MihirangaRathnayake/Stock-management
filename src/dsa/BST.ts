type BSTNode = {
  key: number;
  values: number[];
  left: BSTNode | null;
  right: BSTNode | null;
};

export class BST {
  private root: BSTNode | null = null;

  insert(key: number, value: number): void {
    const insertRecursive = (node: BSTNode | null): BSTNode => {
      if (!node) {
        return { key, values: [value], left: null, right: null };
      }

      if (key === node.key) {
        node.values.push(value);
      } else if (key < node.key) {
        node.left = insertRecursive(node.left);
      } else {
        node.right = insertRecursive(node.right);
      }
      return node;
    };

    this.root = insertRecursive(this.root);
  }

  search(key: number): number[] {
    let cursor = this.root;
    while (cursor) {
      if (key === cursor.key) {
        return [...cursor.values];
      }
      cursor = key < cursor.key ? cursor.left : cursor.right;
    }
    return [];
  }

  range(min: number, max: number): { key: number; shipmentId: number }[] {
    const result: { key: number; shipmentId: number }[] = [];

    const traverse = (node: BSTNode | null): void => {
      if (!node) return;

      if (node.key > min) traverse(node.left);
      if (node.key >= min && node.key <= max) {
        for (const shipmentId of node.values) {
          result.push({ key: node.key, shipmentId });
        }
      }
      if (node.key < max) traverse(node.right);
    };

    traverse(this.root);
    return result;
  }

  inorder(): { key: number; shipmentIds: number[] }[] {
    const result: { key: number; shipmentIds: number[] }[] = [];
    const traverse = (node: BSTNode | null): void => {
      if (!node) return;
      traverse(node.left);
      result.push({ key: node.key, shipmentIds: [...node.values] });
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  countNodes(): number {
    return this.inorder().length;
  }

  clear(): void {
    this.root = null;
  }
}
