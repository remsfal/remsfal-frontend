import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import {propertyService,
  type PropertyUnit,
  type PropertyList,
  toRentableUnitView,
  EntityType,} from '@/services/PropertyService';

const mockProperty: PropertyUnit = {
  id: 'property-1',
  title: 'Main Property',
  description: 'Primary property location',
  plotArea: 1000,
  address: {
    street: 'Main St',
    city: 'Sample City',
    zip: '12345',
    province: 'Sample State',
    countryCode: 'US',
  },
};

const mockPropertyList: PropertyList = {properties: [mockProperty],};

const handlers = [
  http.post('/api/v1/projects/:projectId/properties', async ({ request }) => {
    const body = (await request.json()) as PropertyUnit;
    return HttpResponse.json(
      {
        ...body,
        id: 'new-property-id',
      },
      { status: 201 },
    );
  }),
  http.get('/api/v1/projects/:projectId/properties', () => {
    return HttpResponse.json(mockPropertyList);
  }),
  http.get('/api/v1/projects/:projectId/properties/:propertyId', ({ params }) => {
    if (params.propertyId === 'not-found') {
      return HttpResponse.json({ message: 'Property not found' }, { status: 404 });
    }
    return HttpResponse.json({
      ...mockProperty,
      id: params.propertyId,
    });
  }),
  http.patch('/api/v1/projects/:projectId/properties/:propertyId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<PropertyUnit>;
    return HttpResponse.json({
      ...mockProperty,
      ...body,
      id: params.propertyId,
    });
  }),
  http.delete('/api/v1/projects/:projectId/properties/:propertyId', ({ params }) => {
    if (params.propertyId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return HttpResponse.json({}, { status: 204 });
  }),
];

const server = setupServer(...handlers);

describe('PropertyService', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

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
      server.use(
        http.post('/api/v1/projects/:projectId/properties', () => {
          return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
        }),
      );

      await expect(propertyService.createProperty('project-1', mockProperty)).rejects.toThrow();
    });
  });

  describe('getPropertyTree', () => {
    it('should fetch property tree', async () => {
      const result = await propertyService.getPropertyTree('project-1');
      expect(result.properties).toHaveLength(1);
      expect(result.properties?.[0]?.id).toBe('property-1');
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
      server.use(
        http.get('/api/v1/projects/:projectId/properties', () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        }),
      );

      await expect(propertyService.getPropertyTree('project-1')).rejects.toThrow();
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
      server.use(
        http.get('/api/v1/projects/:projectId/properties/:propertyId', () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        }),
      );

      await expect(propertyService.getProperty('project-1', 'property-1')).rejects.toThrow();
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
      const partialUpdate: PropertyUnit = {title: 'Only Title Updated',};

      const result = await propertyService.updateProperty('project-1', 'property-1', partialUpdate);
      expect(result.title).toBe('Only Title Updated');
    });

    it('should handle update errors', async () => {
      server.use(
        http.patch('/api/v1/projects/:projectId/properties/:propertyId', () => {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
        }),
      );

      await expect(
        propertyService.updateProperty('project-1', 'property-1', mockProperty),
      ).rejects.toThrow();
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
      server.use(
        http.delete('/api/v1/projects/:projectId/properties/:propertyId', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        }),
      );

      await expect(propertyService.deleteProperty('project-1', 'non-existing')).rejects.toThrow();
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
