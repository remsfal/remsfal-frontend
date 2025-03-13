import axios from 'axios';
import { projectMemberService, type Member } from '../../src/services/projectMemberService';
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('axios');
const mockedAxios = axios as unknown as {
  get: Mock;
  post: Mock;
  patch: Mock;
  delete: Mock;
};

describe('projectMemberService', () => {
  const projectId = 'project123';
  const member: Member = {
    id: 'member123',
    email: 'test@example.com',
    role: 'developer',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch members for a project', async () => {
    const mockMembers = [
      { id: '1', email: 'user1@example.com', role: 'admin' },
      { id: '2', email: 'user2@example.com', role: 'developer' },
    ];
    mockedAxios.get.mockResolvedValue({ data: { members: mockMembers } });

    const result = await projectMemberService.getMembers(projectId);

    expect(mockedAxios.get).toHaveBeenCalledWith(`/api/v1/projects/${projectId}/members`);
    expect(result.members).toEqual(mockMembers);
  });

  it('should handle errors when fetching members', async () => {
    const error = new Error('Network Error');
    mockedAxios.get.mockRejectedValue(error);

    await expect(projectMemberService.getMembers(projectId)).rejects.toThrow(error);
  });

  it('should add a member to a project', async () => {
    const mockResponse = { id: 'member123', email: member.email, role: member.role };
    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const result = await projectMemberService.addMember(projectId, member);

    expect(mockedAxios.post).toHaveBeenCalledWith(`/api/v1/projects/${projectId}/members`, {
      email: member.email,
      role: member.role,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors when adding a member', async () => {
    const error = new Error('Failed to add member');
    mockedAxios.post.mockRejectedValue(error);

    await expect(projectMemberService.addMember(projectId, member)).rejects.toThrow(error);
  });

  it('should update a member role in a project', async () => {
    const mockResponse = { id: member.id, email: member.email, role: 'manager' };
    mockedAxios.patch.mockResolvedValue({ data: mockResponse });

    const result = await projectMemberService.updateMemberRole(projectId, member);

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      `/api/v1/projects/${projectId}/members/${member.id}`,
      { role: 'developer' },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors when updating a member role', async () => {
    const error = new Error('Failed to update member role');
    mockedAxios.patch.mockRejectedValue(error);

    await expect(projectMemberService.updateMemberRole(projectId, member)).rejects.toThrow(error);
  });

  it('should remove a member from a project', async () => {
    const mockResponse = { success: true };
    mockedAxios.delete.mockResolvedValue({ data: mockResponse });

    const result = await projectMemberService.removeMember(projectId, member.id!);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `/api/v1/projects/${projectId}/members/${member.id}`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors when removing a member', async () => {
    const error = new Error('Failed to remove member');
    mockedAxios.delete.mockRejectedValue(error);

    await expect(projectMemberService.removeMember(projectId, member.id!)).rejects.toThrow(error);
  });
});
