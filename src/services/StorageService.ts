import { typedRequest } from '@/services/api/typedRequest';
import type { RequestBody, ResponseType } from '@/services/api/typedRequest';
import type { components, paths } from '../../src/services/api/platform-schema';

// Request bodies from OpenAPI paths
export type CreateStorageBody = RequestBody<
  '/api/v1/projects/{projectId}/buildings/{buildingId}/storages',
  'post'
>;
export type UpdateStorageBody = RequestBody<
  '/api/v1/projects/{projectId}/storages/{storageId}',
  'patch'
>;

// Responses from OpenAPI paths
export type GetStorageResponse = ResponseType<
  '/api/v1/projects/{projectId}/storages/{storageId}',
  'get'
>;

export class StorageService {
  async createStorage(
    projectId: string,
    buildingId: string,
    body: CreateStorageBody,
  ): Promise<ResponseType<'/api/v1/projects/{projectId}/buildings/{buildingId}/storages', 'post'>> {
    return typedRequest(
      'post',
      '/api/v1/projects/{projectId}/buildings/{buildingId}/storages',
      { pathParams: { projectId, buildingId }, body }
    );
  }

  async getStorage(
    projectId: string,
    storageId: string
  ): Promise<GetStorageResponse> {
    return typedRequest(
      'get',
      '/api/v1/projects/{projectId}/storages/{storageId}',
      { pathParams: { projectId, storageId } }
    );
  }

  async updateStorage(
    projectId: string,
    storageId: string,
    body: UpdateStorageBody
  ): Promise<ResponseType<'/api/v1/projects/{projectId}/storages/{storageId}', 'patch'>> {
    return typedRequest(
      'patch',
      '/api/v1/projects/{projectId}/storages/{storageId}',
      { pathParams: { projectId, storageId }, body }
    );
  }

  async deleteStorage(
    projectId: string,
    storageId: string
  ): Promise<void> {
    return typedRequest(
      'delete',
      '/api/v1/projects/{projectId}/storages/{storageId}',
      { pathParams: { projectId, storageId } }
    );
  }
}

export const storageService = new StorageService();
