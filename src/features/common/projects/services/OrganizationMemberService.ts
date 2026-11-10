import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type MemberRole = ApiComponents['schemas']['MemberRole'];
export type OrganizationMemberJson = Readable<ApiComponents['schemas']['OrganizationMemberJson']>;
export type OrganizationMemberWritableJson = Writable<ApiComponents['schemas']['OrganizationMemberJson']>;
export type OrganizationMemberListJson = Readable<ApiComponents['schemas']['OrganizationMemberListJson']>;

class OrganizationMemberService {
  async getOrganizations(projectId: string): Promise<OrganizationMemberListJson> {
    return apiClient.get('/api/v1/projects/{projectId}/organizations', { pathParams: { projectId } });
  }

  async addOrganization(projectId: string, org: OrganizationMemberWritableJson): Promise<OrganizationMemberJson> {
    return apiClient.post('/api/v1/projects/{projectId}/organizations', org, { pathParams: { projectId } });
  }

  async updateOrganizationRole(
    projectId: string,
    organizationId: string,
    org: OrganizationMemberWritableJson,
  ): Promise<OrganizationMemberJson> {
    return apiClient.patch(
      '/api/v1/projects/{projectId}/organizations/{organizationId}',
      org,
      { pathParams: { projectId, organizationId } },
    );
  }

  async removeOrganization(projectId: string, organizationId: string): Promise<void> {
    return apiClient.delete(
      '/api/v1/projects/{projectId}/organizations/{organizationId}',
      { pathParams: { projectId, organizationId } },
    );
  }
}

export const organizationMemberService = new OrganizationMemberService();
