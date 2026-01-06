import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
// FIX: Imports aufgeteilt -> Keine Zeilenumbrüche INNERHALB {} (Linter happy), aber Zeilen kurz genug (max-len happy)
import { propertyService, type PropertyUnit, type PropertyList } from '@/services/PropertyService';
import { toRentableUnitView, EntityType } from '@/services/PropertyService';
import { testErrorHandling } from '../utils/testHelpers';
import { server } from '../mocks/server';

// --- MOCK DATA ---

const mockProperty: PropertyUnit = {
  id: 'property-1',
  title: 'Main Property',
  description: 'Primary property location',
  plotArea: 1000,
  type: EntityType.Property,
  address: {
    street: 'Main St',
    city: 'Sample City',
    zip: '12345',
    province: 'Sample State',
    countryCode: 'US',
  },
};

const mockPropertyTree: PropertyList = {
  properties: [
    {
      key: 'property-1',
      // @ts-expect-error: Mock-Daten simulieren API-Antwort
      id: 'property-1',
      data: { title: 'Main Property', type: EntityType.Property },
      children: [
        {
          key: 'bldg-1',
          data: { title: 'Building 1', type: EntityType.Building },
          children: [
            {
              key: 'unit-1',
              data: { title: 'Unit 1', type: EntityType.Apartment },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

const handlers = [
  http.post('/api/v1/projects/:projectId/properties', async ({ request }) => {
    const body = (await request.json()) as PropertyUnit;
    return HttpResponse.json(
      {
        ...body,
        id: 'new-property-id',
      },
      {        status: 201,},
    );
  }),

  http.get('/api/v1/projects/:projectId/properties', () => {
    return HttpResponse.json(mockPropertyTree);
  }),

  http.get('/api/v1/projects/:projectId/properties/:propertyId', ({ params }) => {
    if (params.propertyId === 'not-found') {
      // FIX: Mehrzeilig für Konsistenz
      return HttpResponse.json(
        { message: 'Property not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ ...mockProperty, id: params.propertyId });
  }),

  http.patch('/api/v1/projects/:projectId/properties/:propertyId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<PropertyUnit>;
    return HttpResponse.json({
       ...mockProperty, ...body, id: params.propertyId 
      });
  }),

  http.delete('/api/v1/projects/:projectId/properties/:propertyId', ({ params }) => {
    if (params.propertyId === 'cannot-delete') {
      return HttpResponse.json(
        { message: 'Cannot delete' },
        { status: 403 },
      );
    }
    return HttpResponse.json({}, { status: 204 });
  }),
];

describe('PropertyService', () => {
  beforeEach(() => {
    server.use(...handlers);
  });

  describe('createProperty', () => {
    it('should create a new property', async () => {
      const newProperty: PropertyUnit = {
        title: 'New Property',
        description: 'A new property location',
        plotArea: 1500,
        address: {
          street: '123 New St',
          city: 'New City',
          zip: '54321',
          province: 'New State',
          countryCode: 'US',
        },
      };

      const result = await propertyService.createProperty('project-1', newProperty);
      expect(result.id).toBe('new-property-id');
      expect(result.title).toBe('New Property');
      expect(result.plotArea).toBe(1500);
    });

    it('should handle creation errors', async () => {
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/properties',
        'post',
        400,
        () => propertyService.createProperty('project-1', mockProperty),
      );
    });
  });

  describe('getPropertyTree', () => {
    it('should fetch property tree', async () => {
      const result = await propertyService.getPropertyTree('project-1');
      expect(result.properties).toHaveLength(1);
      expect(result.properties?.[0]?.key).toBe('property-1');
    });

    it('should handle empty property tree', async () => {
      server.use(
        http.get('/api/v1/projects/:projectId/properties', () => {
          return HttpResponse.json({ properties: [] });
        }),
      );

      const result = await propertyService.getPropertyTree('project-1');
      expect(result.properties).toHaveLength(0);
    });

    it('should handle errors when fetching tree', async () => {
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/properties',
        'get',
        500,
        () => propertyService.getPropertyTree('project-1'),
      );
    });
  });

  describe('getProperty', () => {
    it('should fetch a single property', async () => {
      const result = await propertyService.getProperty('project-1', 'property-1');
      expect(result.id).toBe('property-1');
      expect(result.title).toBe('Main Property');
    });

    it('should handle 404 error', async () => {
      await expect(propertyService.getProperty('project-1', 'not-found')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/properties/:propertyId',
        'get',
        500,
        () => propertyService.getProperty('project-1', 'property-1'),
      );
    });
  });

  describe('updateProperty', () => {
    it('should update a property', async () => {
      const updates: PropertyUnit = {
        ...mockProperty,
        title: 'Updated Property',
        plotArea: 2000,
      };

      const result = await propertyService.updateProperty('project-1', 'property-1', updates);
      expect(result.title).toBe('Updated Property');
      expect(result.plotArea).toBe(2000);
    });

    it('should handle partial updates', async () => {
      const partialUpdate: PropertyUnit = { title: 'Only Title Updated' };

      const result = await propertyService.updateProperty('project-1', 'property-1', partialUpdate);
      expect(result.title).toBe('Only Title Updated');
    });

    it('should handle update errors', async () => {
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/properties/:propertyId',
        'patch',
        403,
        () => propertyService.updateProperty('project-1', 'property-1', mockProperty),
      );
    });
  });

  describe('deleteProperty', () => {
    it('should delete a property successfully', async () => {
      await expect(propertyService.deleteProperty('project-1', 'property-1')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      await expect(propertyService.deleteProperty('project-1', 'cannot-delete')).rejects.toThrow();
    });

    it('should handle not found errors during deletion', async () => {
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/properties/:propertyId',
        'delete',
        404,
        () => propertyService.deleteProperty('project-1', 'non-existing'),
      );
    });
  });

  describe('getBreadcrumbPath', () => {
    it('should return correct path for a nested unit', async () => {
      const path = await propertyService.getBreadcrumbPath('project-1', 'unit-1');
      expect(path).toHaveLength(3);
      expect(path[0].id).toBe('property-1');
      expect(path[1].id).toBe('bldg-1');
      expect(path[2].id).toBe('unit-1');
    });

    it('should return path for a root node', async () => {
      const path = await propertyService.getBreadcrumbPath('project-1', 'property-1');
      expect(path).toHaveLength(1);
      expect(path[0].id).toBe('property-1');
    });

    it('should return empty array if ID not found', async () => {
      const path = await propertyService.getBreadcrumbPath('project-1', 'ghost-id');
      expect(path).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('/api/v1/projects/:projectId/properties', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );
      const path = await propertyService.getBreadcrumbPath('project-1', 'unit-1');
      expect(path).toEqual([]);
    });
  });

  describe('getParentId', () => {
    it('should find the parent of a nested child', async () => {
      const parentId = await propertyService.getParentId('project-1', 'unit-1');
      expect(parentId).toBe('bldg-1');
    });

    it('should find the parent of a building', async () => {
      const parentId = await propertyService.getParentId('project-1', 'bldg-1');
      expect(parentId).toBe('property-1');
    });

    it('should return undefined for a root node', async () => {
      const parentId = await propertyService.getParentId('project-1', 'property-1');
      expect(parentId).toBeUndefined();
    });

    it('should return undefined if child not found', async () => {
      const parentId = await propertyService.getParentId('project-1', 'ghost-child');
      expect(parentId).toBeUndefined();
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('/api/v1/projects/:projectId/properties', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );
      const parentId = await propertyService.getParentId('project-1', 'unit-1');
      expect(parentId).toBeUndefined();
    });
  });
});

describe('PropertyService utility functions', () => {
  describe('toRentableUnitView', () => {
    it('should convert APARTMENT to ApartmentView', () => {
      expect(toRentableUnitView('APARTMENT')).toBe('ApartmentView');
    });

    it('should convert COMMERCIAL to CommercialView', () => {
      expect(toRentableUnitView('COMMERCIAL')).toBe('CommercialView');
    });

    it('should convert STORAGE to StorageView', () => {
      expect(toRentableUnitView('STORAGE')).toBe('StorageView');
    });

    it('should convert SITE to SiteView', () => {
      expect(toRentableUnitView('SITE')).toBe('SiteView');
    });

    it('should convert BUILDING to BuildingView', () => {
      expect(toRentableUnitView('BUILDING')).toBe('BuildingView');
    });

    it('should handle undefined input', () => {
      expect(toRentableUnitView(undefined)).toBe('View');
    });
  });

  describe('EntityType enum', () => {
    it('should have correct entity type values', () => {
      expect(EntityType.Apartment).toBe('APARTMENT');
      expect(EntityType.Commercial).toBe('COMMERCIAL');
      expect(EntityType.Storage).toBe('STORAGE');
      expect(EntityType.Site).toBe('SITE');
      expect(EntityType.Building).toBe('BUILDING');
      expect(EntityType.Project).toBe('PROJECT');
      expect(EntityType.Property).toBe('PROPERTY');
    });
  });
});