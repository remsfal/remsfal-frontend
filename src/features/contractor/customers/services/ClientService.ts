import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type ClientProjectListJson = Readable<ApiComponents['schemas']['ClientProjectListJson']>;
export type ClientProjectJson = Readable<ApiComponents['schemas']['ClientProjectJson']>;

class ClientService {
  async getClients(organizationId: string): Promise<ClientProjectListJson> {
    return apiClient.get('/api/v1/organizations/{organizationId}/clients', { pathParams: { organizationId } });
  }
}

export const clientService = new ClientService();
