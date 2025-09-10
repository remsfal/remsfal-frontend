// src/services/StorageService.ts
import { typedRequest } from '@/services/api/typedRequest';
import type { components } from '@/services/api/platform-schema';

export type Storage = components['schemas']['StorageJson'];

export default class StorageService {
  static readonly BASE_PATH = '/api/v1/projects' as const;

  // Create a new storage
  async createStorage(projectId: string, buildingId: string, data: Storage): Promise<Storage> {
    const storage = await typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/storages',
      'post',
      Storage
    >(
      'post',
      `${StorageService.BASE_PATH}/{projectId}/buildings/{buildingId}/storages`,
      { pathParams: { projectId, buildingId }, body: data },
    );
    console.log('POST create storage:', storage);
    return storage;
  }

  // Get a single storage
  async getStorage(projectId: string, storageId: string): Promise<Storage> {
    try {
      const storage = await typedRequest<
        '/api/v1/projects/{projectId}/storages/{storageId}',
        'get',
        Storage
      >(
        'get',
        `${StorageService.BASE_PATH}/{projectId}/storages/{storageId}`,
        { pathParams: { projectId, storageId } },
      );
      console.log('GET storage:', storage);
      return storage;
    } catch (error: any) {
      console.error('Storage retrieval error', error?.response?.status || error);
      throw error?.response?.status || error;
    }
  }

  // Update a storage
  async updateStorage(projectId: string, storageId: string, data: Storage): Promise<Storage> {
    const updated = await typedRequest<
      '/api/v1/projects/{projectId}/storages/{storageId}',
      'patch',
      Storage
    >(
      'patch',
      `${StorageService.BASE_PATH}/{projectId}/storages/{storageId}`,
      { pathParams: { projectId, storageId }, body: data },
    );
    console.log('PATCH update storage:', updated);
    return updated;
  }

  // Delete a storage
  async deleteStorage(projectId: string, storageId: string): Promise<void> {
    await typedRequest<
      '/api/v1/projects/{projectId}/storages/{storageId}',
      'delete'
    >(
      'delete',
      `${StorageService.BASE_PATH}/{projectId}/storages/{storageId}`,
      { pathParams: { projectId, storageId } },
    );
    console.log('DELETE storage:', storageId);
  }
}

export const storageService = new StorageService();
