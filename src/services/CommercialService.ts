import { typedRequest } from '../../src/services/api/typedRequest';

export interface CommercialUnit {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  commercialSpace?: number;
  usableSpace?: number;
  heatingSpace?: number;
}

class CommercialService {
  private readonly baseUrl = '/api/v1/projects';

  async createCommercial(
    projectId: string,
    buildingId: string,
    commercial: CommercialUnit,
  ): Promise<CommercialUnit> {
    const path = '/api/v1/projects/{projectId}/buildings/{buildingId}/commercials' as const;
    const result = await typedRequest('post', path, {
      body: commercial,
      pathParams: { projectId, buildingId },
    });
    return result as CommercialUnit;
  }

  async getCommercial(projectId: string, commercialId: string): Promise<CommercialUnit> {
    const path = '/api/v1/projects/{projectId}/commercials/{commercialId}';
    const result = await typedRequest('get', path, {
      pathParams: { projectId, commercialId },
    });
    return result as CommercialUnit;
  }

  async updateCommercial(
    projectId: string,
    commercialId: string,
    commercial: CommercialUnit,
  ): Promise<CommercialUnit> {
    const path = '/api/v1/projects/{projectId}/commercials/{commercialId}' as const;
    const result = await typedRequest('patch', path, {
      body: commercial,
      pathParams: { projectId, commercialId },
    });
    return result as CommercialUnit;
  }

  async deleteCommercial(projectId: string, commercialId: string): Promise<void> {
    const path = '/api/v1/projects/{projectId}/commercials/{commercialId}' as const;
    await typedRequest('delete', path, {
      pathParams: { projectId, commercialId },
    });
  }
}

export const commercialService = new CommercialService();
