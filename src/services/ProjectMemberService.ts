import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type MemberRole = ApiComponents['schemas']['MemberRole'];
export type ProjectMemberListJson = Readable<ApiComponents['schemas']['ProjectMemberListJson']>;
export type ProjectMemberJson = Readable<ApiComponents['schemas']['ProjectMemberJson']>;
export type ProjectMemberWritableJson = Writable<ApiComponents['schemas']['ProjectMemberJson']>;

class ProjectMemberService {
  async getMembers(projectId: string): Promise<ProjectMemberListJson> {
    return apiClient.get('/api/v1/projects/{projectId}/members', {pathParams: { projectId },});
  }

  async addMember(projectId: string, member: ProjectMemberWritableJson): Promise<ProjectMemberJson> {
    return apiClient.post('/api/v1/projects/{projectId}/members', member, {pathParams: { projectId },});
  }

  async updateMemberRole(projectId: string, memberId: string, member: ProjectMemberWritableJson): Promise<ProjectMemberJson> {
    return apiClient.patch('/api/v1/projects/{projectId}/members/{memberId}', member, {pathParams: { projectId, memberId },});
  }

  async removeMember(projectId: string, memberId: string): Promise<void> {
    return apiClient.delete('/api/v1/projects/{projectId}/members/{memberId}', {pathParams: { projectId, memberId },});
  }
}

export const projectMemberService = new ProjectMemberService();
