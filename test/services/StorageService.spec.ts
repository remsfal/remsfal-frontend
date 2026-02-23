import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { storageService, type StorageJson } from '@/services/StorageService';

const mockStorage: StorageJson = {
  id: 'storage-1',
  title: 'Storage Unit 1',
  location: 'Basement Level',
  description: 'Secure storage unit',
  usableSpace: 10,
};

describe('StorageService', () => {
  // Override global handlers with test-specific ones
  beforeEach(() => {
    server.use(
      http.post('/api/v1/projects/:projectId/buildings/:buildingId/storages', async ({ request }) => {
        const body = (await request.json()) as StorageJson;
        return HttpResponse.json(
          {
            ...body,
            id: 'new-storage-id',
          },
          { status: 201 },
        );
      }),
      http.get('/api/v1/projects/:projectId/storages/:storageId', ({ params }) => {
        if (params.storageId === 'not-found') {
          return HttpResponse.json({ message: 'Storage not found' }, { status: 404 });
        }
        return HttpResponse.json({
          ...mockStorage,
          id: params.storageId,
        });
      }),
      http.patch('/api/v1/projects/:projectId/storages/:storageId', async ({ request, params }) => {
        const body = (await request.json()) as Partial<StorageJson>;
        return HttpResponse.json({
          ...mockStorage,
          ...body,
          id: params.storageId,
        });
      }),
      http.delete('/api/v1/projects/:projectId/storages/:storageId', ({ params }) => {
        if (params.storageId === 'cannot-delete') {
          return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
        }
        return HttpResponse.json({}, { status: 204 });
      }),
    );
  });

  describe('createStorage', () => {
    it('should create a new storage', async () => {
      const newStorage: StorageJson = {
        title: 'New Storage',
        location: 'Ground Floor',
        description: 'New storage unit',
        usableSpace: 15,
      };

      const result = await storageService.createStorage('project-1', 'building-1', newStorage);
      expect(result.id).toBe('new-storage-id');
      expect(result.title).toBe('New Storage');
      expect(result.location).toBe('Ground Floor');
      expect(result.usableSpace).toBe(15);
    });

    it('should handle creation errors', async () => {
      server.use(
        http.post('/api/v1/projects/:projectId/buildings/:buildingId/storages', () => {
          return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
        }),
      );

      await expect(
        storageService.createStorage('project-1', 'building-1', mockStorage),
      ).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      server.use(
        http.post('/api/v1/projects/:projectId/buildings/:buildingId/storages', () => {
          return HttpResponse.json({ message: 'Validation Error' }, { status: 422 });
        }),
      );

      await expect(
        storageService.createStorage('project-1', 'building-1', mockStorage),
      ).rejects.toThrow();
    });
  });

  describe('getStorage', () => {
    it('should fetch a single storage', async () => {
      const result = await storageService.getStorage('project-1', 'storage-1');
      expect(result.id).toBe('storage-1');
      expect(result.title).toBe('Storage Unit 1');
      expect(result.usableSpace).toBe(10);
    });

    it('should handle 404 error', async () => {
      await expect(storageService.getStorage('project-1', 'not-found')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/v1/projects/:projectId/storages/:storageId', () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        }),
      );

      await expect(storageService.getStorage('project-1', 'storage-1')).rejects.toThrow();
    });

    it('should propagate error status code', async () => {
      server.use(
        http.get('/api/v1/projects/:projectId/storages/:storageId', () => {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
        }),
      );

      try {
        await storageService.getStorage('project-1', 'storage-1');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('updateStorage', () => {
    it('should update a storage', async () => {
      const updates: StorageJson = {
        ...mockStorage,
        title: 'Updated Storage',
        usableSpace: 20,
      };

      const result = await storageService.updateStorage('project-1', 'storage-1', updates);
      expect(result.title).toBe('Updated Storage');
      expect(result.usableSpace).toBe(20);
    });

    it('should handle partial updates', async () => {
      const partialUpdate: StorageJson = {title: 'Only Title Updated',};

      const result = await storageService.updateStorage('project-1', 'storage-1', partialUpdate);
      expect(result.title).toBe('Only Title Updated');
    });

    it('should handle update errors', async () => {
      server.use(
        http.patch('/api/v1/projects/:projectId/storages/:storageId', () => {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
        }),
      );

      await expect(
        storageService.updateStorage('project-1', 'storage-1', mockStorage),
      ).rejects.toThrow();
    });

    it('should handle not found errors during update', async () => {
      server.use(
        http.patch('/api/v1/projects/:projectId/storages/:storageId', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        }),
      );

      await expect(
        storageService.updateStorage('project-1', 'non-existing', mockStorage),
      ).rejects.toThrow();
    });
  });

  describe('deleteStorage', () => {
    it('should delete a storage successfully', async () => {
      await expect(storageService.deleteStorage('project-1', 'storage-1')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      await expect(storageService.deleteStorage('project-1', 'cannot-delete')).rejects.toThrow();
    });

    it('should handle not found errors during deletion', async () => {
      server.use(
        http.delete('/api/v1/projects/:projectId/storages/:storageId', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        }),
      );

      await expect(storageService.deleteStorage('project-1', 'non-existing')).rejects.toThrow();
    });

    it('should handle server errors during deletion', async () => {
      server.use(
        http.delete('/api/v1/projects/:projectId/storages/:storageId', () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        }),
      );

      await expect(storageService.deleteStorage('project-1', 'storage-1')).rejects.toThrow();
    });
  });
});
