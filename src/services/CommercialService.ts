// src/services/CommercialService.ts
import { typedRequest } from '@/services/api/typedRequest';
import type { components } from '@/services/api/platform-schema';

export type Commercial = components['schemas']['CommercialJson'];

export default class CommercialService {
  static readonly BASE_PATH = '/api/v1/projects' as const;

  // Create a new commercial unit
  async createCommercial(projectId: string, buildingId: string, data: Commercial): Promise<Commercial> {
    const commercial = await typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/commercials',
      'post',
      Commercial
    >(
      'post',
      `${CommercialService.BASE_PATH}/{projectId}/buildings/{buildingId}/commercials`,
      { pathParams: { projectId, buildingId }, body: data },
    );
    console.log('POST create commercial:', commercial);
    return commercial;
  }

  // Get a single commercial unit
  async getCommercial(projectId: string, commercialId: string): Promise<Commercial> {
    try {
      const commercial = await typedRequest<
        '/api/v1/projects/{projectId}/commercials/{commercialId}',
        'get',
        Commercial
      >(
        'get',
        `${CommercialService.BASE_PATH}/{projectId}/commercials/{commercialId}`,
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
    const updated = await typedRequest<
      '/api/v1/projects/{projectId}/commercials/{commercialId}',
      'patch',
      Commercial
    >(
      'patch',
      `${CommercialService.BASE_PATH}/{projectId}/commercials/{commercialId}`,
      { pathParams: { projectId, commercialId }, body: data },
    );
    console.log('PATCH update commercial:', updated);
    return updated;
  }

  // Delete a commercial unit (returns boolean for success/failure)
  async deleteCommercial(projectId: string, commercialId: string): Promise<boolean> {
    try {
      await typedRequest<
        '/api/v1/projects/{projectId}/commercials/{commercialId}',
        'delete'
      >(
        'delete',
        `${CommercialService.BASE_PATH}/{projectId}/commercials/{commercialId}`,
        { pathParams: { projectId, commercialId } },
      );
      console.log('DELETE commercial successful', commercialId);
      return true;
    } catch (error) {
      console.error('DELETE commercial failed:', error);
      return false;
    }
  }
}

export const commercialService = new CommercialService();
