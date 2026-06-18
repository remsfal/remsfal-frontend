import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProjectOrganizationSettings from '@/components/projectMembership/ProjectOrganizationSettings.vue';
import NewProjectOrganizationButton from '@/components/projectMembership/NewProjectOrganizationButton.vue';
import {projectOrganizationService,
  type ProjectOrganizationJson,
  type MemberRole,} from '@/services/ProjectOrganizationService';

const { mockToastAdd } = vi.hoisted(() => ({mockToastAdd: vi.fn(),}));

vi.mock('primevue/usetoast', () => ({useToast: () => ({ add: mockToastAdd }),}));

vi.mock('../../../src/services/ProjectOrganizationService');

describe('ProjectOrganizationSettings.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectOrganizationSettings>>;

  const mockOrganizations: ProjectOrganizationJson[] = [
    {
      organizationId: '11111111-1111-1111-1111-111111111111', organizationName: 'Test GmbH', role: 'MANAGER' as MemberRole 
    },
    {
      organizationId: '22222222-2222-2222-2222-222222222222', organizationName: 'Muster AG', role: 'STAFF' as MemberRole 
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(projectOrganizationService.getOrganizations).mockResolvedValue({ organizations: mockOrganizations });

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

  test('onMounted - calls fetchOrganizations on mount', () => {
    expect(projectOrganizationService.getOrganizations).toHaveBeenCalledOnce();
    expect(projectOrganizationService.getOrganizations).toHaveBeenCalledWith('test-project-id');
  });

  test('updateOrganizationRole - skips update when organizationId is undefined', async () => {
    const org: ProjectOrganizationJson = { organizationName: 'Test GmbH', role: 'MANAGER' };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).updateOrganizationRole(org);

    expect(projectOrganizationService.updateOrganizationRole).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Organization ID is undefined, cannot update role');
    consoleSpy.mockRestore();
  });

  test('fetchOrganizations - handles fetch error gracefully', async () => {
    vi.mocked(projectOrganizationService.getOrganizations).mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).fetchOrganizations();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch organizations', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('fetchOrganizations - treats undefined organizations list as empty array', async () => {
    vi.mocked(projectOrganizationService.getOrganizations).mockResolvedValueOnce({ organizations: undefined });

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).fetchOrganizations();
    await flushPromises();

    const nameCells = wrapper.findAll('td').filter((td) => td.text() === 'Test GmbH' || td.text() === 'Muster AG');
    expect(nameCells.length).toBe(0);
  });

  test('updateOrganizationRole - handles update error gracefully', async () => {
    const org: ProjectOrganizationJson = {
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER',
    };
    vi.mocked(projectOrganizationService.updateOrganizationRole).mockRejectedValueOnce(new Error('Update failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).updateOrganizationRole(org);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update organization role:', expect.anything());
    consoleSpy.mockRestore();
  });

  test('removeOrganization - handles remove error gracefully', async () => {
    const orgId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa';
    vi.mocked(projectOrganizationService.removeOrganization).mockRejectedValueOnce(new Error('Remove failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).removeOrganization(orgId);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to remove organization:', expect.anything());
    consoleSpy.mockRestore();
  });

  test('updateOrganizationRole - shows success toast on successful update', async () => {
    const org: ProjectOrganizationJson = {
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER',
    };
    vi.mocked(projectOrganizationService.updateOrganizationRole).mockResolvedValueOnce(org);

    await (wrapper.vm as InstanceType<typeof ProjectOrganizationSettings>).updateOrganizationRole(org);

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  test('onNewOrganization - refetches organizations and shows success toast', async () => {
    vi.mocked(projectOrganizationService.getOrganizations).mockResolvedValueOnce({ organizations: [] });

    const newOrgButton = wrapper.findComponent(NewProjectOrganizationButton);
    await newOrgButton.vm.$emit('newOrganization', 'New GmbH');
    await flushPromises();

    expect(projectOrganizationService.getOrganizations).toHaveBeenCalledWith('test-project-id');
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });
});
