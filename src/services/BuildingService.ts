import { typedRequest } from '../../src/services/api/typedRequest';

export default class BuildingService {
  private static readonly BASE_ENDPOINT = '/api/v1/projects' as const;

  // Create building in a property
  createBuilding(projectId: string, propertyId: string, building: any) {
    return typedRequest<
      '/api/v1/projects/{projectId}/properties/{propertyId}/buildings',
      'post'
    >('post', `${BuildingService.BASE_ENDPOINT}/{projectId}/properties/{propertyId}/buildings`, {
      pathParams: { projectId, propertyId },
      body: building,
    });
  }

  // Get building by ID
  getBuilding(projectId: string, buildingId: string) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}',
      'get'
    >('get', `${BuildingService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}`, {
      pathParams: { projectId, buildingId },
    });
  }

  // Update building by ID
  updateBuilding(projectId: string, buildingId: string, building: any) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}',
      'patch'
    >('patch', `${BuildingService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}`, {
      pathParams: { projectId, buildingId },
      body: building,
    });
  }

  // Delete building by ID
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
