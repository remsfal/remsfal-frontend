import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { buildingService, type Building } from '@/services/BuildingService';
import { testErrorHandling } from '../utils/testHelpers';

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

describe('BuildingService', () => {
  // Override global handlers with test-specific ones
  beforeEach(() => {
    server.use(
      http.post('/api/v1/projects/:projectId/properties/:propertyId/buildings', async ({ request }) => {
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
    );
  });

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
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/properties/:propertyId/buildings',
        'post',
        400,
        () => buildingService.createBuilding('project-1', 'property-1', mockBuilding),
      );
    });

    it('should handle validation errors', async () => {
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/properties/:propertyId/buildings',
        'post',
        422,
        () => buildingService.createBuilding('project-1', 'property-1', mockBuilding),
      );
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
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/buildings/:buildingId',
        'get',
        500,
        () => buildingService.getBuilding('project-1', 'building-1'),
      );
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
      const partialUpdate: Building = {title: 'Only Title Changed',};

      const result = await buildingService.updateBuilding('project-1', 'building-1', partialUpdate);
      expect(result.title).toBe('Only Title Changed');
    });

    it('should handle update errors', async () => {
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/buildings/:buildingId',
        'patch',
        403,
        () => buildingService.updateBuilding('project-1', 'building-1', mockBuilding),
      );
    });

    it('should handle not found errors during update', async () => {
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/buildings/:buildingId',
        'patch',
        404,
        () => buildingService.updateBuilding('project-1', 'non-existing', mockBuilding),
      );
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
      await testErrorHandling(
        server,
        '/api/v1/projects/:projectId/buildings/:buildingId',
        'delete',
        404,
        () => buildingService.deleteBuilding('project-1', 'non-existing'),
      );
    });
  });
});
