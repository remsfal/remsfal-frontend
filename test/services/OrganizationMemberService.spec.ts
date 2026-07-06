import { describe, it, expect } from 'vitest';
import { organizationMemberService, type OrganizationMemberJson } from '@/services/OrganizationMemberService';
import { server } from '../mocks/server';
import { testErrorHandling } from '../utils/testHelpers';

describe('organizationMemberService (MSW)', () => {
  const projectId = 'project123';
  const org: OrganizationMemberJson = {
    organizationId: '11111111-1111-1111-1111-111111111111',
    role: 'MANAGER',
  };

  it('should fetch organizations for a project', async () => {
    const result = await organizationMemberService.getOrganizations(projectId);
    expect(result.organizations).toHaveLength(2);
    expect(result.organizations![0]).toMatchObject({ role: 'MANAGER' });
  });

  it('should handle errors when fetching organizations', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/organizations',
      'get',
      500,
      () => organizationMemberService.getOrganizations(projectId),
    );
  });

  it('should add an organization to a project', async () => {
    const newOrg = await organizationMemberService.addOrganization(projectId, org);
    expect(newOrg).toMatchObject({ role: org.role });
  });

  it('should handle errors when adding an organization', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/organizations',
      'post',
      400,
      () => organizationMemberService.addOrganization(projectId, org),
    );
  });

  it('should update an organization role in a project', async () => {
    const updatedOrg = await organizationMemberService.updateOrganizationRole(
      projectId,
      '11111111-1111-1111-1111-111111111111',
      { role: org.role },
    );
    expect(updatedOrg).toMatchObject({ role: org.role });
  });

  it('should handle errors when updating an organization role', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/organizations/:organizationId',
      'patch',
      404,
      () => organizationMemberService.updateOrganizationRole(projectId, 'org123', { role: org.role }),
    );
  });

  it('should remove an organization from a project', async () => {
    const response = await organizationMemberService.removeOrganization(projectId, 'org123');
    expect(response).toBeDefined();
  });

  it('should handle errors when removing an organization', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/organizations/:organizationId',
      'delete',
      403,
      () => organizationMemberService.removeOrganization(projectId, 'org123'),
    );
  });
});
