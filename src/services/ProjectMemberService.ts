import { typedRequest } from '@/services/api/typedRequest';
import type { paths } from '@/services/api/typedRequest';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

export type GetMembersResponse =
  paths['/api/v1/projects/{projectId}/members']['get']['responses']['200']['content']['application/json'];

export type Member = GetMembersResponse['members'][number];
export type AddMemberRequest =
  paths['/api/v1/projects/{projectId}/members']['post']['requestBody']['content']['application/json'];
export type UpdateMemberRoleRequest =
  paths['/api/v1/projects/{projectId}/members/{memberId}']['patch']['requestBody']['content']['application/json'];

class ProjectMemberService {
  private readonly baseUrl = '/api/v1/projects';

  async getMembers(projectId: string): Promise<GetMembersResponse> {
    const response = await typedRequest<'/api/v1/projects/{projectId}/members', 'get'>(
      'get',
      `${this.baseUrl}/{projectId}/members`,
      { pathParams: { projectId } },
    );

    // TEMPORARY cast to fallback type
    return response as GetMembersResponse;
  }

  async addMember(projectId: string, member: AddMemberRequest): Promise<Member> {
    const response = await typedRequest<'/api/v1/projects/{projectId}/members', 'post'>(
      'post',
      `${this.baseUrl}/{projectId}/members`,
      {
        pathParams: { projectId },
        body: member,
      },
    );

    return response as Member;
  }

  async updateMemberRole(
    projectId: string,
    memberId: string,
    body: UpdateMemberRoleRequest,
  ): Promise<Member> {
    const response = await typedRequest<'/api/v1/projects/{projectId}/members/{memberId}', 'patch'>(
      'patch',
      `${this.baseUrl}/{projectId}/members/{memberId}`,
      { pathParams: { projectId, memberId }, body },
    );

    return response as Member;
  }

  async removeMember(projectId: string, memberId: string): Promise<void> {
    await typedRequest<'/api/v1/projects/{projectId}/members/{memberId}', 'delete'>(
      'delete',
      `${this.baseUrl}/{projectId}/members/{memberId}`,
      { pathParams: { projectId, memberId } },
    );
  }
}

export const projectMemberService = new ProjectMemberService();

// ProjectMemberService.ts
export const memberRoles = [
  { label: t('roles.proprietor'), value: 'PROPRIETOR' },
  { label: t('roles.manager'), value: 'MANAGER' },
  { label: t('roles.lessor'), value: 'LESSOR' },
  { label: t('roles.staff'), value: 'STAFF' },
  { label: t('roles.collaborator'), value: 'COLLABORATOR' },
] as const;

export type MemberRole = (typeof memberRoles)[number]['value'];
// "PROPRIETOR" | "MANAGER" | "LESSOR" | "STAFF" | "COLLABORATOR"
