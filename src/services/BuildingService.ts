import { typedRequest } from '@/services/api/typedRequest';
import type { components } from '@/services/api/platform-schema';

// OpenAPI schema types
export type Building = components['schemas']['BuildingJson'];

export default class BuildingService {
  static readonly BASE_PATH = '/api/v1/projects' as const;

  // Create a new building
  async createBuilding(projectId: string, propertyId: string, building: Building): Promise<Building> {
    const created = await typedRequest<
      '/api/v1/projects/{projectId}/properties/{propertyId}/buildings',
      'post',
      Building
    >('post', `${BuildingService.BASE_PATH}/{projectId}/properties/{propertyId}/buildings`, {
      pathParams: { projectId, propertyId },
      body: building,
    });
    console.log('POST create building:', created);
    return created;
  }

  // Get a single building
  async getBuilding(projectId: string, buildingId: string): Promise<Building> {
    const building = await typedRequest<'/api/v1/projects/{projectId}/buildings/{buildingId}', 'get', Building>(
      'get',
      `${BuildingService.BASE_PATH}/{projectId}/buildings/{buildingId}`,
      { pathParams: { projectId, buildingId } },
    );
    console.log('GET building:', building);
    return building;
  }

  // Update a building
  async updateBuilding(projectId: string, buildingId: string, building: Building): Promise<Building> {
    const updated = await typedRequest<'/api/v1/projects/{projectId}/buildings/{buildingId}', 'patch', Building>(
      'patch',
      `${BuildingService.BASE_PATH}/{projectId}/buildings/{buildingId}`,
      { pathParams: { projectId, buildingId }, body: building },
    );
    console.log('PATCH update building:', updated);
    return updated;
  }

  // Delete a building
  async deleteBuilding(projectId: string, buildingId: string): Promise<void> {
    await typedRequest<'/api/v1/projects/{projectId}/buildings/{buildingId}', 'delete'>(
      'delete',
      `${BuildingService.BASE_PATH}/{projectId}/buildings/{buildingId}`,
      { pathParams: { projectId, buildingId } },
    );
    console.log('DELETE building', buildingId);
  }
}

export const buildingService = new BuildingService();
