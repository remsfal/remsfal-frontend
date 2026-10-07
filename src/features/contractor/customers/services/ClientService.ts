import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type ClientListJson = Readable<ApiComponents['schemas']['ClientListJson']>;
export type ClientProjectJson = Readable<ApiComponents['schemas']['ClientProjectJson']>;

class ClientService {
  async getClients(organizationId: string, limit = 100, offset = 0): Promise<ClientListJson> {
    return apiClient.get('/api/v1/organizations/{organizationId}/clients', {
      pathParams: { organizationId },
      params: { limit, offset },
    });
  }
}

export const clientService = new ClientService();
