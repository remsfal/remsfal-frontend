import {
 apiClient, type ApiPaths, type ApiComponents 
} from '@/services/ApiClient.ts';

type Paths = Extract<
  keyof ApiPaths,
  '/api/v1/projects/{projectId}/members' | '/api/v1/projects/{projectId}/members/{memberId}'
>;
const membersPath: Paths = '/api/v1/projects/{projectId}/members';
const memberPath: Paths = '/api/v1/projects/{projectId}/members/{memberId}';

export type MemberRole = ApiComponents['schemas']['MemberRole'];
export type ProjectMemberList = ApiComponents['schemas']['ProjectMemberListJson'];
export type ProjectMember = ApiComponents['schemas']['ProjectMemberJson'];

class ProjectMemberService {
  async getMembers(projectId: string): Promise<ProjectMemberList> {
    return apiClient.get<ProjectMemberList>(membersPath, { pathParams: { projectId: projectId } }).then((response) => {
      return response.data;
    });
  }

  async addMember(projectId: string, member: ProjectMember): Promise<ProjectMember> {
    return apiClient
      .post<ProjectMember>(membersPath, member, { pathParams: { projectId: projectId } })
      .then((response) => {
        return response.data;
      });
  }

  async updateMemberRole(projectId: string, memberId: string, member: ProjectMember): Promise<ProjectMember> {
    return apiClient
      .patch<ProjectMember>(memberPath, member, { pathParams: { projectId: projectId, memberId: memberId } })
      .then((response) => {
        return response.data;
      });
  }

  async removeMember(projectId: string, memberId: string): Promise<void> {
    return apiClient.delete(memberPath, { pathParams: { projectId: projectId, memberId: memberId } });
  }
}

export const projectMemberService = new ProjectMemberService();
