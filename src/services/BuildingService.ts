import { typedRequest } from '../../src/services/api/typedRequest';
import type { paths,components } from '../../src/services/api/platform-schema'; // generated OpenAPI types

export type CreateBuildingRequest =
  paths['/api/v1/projects/{projectId}/properties/{propertyId}/buildings']['post']['requestBody']['content']['application/json'];

  // There is no GET success response, so we fallback to BuildingJson directly wait until backend update 
export type BuildingResponse = components['schemas']['BuildingJson'];

export type UpdateBuildingRequest =
  paths['/api/v1/projects/{projectId}/buildings/{buildingId}']['patch']['requestBody']['content']['application/json'];

export default class BuildingService {
  private static readonly BASE_ENDPOINT = '/api/v1/projects' as const;

  createBuilding(projectId: string, propertyId: string, building: CreateBuildingRequest) {
    return typedRequest<
      '/api/v1/projects/{projectId}/properties/{propertyId}/buildings',
      'post',
      BuildingResponse
    >('post', `${BuildingService.BASE_ENDPOINT}/{projectId}/properties/{propertyId}/buildings`, {
      pathParams: { projectId, propertyId },
      body: building,
    });
  }

  getBuilding(projectId: string, buildingId: string) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}',
      'get',
      BuildingResponse
    >('get', `${BuildingService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}`, {
      pathParams: { projectId, buildingId },
    });
  }

  updateBuilding(projectId: string, buildingId: string, building: UpdateBuildingRequest) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}',
      'patch',
      BuildingResponse
    >('patch', `${BuildingService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}`, {
      pathParams: { projectId, buildingId },
      body: building,
    });
  }

  async deleteBuilding(projectId: string, buildingId: string) {
    try {
      await typedRequest<
        '/api/v1/projects/{projectId}/buildings/{buildingId}',
        'delete'
      >('delete', `${BuildingService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}`, {
        pathParams: { projectId, buildingId },
      });
      console.log('DELETE building successful');
      return true;
    } catch (error) {
      console.error('DELETE building failed:', error);
      return false;
    }
  }
}

export const buildingService = new BuildingService();
