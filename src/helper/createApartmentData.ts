import type { ApartmentItem, BuildingItem } from "@/services/ProjectService";

export function generateDummyApartments(
  buildings: BuildingItem[]
): ApartmentItem[] {
  const apartments: ApartmentItem[] = [];

  buildings.forEach((building: BuildingItem, index) => {
    for (let i = 0; i < 5; i++) {
      if (building.id) {
        apartments.push({
          id: `${building.id}-${i + 1}`,
          buildingId: building.id,
          title: `Apartment ${building.id}-${i + 1}`,
          location: `Location ${building.id}-${i + 1}`,
          description: `Description ${building.id}-${i + 1}`,
          livingSpace: 80 * (i + 1),
          usableSpace: 100 * (i + 1),
          heatingSpace: 50 * (i + 1),
          rent: 1200 * (i + 1),
        });
      }
    }
  });
  return apartments;
}
