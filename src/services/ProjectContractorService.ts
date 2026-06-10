import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type ContractorJson = ApiComponents['schemas']['ContractorJson'];
export type ContractorListJson = ApiComponents['schemas']['ContractorListJson'];

class ProjectContractorService {
  async getContractors(projectId: string, limit = 100, offset = 0): Promise<ContractorListJson> {
    return apiClient.get('/api/v1/projects/{projectId}/contractors', {
      pathParams: { projectId },
      params: { limit, offset },
    });
  }

  async createContractor(projectId: string, data: ContractorJson): Promise<void> {
    await apiClient.post('/api/v1/projects/{projectId}/contractors', data, {
      pathParams: { projectId },
    });
  }

  async getContractor(projectId: string, contractorId: string): Promise<ContractorJson> {
    return apiClient.get('/api/v1/projects/{projectId}/contractors/{contractorId}', {
      pathParams: { projectId, contractorId },
    });
  }

  async updateContractor(
    projectId: string,
    contractorId: string,
    data: ContractorJson,
  ): Promise<ContractorJson> {
    return apiClient.patch(
      '/api/v1/projects/{projectId}/contractors/{contractorId}',
      data,
      { pathParams: { projectId, contractorId } },
    );
  }

  async deleteContractor(projectId: string, contractorId: string): Promise<void> {
    await apiClient.delete('/api/v1/projects/{projectId}/contractors/{contractorId}', {
      pathParams: { projectId, contractorId },
    });
  }
}

export const projectContractorService = new ProjectContractorService();
