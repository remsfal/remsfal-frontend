import axios from 'axios';

export interface ProjectMember {
    id?: string;
    email: string;
    role?: string;
}

const API_BASE_URL = '/api/v1';

class ProjectMemberService {


    static async getMembers(projectId: string) {
        const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/members`);
        return response.data.members;
    }

    static async addMember(projectId: string, member: ProjectMember) {
        try {
            console.log(`Adding member to project ${projectId}:`, member);

            const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/members`, {
                email: member.email,
                role: member.role,
            });

            console.log("Member added successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to add member:", error || error);
            throw error;
        }
    }

    static async updateMemberRole(projectId: string, member: ProjectMember) {
        try {
            const payload = member;
            console.log("Sending request to update member role:", payload);
            const response = await axios.patch(
                `${API_BASE_URL}/projects/${projectId}/members/${member.id}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Member role updated successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to update member role:", error);
            throw error;
        }
    }

    static async removeMember(projectId: string, memberId: string) {
        try {
            console.log(`Attempting to remove member with projectId=${projectId}, memberId=${memberId}`);

            const response = await axios.delete(
                `${API_BASE_URL}/projects/${projectId}/members/${memberId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Member removed successfully:", response.data);
            return response.data;
        } catch (error) {
            if (error) {
                console.error("Error response:", error);
            } else {
                console.error("Unexpected error:", error);
            }
            throw error;
        }
    }
}

export default ProjectMemberService;
