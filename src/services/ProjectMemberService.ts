import axios from 'axios';

export interface Member {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface MemberList {
  members: Member[];
}

const API_BASE_URL = '/api/v1/projects';

class ProjectMemberService {

  static async getMembers(projectId: string): Promise<MemberList> {
    const response = await axios.get(`${API_BASE_URL}/${projectId}/members`);
    return response.data.members;
  }

  static async addMember(projectId: string, member: Member): Promise<Member> {
    try {
      console.log(`Adding member to project ${projectId}:`, member);

      const response = await axios.post(`${API_BASE_URL}/${projectId}/members`, {
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

  static async updateMemberRole(projectId: string, member: Member): Promise<Member> {
    const originalMember = { ...member };

    try {
      const payload = {
        id: member.id,
        email: member.email,
        role: member.role,
      };
      console.log('Sending request to update member role:', payload);
      const response = await axios.patch(
        `${API_BASE_URL}/projects/${projectId}/members/${member.id}`,
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

  static async removeMember(projectId: string, memberId: string): Promise<void> {
    try {
      console.log(`Attempting to remove member with projectId=${projectId}, memberId=${memberId}`);

      const response = await axios.delete(
        `${API_BASE_URL}/projects/${projectId}/members/${memberId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Member removed successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private static handleError(error: unknown) {
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

export default ProjectMemberService;
