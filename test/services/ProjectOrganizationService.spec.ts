import { describe, it, expect } from 'vitest';
import { projectOrganizationService, type ProjectOrganizationJson } from '@/services/ProjectOrganizationService';
import { server } from '../mocks/server';
import { testErrorHandling, useTestServer } from '../utils/testHelpers';

useTestServer(server);

describe('projectOrganizationService (MSW)', () => {
  const projectId = 'project123';
  const org: ProjectOrganizationJson = {
    organizationId: '11111111-1111-1111-1111-111111111111',
    role: 'MANAGER',
  };

  it('should fetch organizations for a project', async () => {
    const result = await projectOrganizationService.getOrganizations(projectId);
    expect(result.organizations).toHaveLength(2);
    expect(result.organizations![0]).toMatchObject({ role: 'MANAGER' });
  });

  it('should handle errors when fetching organizations', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/organizations',
      'get',
      500,
      () => projectOrganizationService.getOrganizations(projectId),
    );
  });

  it('should add an organization to a project', async () => {
    const newOrg = await projectOrganizationService.addOrganization(projectId, org);
    expect(newOrg).toMatchObject({ role: org.role });
  });

  it('should handle errors when adding an organization', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/organizations',
      'post',
      400,
      () => projectOrganizationService.addOrganization(projectId, org),
    );
  });

  it('should update an organization role in a project', async () => {
    const updatedOrg = await projectOrganizationService.updateOrganizationRole(
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
      () => projectOrganizationService.updateOrganizationRole(projectId, 'org123', { role: org.role }),
    );
  });

  it('should remove an organization from a project', async () => {
    const response = await projectOrganizationService.removeOrganization(projectId, 'org123');
    expect(response).toBeDefined();
  });

  it('should handle errors when removing an organization', async () => {
    await testErrorHandling(
      server,
      '/api/v1/projects/:projectId/organizations/:organizationId',
      'delete',
      403,
      () => projectOrganizationService.removeOrganization(projectId, 'org123'),
    );
  });
});
