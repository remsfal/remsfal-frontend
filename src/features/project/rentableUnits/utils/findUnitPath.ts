import type { RentalUnitTreeNodeJson } from '@/features/project/rentableUnits/services/PropertyService';

/**
 * Returns the path from a root node down to the node with the given key (inclusive),
 * or null if the key is not part of the tree.
 */
export function findUnitPath(
  nodes: RentalUnitTreeNodeJson[],
  target: string,
  currentPath: RentalUnitTreeNodeJson[] = [],
): RentalUnitTreeNodeJson[] | null {
  for (const node of nodes) {
    if (node.key === target) return [...currentPath, node];
    if (node.children?.length) {
      const found = findUnitPath(node.children, target, [...currentPath, node]);
      if (found) return found;
    }
  }
  return null;
}
