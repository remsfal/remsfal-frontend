import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { projectMemberService, type Member } from '../../src/services/ProjectMemberService';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('projectMemberService (MSW)', () => {
  const projectId = 'project123';
  const member: Member = {
    id: 'member123',
    email: 'test@example.com',
    role: 'COLLABORATOR',
  };

  it('should fetch members for a project', async () => {
    const result = await projectMemberService.getMembers(projectId);

    expect(result.members).toHaveLength(2);
    expect(result.members[0]).toMatchObject({ role: 'MANAGER' });
  });

  it('should handle errors when fetching members', async () => {
    server.use(
      http.get('/api/v1/projects/:projectId/members', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }),
    );

    await expect(projectMemberService.getMembers(projectId)).rejects.toThrow();
  });

  it('should add a member to a project', async () => {
    const newMember = await projectMemberService.addMember(projectId, member);

    expect(newMember).toMatchObject({
      email: member.email,
      role: member.role,
    });
  });

  it('should handle errors when adding a member', async () => {
    server.use(
      http.post('/api/v1/projects/:projectId/members', () => {
        return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
      }),
    );

    await expect(projectMemberService.addMember(projectId, member)).rejects.toThrow();
  });

  it('should update a member role in a project', async () => {
    // Using member.id! assumes the ID is always defined. In tests, this is safe because `member` is initialized with an ID.
// In production code, consider adding a guard to avoid potential runtime errors if member.id is undefined.
    const updatedMember = await projectMemberService.updateMemberRole(projectId, member.id!, {
      role: member.role,
    });

    expect(updatedMember).toMatchObject({
      id: member.id,
      role: member.role,
    });
  });

  it('should handle errors when updating a member role', async () => {
    server.use(
      http.patch('/api/v1/projects/:projectId/members/:memberId', () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      }),
    );

    await expect(
      projectMemberService.updateMemberRole(projectId, member.id!, { role: member.role }),
    ).rejects.toThrow();
  });

  it('should remove a member from a project', async () => {
    await expect(projectMemberService.removeMember(projectId, member.id!)).resolves.toBeUndefined();
  });

  it('should handle errors when removing a member', async () => {
    server.use(
      http.delete('/api/v1/projects/:projectId/members/:memberId', () => {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
      }),
    );

    await expect(projectMemberService.removeMember(projectId, member.id!)).rejects.toThrow();
  });
});
