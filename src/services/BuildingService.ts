import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Building = ApiComponents['schemas']['BuildingJson'];

export default class BuildingService {
  // Create a new building
  async createBuilding(projectId: string, propertyId: string, building: Building): Promise<Building> {
    const created = await apiClient.post(
      '/api/v1/projects/{projectId}/properties/{propertyId}/buildings',
      building,
      { pathParams: { projectId, propertyId } },
    ) as Building;
    console.log('POST create building:', created);
    return created;
  }

  // Get a single building
  async getBuilding(projectId: string, buildingId: string): Promise<Building> {
    const building = await apiClient.get('/api/v1/projects/{projectId}/buildings/{buildingId}', {
      pathParams: { projectId, buildingId },
    });
    console.log('GET building:', building);
    return building;
  }

  // Update a building
  async updateBuilding(projectId: string, buildingId: string, building: Building): Promise<Building> {
    const updated = await apiClient.patch(
      '/api/v1/projects/{projectId}/buildings/{buildingId}',
      building,
      { pathParams: { projectId, buildingId } },
    );
    console.log('PATCH update building:', updated);
    return updated;
  }

  // Delete a building
  async deleteBuilding(projectId: string, buildingId: string): Promise<void> {
    await apiClient.delete('/api/v1/projects/{projectId}/buildings/{buildingId}', {
      pathParams: { projectId, buildingId },
    });
    console.log('DELETE building', buildingId);
  }
}

export const buildingService = new BuildingService();
