import type { GarageItem, BuildingItem } from '@/services/ProjectService';

export function generateDummyGarages(buildings: BuildingItem[]): GarageItem[] {
  const garages: GarageItem[] = [];

  buildings.forEach((building: BuildingItem) => {
    for (let i = 0; i < 3; i++) {
      if (building.id) {
        garages.push({
          id: `${building.id}-garage-${i + 1}`,
          buildingId: building.id,
          title: `Garage ${building.id}-${i + 1}`,
          location: `Location ${building.id}-${i + 1}`,
          description: `Description ${building.id}-${i + 1}`,
          usableSpace: 50 * (i + 1),
          //rent: 500 * (i + 1),
        });
      }
    }
  });

  return garages;
}
