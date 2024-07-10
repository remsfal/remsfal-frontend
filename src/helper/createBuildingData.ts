import type { BuildingItem, PropertyItem } from "@/services/ProjectService";

export function generateDummyBuildings(
  properties: PropertyItem[]
): BuildingItem[] {
  const buildings: BuildingItem[] = [];

  properties.forEach((property: PropertyItem, index) => {
    for (let i = 0; i < 3; i++) {
      if (property.id) {
        buildings.push({
          id: `${index + 1}-${i + 1}`,
          propertyId: property.id,
          title: `Building ${index + 1}-${i + 1}`,
          addressId: `${index + 1}-${i + 1}`,
          description: `Description ${index + 1}-${i + 1}`,
          livingSpace: 100 * (i + 1),
          commercialSpace: 50 * (i + 1),
          usableSpace: 150 * (i + 1),
          heatingSpace: 70 * (i + 1),
          rent: 1000 * (i + 1),
        });
      }
    }
  });
  return buildings;
}
