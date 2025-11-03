import { describe, it, expect } from 'vitest';
import { projectMemberService, type ProjectMember } from '../../src/services/ProjectMemberService';
import { server } from '../mocks/server';
import { testErrorHandling, useTestServer } from '../utils/testHelpers';

useTestServer(server);

describe('projectMemberService (MSW)', () => {
  const projectId = 'project123';
  const member: ProjectMember = {
    email: 'test@example.com',
    role: 'COLLABORATOR',
  };

  it('should fetch members for a project', async () => {
    const result = await projectMemberService.getMembers(projectId);
    expect(result.members).toHaveLength(2);
    expect(result.members[0]).toMatchObject({ role: 'MANAGER' });
  });

  it('should handle errors when fetching members', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/members',
      'get',
      500,
      () => projectMemberService.getMembers(projectId),
    );
  });

  it('should add a member to a project', async () => {
    const newMember = await projectMemberService.addMember(projectId, member);
    expect(newMember).toMatchObject({
      email: member.email,
      role: member.role,
    });
  });

  it('should handle errors when adding a member', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/members',
      'post',
      400,
      () => projectMemberService.addMember(projectId, member),
    );
  });

  it('should update a member role in a project', async () => {
    const updatedMember = await projectMemberService.updateMemberRole(projectId, 'member123', {role: member.role,});
    expect(updatedMember).toMatchObject({ role: member.role });
  });

  it('should handle errors when updating a member role', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/members/:memberId',
      'patch',
      404,
      () => projectMemberService.updateMemberRole(projectId, 'member123', { role: member.role }),
    );
  });

  it('should remove a member from a project', async () => {
    const response = await projectMemberService.removeMember(projectId, 'member123');
    expect(response).toBeDefined(); // matches the actual returned response object
  });

  it('should handle errors when removing a member', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/members/:memberId',
      'delete',
      403,
      () => projectMemberService.removeMember(projectId, 'member123'),
    );
  });
});
