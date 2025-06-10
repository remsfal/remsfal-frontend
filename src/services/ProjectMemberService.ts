import axios from 'axios';
import { ref } from 'vue';

export const memberRoles = ref([
  { label: 'Eigentümer', value: 'PROPRIETOR' },
  { label: 'Verwalter', value: 'MANAGER' },
  { label: 'Vermieter', value: 'LESSOR' },
  { label: 'Mitarbeiter', value: 'STAFF' },
  { label: 'Kollaborateur', value: 'COLLABORATOR' },
]);

export interface Member {
  id?: string;
  name?: string;
  email?: string;
  role?: string | null;
  isActive?: boolean;
}

export interface MemberList {
  members: Member[];
}

class ProjectMemberService {
  private readonly baseUrl: string = '/api/v1/projects';

  async getMembers(projectId: string): Promise<MemberList> {
    return axios.get(`${this.baseUrl}/${projectId}/members`).then((response) => {
      const list: MemberList = response.data;
      console.log('GET members:', list);
      return list;
    });
  }

  async addMember(projectId: string, member: Member): Promise<Member> {
    try {
      console.log(`Adding member to project ${projectId}:`, member);

      const response = await axios.post(`${this.baseUrl}/${projectId}/members`, {
        email: member.email,
        role: member.role,
      });

      console.log('Member added successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateMemberRole(projectId: string, member: Member): Promise<Member> {
    const originalMember = { ...member };

    try {
      const payload = {
        role: member.role,
      };
      console.log('Sending request to update member role:', payload);
      const response = await axios.patch(
        `${this.baseUrl}/${projectId}/members/${member.id}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Member role updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Failed to update member role, rolling back to original state:',
        originalMember,
      );
      member.role = originalMember.role;
      this.handleError(error);
      throw error;
    }
  }

  async removeMember(projectId: string, memberId: string): Promise<void> {
    try {
      console.log(`Attempting to remove member with projectId=${projectId}, memberId=${memberId}`);

      const response = await axios.delete(`${this.baseUrl}/${projectId}/members/${memberId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Member removed successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Server error:', error.response.status);
      } else if (error.request) {
        console.error('Network error: No response from server.');
      } else {
        console.error('Error in setting up request:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

export const projectMemberService: ProjectMemberService = new ProjectMemberService();
