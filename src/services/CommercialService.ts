import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Commercial = ApiComponents['schemas']['CommercialJson'];
export type CommercialUnit = ApiComponents['schemas']['CommercialJson'];

export default class CommercialService {
  // Create a new commercial unit
  async createCommercial(projectId: string, buildingId: string, data: Commercial): Promise<Commercial> {
    const commercial = await apiClient.post(
      '/api/v1/projects/{projectId}/buildings/{buildingId}/commercials',
      data,
      { pathParams: { projectId, buildingId } },
    ) as Commercial;
    console.log('POST create commercial:', commercial);
    return commercial;
  }

  // Get a single commercial unit
  async getCommercial(projectId: string, commercialId: string): Promise<Commercial> {
    try {
      const commercial = await apiClient.get(
        '/api/v1/projects/{projectId}/commercials/{commercialId}',
        { pathParams: { projectId, commercialId } },
      );
      console.log('GET commercial:', commercial);
      return commercial;
    } catch (error: any) {
      console.error('commercial retrieval error', error?.response?.status || error);
      throw error?.response?.status || error;
    }
  }

  // Update a commercial unit
  async updateCommercial(projectId: string, commercialId: string, data: Commercial): Promise<Commercial> {
    const updated = await apiClient.patch(
      '/api/v1/projects/{projectId}/commercials/{commercialId}',
      data,
      { pathParams: { projectId, commercialId } },
    );
    console.log('PATCH update commercial:', updated);
    return updated;
  }

  // Delete a commercial unit (returns boolean for success/failure)
  async deleteCommercial(projectId: string, commercialId: string): Promise<boolean> {
    try {
      await apiClient.delete('/api/v1/projects/{projectId}/commercials/{commercialId}', {
        pathParams: { projectId, commercialId },
      });
      console.log('DELETE commercial successful', commercialId);
      return true;
    } catch (error) {
      console.error('DELETE commercial failed:', error);
      return false;
    }
  }
}

export const commercialService = new CommercialService();
