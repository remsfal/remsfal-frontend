import { typedRequest } from '@/services/api/typedRequest';
import { ref } from 'vue';

export const memberRoles = ref([
  { label: 'Eigentümer', value: 'PROPRIETOR' },
  { label: 'Verwalter', value: 'MANAGER' },
  { label: 'Vermieter', value: 'LESSOR' },
  { label: 'Mitarbeiter', value: 'STAFF' },
  { label: 'Kollaborateur', value: 'COLLABORATOR' },
]);

export type MemberRole  = 'PROPRIETOR' | 'MANAGER' | 'LESSOR' | 'STAFF' | 'COLLABORATOR' 


export interface Member {
  id?: string;
  name?: string;
  email?: string;
  role: MemberRole;
  active?: boolean;      
  privileged?: boolean;  
}


export interface MemberList {
  members: Member[];
}

class ProjectMemberService {
  private readonly baseUrl = '/api/v1/projects';
  
  async getMembers(projectId: string): Promise<MemberList> {
    const response = await typedRequest<
      '/api/v1/projects/{projectId}/members',  // exact path string as in your OpenAPI paths
      'get'
    >(
      'get',
      `${this.baseUrl}/{projectId}/members`,
      {
        pathParams: { projectId },
      }
    );
    console.log('Backend response for getMembers:', response); 
  
    return response as MemberList;  // cast to fallback interface if TS complains
  }
  
  async addMember(projectId: string, member: Member): Promise<Member> {
    if (!member.role) throw new Error('Member role is required');
  
    const response = await typedRequest<'/api/v1/projects/{projectId}/members', 'post'>(
      'post',
      '/api/v1/projects/{projectId}/members',
      {
        pathParams: { projectId },
        body: {
          email: member.email,
          role: member.role,
        },
      }
    );
    console.log('Member added successfully:', response);
    return response;
  }
  
  async updateMemberRole(projectId: string, member: Member): Promise<Member> {
    if (!member.id) throw new Error('Member id is required for update');
    if (!member.role) throw new Error('Member role is required');
  
    const response = await typedRequest<
      '/api/v1/projects/{projectId}/members/{memberId}',
      'patch'
    >(
      'patch',
      `${this.baseUrl}/{projectId}/members/{memberId}`,
      {
        pathParams: { projectId, memberId: member.id },
        body: { role: member.role },
      }
    );
  
    console.log('Member role updated successfully:', response);
    return response as Member;
  }
  
  async removeMember(projectId: string, memberId: string): Promise<{ success: boolean }> {
    await typedRequest(
      'delete',
      `${this.baseUrl}/{projectId}/members/{memberId}`,
      { pathParams: { projectId, memberId } }
    );
    console.log('Member removed successfully');
    return { success: true };
  }  
}

export const projectMemberService = new ProjectMemberService();
