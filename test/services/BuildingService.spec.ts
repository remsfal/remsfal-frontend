import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { buildingService, type Building } from '@/services/BuildingService';

const mockBuilding: Building = {
  id: 'building-1',
  title: 'Building A',
  description: 'Main building with apartments',
  livingSpace: 500,
  commercialSpace: 100,
  usableSpace: 550,
  heatingSpace: 480,
  rent: 5000,
};

const handlers = [
  http.post('/api/v1/projects/:projectId/properties/:propertyId/buildings', async ({ request, params }) => {
    const body = (await request.json()) as Building;
    return HttpResponse.json(
      {
        ...body,
        id: 'new-building-id',
      },
      { status: 201 },
    );
  }),
  http.get('/api/v1/projects/:projectId/buildings/:buildingId', ({ params }) => {
    if (params.buildingId === 'not-found') {
      return HttpResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    return HttpResponse.json({
      ...mockBuilding,
      id: params.buildingId,
    });
  }),
  http.patch('/api/v1/projects/:projectId/buildings/:buildingId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Building>;
    return HttpResponse.json({
      ...mockBuilding,
      ...body,
      id: params.buildingId,
    });
  }),
  http.delete('/api/v1/projects/:projectId/buildings/:buildingId', ({ params }) => {
    if (params.buildingId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return HttpResponse.json({}, { status: 204 });
  }),
];

const server = setupServer(...handlers);

describe('BuildingService', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('createBuilding', () => {
    it('should create a new building', async () => {
      const newBuilding: Building = {
        title: 'New Building',
        description: 'A brand new building',
        livingSpace: 600,
        commercialSpace: 150,
        usableSpace: 700,
        heatingSpace: 550,
        rent: 6000,
      };

      const result = await buildingService.createBuilding('project-1', 'property-1', newBuilding);
      expect(result.id).toBe('new-building-id');
      expect(result.title).toBe('New Building');
      expect(result.livingSpace).toBe(600);
    });

    it('should handle creation errors', async () => {
      server.use(
        http.post('/api/v1/projects/:projectId/properties/:propertyId/buildings', () => {
          return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
        }),
      );

      await expect(
        buildingService.createBuilding('project-1', 'property-1', mockBuilding),
      ).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      server.use(
        http.post('/api/v1/projects/:projectId/properties/:propertyId/buildings', () => {
          return HttpResponse.json({ message: 'Validation Error' }, { status: 422 });
        }),
      );

      await expect(
        buildingService.createBuilding('project-1', 'property-1', mockBuilding),
      ).rejects.toThrow();
    });
  });

  describe('getBuilding', () => {
    it('should fetch a single building', async () => {
      const result = await buildingService.getBuilding('project-1', 'building-1');
      expect(result.id).toBe('building-1');
      expect(result.title).toBe('Building A');
      expect(result.livingSpace).toBe(500);
    });

    it('should handle 404 error', async () => {
      await expect(buildingService.getBuilding('project-1', 'not-found')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/v1/projects/:projectId/buildings/:buildingId', () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        }),
      );

      await expect(buildingService.getBuilding('project-1', 'building-1')).rejects.toThrow();
    });
  });

  describe('updateBuilding', () => {
    it('should update a building', async () => {
      const updates: Building = {
        ...mockBuilding,
        title: 'Updated Building',
        livingSpace: 550,
      };

      const result = await buildingService.updateBuilding('project-1', 'building-1', updates);
      expect(result.title).toBe('Updated Building');
      expect(result.livingSpace).toBe(550);
    });

    it('should handle partial updates', async () => {
      const partialUpdate: Building = {
        title: 'Only Title Changed',
      };

      const result = await buildingService.updateBuilding('project-1', 'building-1', partialUpdate);
      expect(result.title).toBe('Only Title Changed');
    });

    it('should handle update errors', async () => {
      server.use(
        http.patch('/api/v1/projects/:projectId/buildings/:buildingId', () => {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
        }),
      );

      await expect(
        buildingService.updateBuilding('project-1', 'building-1', mockBuilding),
      ).rejects.toThrow();
    });

    it('should handle not found errors during update', async () => {
      server.use(
        http.patch('/api/v1/projects/:projectId/buildings/:buildingId', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        }),
      );

      await expect(
        buildingService.updateBuilding('project-1', 'non-existing', mockBuilding),
      ).rejects.toThrow();
    });
  });

  describe('deleteBuilding', () => {
    it('should delete a building successfully', async () => {
      await expect(buildingService.deleteBuilding('project-1', 'building-1')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      await expect(buildingService.deleteBuilding('project-1', 'cannot-delete')).rejects.toThrow();
    });

    it('should handle not found errors during deletion', async () => {
      server.use(
        http.delete('/api/v1/projects/:projectId/buildings/:buildingId', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        }),
      );

      await expect(buildingService.deleteBuilding('project-1', 'non-existing')).rejects.toThrow();
    });
  });
});
