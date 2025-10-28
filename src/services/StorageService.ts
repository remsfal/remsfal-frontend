import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Storage = ApiComponents['schemas']['StorageJson'];

export default class StorageService {
  // Create a new storage
  async createStorage(projectId: string, buildingId: string, data: Storage): Promise<Storage> {
    const storage = await apiClient.post(
      '/api/v1/projects/{projectId}/buildings/{buildingId}/storages',
      data,
      { pathParams: { projectId, buildingId } },
    ) as Storage;
    console.log('POST create storage:', storage);
    return storage;
  }

  // Get a single storage
  async getStorage(projectId: string, storageId: string): Promise<Storage> {
    try {
      const storage = await apiClient.get('/api/v1/projects/{projectId}/storages/{storageId}', {
        pathParams: { projectId, storageId },
      });
      console.log('GET storage:', storage);
      return storage;
    } catch (error: any) {
      console.error('Storage retrieval error', error?.response?.status || error);
      throw error?.response?.status || error;
    }
  }

  // Update a storage
  async updateStorage(projectId: string, storageId: string, data: Storage): Promise<Storage> {
    const updated = await apiClient.patch(
      '/api/v1/projects/{projectId}/storages/{storageId}',
      data,
      { pathParams: { projectId, storageId } },
    );
    console.log('PATCH update storage:', updated);
    return updated;
  }

  // Delete a storage
  async deleteStorage(projectId: string, storageId: string): Promise<void> {
    await apiClient.delete('/api/v1/projects/{projectId}/storages/{storageId}', {
      pathParams: { projectId, storageId },
    });
    console.log('DELETE storage:', storageId);
  }
}

export const storageService = new StorageService();
