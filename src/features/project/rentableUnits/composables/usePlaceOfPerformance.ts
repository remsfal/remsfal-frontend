import type { AddressJson } from '@/services/AddressService';
import {EntityType,
  type RentalUnitTreeNodeJson,
  type UnitType,} from '@/features/project/rentableUnits/services/PropertyService';
import { buildingService } from '@/features/project/rentableUnits/services/BuildingService';
import { siteService } from '@/features/project/rentableUnits/services/SiteService';
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore';

export interface PlaceOfPerformance {
  address?: AddressJson;
  rentalUnitType?: UnitType;
  rentalUnitTitle?: string;
  rentalUnitLocation?: string;
}

const ADDRESS_UNIT_TYPES: string[] = [EntityType.Building, EntityType.Site];

function findPath(
  nodes: RentalUnitTreeNodeJson[],
  target: string,
  currentPath: RentalUnitTreeNodeJson[],
): RentalUnitTreeNodeJson[] | null {
  for (const node of nodes) {
    if (node.key === target) return [...currentPath, node];
    if (node.children?.length) {
      const found = findPath(node.children, target, [...currentPath, node]);
      if (found) return found;
    }
  }
  return null;
}

export function usePlaceOfPerformance() {
  const rentableUnitsStore = useRentableUnitsStore();

  const fetchAddress = async (
    projectId: string,
    node: RentalUnitTreeNodeJson | undefined,
  ): Promise<AddressJson | undefined> => {
    if (!node?.key) return undefined;
    if (node.data?.type === EntityType.Building) {
      return (await buildingService.getBuilding(projectId, node.key)).address;
    }
    return (await siteService.getSite(projectId, node.key)).address;
  };

  /**
   * Resolves where work on the given rental unit takes place: the address of the nearest
   * building or site on the path to the unit (the unit itself included), plus the unit's
   * type, title and location. Apartments, storages and commercials inherit their building's
   * address; properties have no address.
   */
  const resolvePlaceOfPerformance = async (projectId: string, rentalUnitId: string): Promise<PlaceOfPerformance> => {
    await rentableUnitsStore.fetchRentalUnitTree(projectId);
    const path = findPath(rentableUnitsStore.rentableUnitTree, rentalUnitId, []) ?? [];
    const unit = path.at(-1);
    if (!unit) return {};

    const addressNode = path.findLast((node) => ADDRESS_UNIT_TYPES.includes(node.data?.type ?? ''));
    return {
      address: await fetchAddress(projectId, addressNode),
      rentalUnitType: unit.data?.type,
      rentalUnitTitle: unit.data?.title,
      rentalUnitLocation: unit.data?.location,
    };
  };

  return { resolvePlaceOfPerformance };
}
