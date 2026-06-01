import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ProjectOrganizationSettings from '@/components/projectMembership/ProjectOrganizationSettings.vue';
import {
  projectOrganizationService,
  type ProjectOrganizationJson,
  type MemberRole,
} from '@/services/ProjectOrganizationService';

vi.mock('../../../src/services/ProjectOrganizationService');

describe('ProjectOrganizationSettings.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectOrganizationSettings>>;

  const mockOrganizations: ProjectOrganizationJson[] = [
    { organizationId: '11111111-1111-1111-1111-111111111111', organizationName: 'Test GmbH', role: 'MANAGER' as MemberRole },
    { organizationId: '22222222-2222-2222-2222-222222222222', organizationName: 'Muster AG', role: 'STAFF' as MemberRole },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(projectOrganizationService.getOrganizations).mockResolvedValue({
      organizations: mockOrganizations,
    });

    wrapper = mount(ProjectOrganizationSettings, { props: { projectId: 'test-project-id' } });

    await wrapper.vm.$nextTick();
  });

  test('fetchOrganizations - loads organizations successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.at(0)?.text()).toEqual('Test GmbH');
    expect(rows.at(3)?.text()).toEqual('Muster AG');
  });

  test('updateOrganizationRole - updates role successfully', async () => {
    const org: ProjectOrganizationJson = {
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER',
    };

    vi.mocked(projectOrganizationService.updateOrganizationRole).mockResolvedValueOnce(org);

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).updateOrganizationRole(org);

    expect(projectOrganizationService.updateOrganizationRole).toHaveBeenCalledWith(
      'test-project-id',
      '11111111-1111-1111-1111-111111111111',
      { role: 'MANAGER' },
    );
  });

  test('removeOrganization - removes organization successfully', async () => {
    const orgId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa';

    const removeMock = vi.mocked(projectOrganizationService.removeOrganization).mockResolvedValueOnce();
    vi.mocked(projectOrganizationService.getOrganizations).mockResolvedValueOnce({ organizations: [] });

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).removeOrganization(orgId);

    expect(removeMock).toHaveBeenCalledWith('test-project-id', orgId);
    expect(projectOrganizationService.getOrganizations).toHaveBeenCalledWith('test-project-id');
  });

  test('removeOrganization - rejects invalid UUID', async () => {
    const removeMock = vi.mocked(projectOrganizationService.removeOrganization);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).removeOrganization('invalid-id');

    expect(removeMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Invalid organizationId format:', 'invalid-id');

    consoleSpy.mockRestore();
  });
});
