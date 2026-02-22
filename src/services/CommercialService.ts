import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type CommercialJson = ApiComponents['schemas']['CommercialJson'];

export default class CommercialService {
  // Create a new commercial unit
  async createCommercial(projectId: string, buildingId: string, data: CommercialJson): Promise<CommercialJson> {
    const commercial = await apiClient.post(
      '/api/v1/projects/{projectId}/buildings/{buildingId}/commercials',
      data,
      { pathParams: { projectId, buildingId } },
    ) as CommercialJson;
    console.log('POST create commercial:', commercial);
    return commercial;
  }

  // Get a single commercial unit
  async getCommercial(projectId: string, commercialId: string): Promise<CommercialJson> {
    const commercial = await apiClient.get(
      '/api/v1/projects/{projectId}/commercials/{commercialId}',
      { pathParams: { projectId, commercialId } },
    ) as CommercialJson;
    console.log('GET commercial:', commercial);
    return commercial;
  }

  // Update a commercial unit
  async updateCommercial(projectId: string, commercialId: string, data: CommercialJson): Promise<CommercialJson> {
    const updated = await apiClient.patch(
      '/api/v1/projects/{projectId}/commercials/{commercialId}',
      data,
      { pathParams: { projectId, commercialId } },
    ) as CommercialJson;
    console.log('PATCH update commercial:', updated);
    return updated;
  }

  // Delete a commercial unit
  async deleteCommercial(projectId: string, commercialId: string): Promise<void> {
    await apiClient.delete(
      '/api/v1/projects/{projectId}/commercials/{commercialId}',
      {pathParams: { projectId, commercialId },},
    );
    console.log('DELETE commercial successful', commercialId);
  }
}

export const commercialService = new CommercialService();
