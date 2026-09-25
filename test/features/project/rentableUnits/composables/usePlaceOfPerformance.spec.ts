import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlaceOfPerformance } from '@/features/project/rentableUnits/composables/usePlaceOfPerformance';
import {propertyService,
  type PropertyListJson,
  type RentalUnitTreeNodeJson,} from '@/features/project/rentableUnits/services/PropertyService';
import { buildingService, type BuildingJson } from '@/features/project/rentableUnits/services/BuildingService';
import { siteService, type SiteJson } from '@/features/project/rentableUnits/services/SiteService';

const buildingAddress = {
  street: 'Hauptstraße 5', zip: '14467', city: 'Potsdam', province: 'Brandenburg', countryCode: 'DE'
};
const siteAddress = {
  street: 'Gartenweg 1', zip: '14467', city: 'Potsdam', province: 'Brandenburg', countryCode: 'DE'
};

const tree = [
  {
    key: 'prop-1',
    data: { type: 'PROPERTY', title: 'Grundstück' },
    children: [
      {
        key: 'bld-1',
        data: {
          type: 'BUILDING', title: 'Haus A', location: 'Vorderhaus'
        },
        children: [{
          key: 'apt-1', data: {
            type: 'APARTMENT', title: 'Wohnung 3.2', location: '3. OG links'
          }
        }],
      },
      {
        key: 'site-1', data: {
          type: 'SITE', title: 'Garten', location: 'Hinterhof'
        }
      },
    ],
  },
] as RentalUnitTreeNodeJson[];

describe('usePlaceOfPerformance', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
    vi.spyOn(propertyService, 'getPropertyTree').mockResolvedValue({ properties: tree } as PropertyListJson);
    vi.spyOn(buildingService, 'getBuilding').mockResolvedValue({ address: buildingAddress } as BuildingJson);
    vi.spyOn(siteService, 'getSite').mockResolvedValue({ address: siteAddress } as SiteJson);
  });

  it('uses the address of the parent building for an apartment', async () => {
    const result = await usePlaceOfPerformance().resolvePlaceOfPerformance('proj-1', 'apt-1');
    expect(buildingService.getBuilding).toHaveBeenCalledWith('proj-1', 'bld-1');
    expect(result).toEqual({
      address: buildingAddress, rentalUnitTitle: 'Wohnung 3.2', rentalUnitLocation: '3. OG links'
    });
  });

  it('uses the own address for a building', async () => {
    const result = await usePlaceOfPerformance().resolvePlaceOfPerformance('proj-1', 'bld-1');
    expect(buildingService.getBuilding).toHaveBeenCalledWith('proj-1', 'bld-1');
    expect(result).toEqual({
      address: buildingAddress, rentalUnitTitle: 'Haus A', rentalUnitLocation: 'Vorderhaus'
    });
  });

  it('uses the own address for a site', async () => {
    const result = await usePlaceOfPerformance().resolvePlaceOfPerformance('proj-1', 'site-1');
    expect(siteService.getSite).toHaveBeenCalledWith('proj-1', 'site-1');
    expect(result).toEqual({
      address: siteAddress, rentalUnitTitle: 'Garten', rentalUnitLocation: 'Hinterhof'
    });
  });

  it('returns no address for a property', async () => {
    const result = await usePlaceOfPerformance().resolvePlaceOfPerformance('proj-1', 'prop-1');
    expect(buildingService.getBuilding).not.toHaveBeenCalled();
    expect(siteService.getSite).not.toHaveBeenCalled();
    expect(result).toEqual({
      address: undefined, rentalUnitTitle: 'Grundstück', rentalUnitLocation: undefined
    });
  });

  it('returns an empty result when the unit is not part of the tree', async () => {
    expect(await usePlaceOfPerformance().resolvePlaceOfPerformance('proj-1', 'unknown')).toEqual({});
  });
});
