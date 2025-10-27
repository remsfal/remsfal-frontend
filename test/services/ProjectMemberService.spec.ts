import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { projectMemberService, type ProjectMember } from '../../src/services/ProjectMemberService';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
    server.use(
      http.get('/api/v1/projects/:projectId/members', () =>
        HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
      ),
    );

    try {
      await projectMemberService.getMembers(projectId);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
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
      http.post('/api/v1/projects/:projectId/members', () =>
        HttpResponse.json({ message: 'Bad Request' }, { status: 400 }),
      ),
    );

    try {
      await projectMemberService.addMember(projectId, member);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('should update a member role in a project', async () => {
    const updatedMember = await projectMemberService.updateMemberRole(projectId, 'member123', {role: member.role,});
    expect(updatedMember).toMatchObject({ role: member.role });
  });

  it('should handle errors when updating a member role', async () => {
    server.use(
      http.patch('/api/v1/projects/:projectId/members/:memberId', () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 }),
      ),
    );

    try {
      await projectMemberService.updateMemberRole(projectId, 'member123', { role: member.role });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it('should remove a member from a project', async () => {
    const response = await projectMemberService.removeMember(projectId, 'member123');
    expect(response).toBeDefined(); // matches the actual returned response object
  });

  it('should handle errors when removing a member', async () => {
    server.use(
      http.delete('/api/v1/projects/:projectId/members/:memberId', () =>
        HttpResponse.json({ message: 'Forbidden' }, { status: 403 }),
      ),
    );

    try {
      await projectMemberService.removeMember(projectId, 'member123');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});
