import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import OrganizationMemberSettings from '@/components/projectMembership/OrganizationMemberSettings.vue';
import NewOrganizationMemberButton from '@/components/projectMembership/NewOrganizationMemberButton.vue';
import ProjectMemberRoleSelect from '@/components/projectMembership/ProjectMemberRoleSelect.vue';
import {organizationMemberService,
  type OrganizationMemberJson,
  type MemberRole,} from '@/services/OrganizationMemberService';
import type { ProjectMemberJson } from '@/services/ProjectMemberService';

const { mockToastAdd } = vi.hoisted(() => ({mockToastAdd: vi.fn(),}));

vi.mock('primevue/usetoast', () => ({useToast: () => ({ add: mockToastAdd }),}));

vi.mock('../../../src/services/OrganizationMemberService');

describe('OrganizationMemberSettings.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof OrganizationMemberSettings>>;

  const mockOrganizations: OrganizationMemberJson[] = [
    {
      organizationId: '11111111-1111-1111-1111-111111111111', organizationName: 'Test GmbH', role: 'MANAGER' as MemberRole 
    },
    {
      organizationId: '22222222-2222-2222-2222-222222222222', organizationName: 'Muster AG', role: 'STAFF' as MemberRole 
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValue({ organizations: mockOrganizations });

    wrapper = mount(OrganizationMemberSettings, { props: { projectId: 'test-project-id' } });

    await wrapper.vm.$nextTick();
  });

  test('fetchOrganizations - loads organizations successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.at(0)?.text()).toEqual('Test GmbH');
    expect(rows.at(3)?.text()).toEqual('Muster AG');
  });

  test('updateOrganizationRole - updates role successfully', async () => {
    const org: OrganizationMemberJson = {
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER',
    };

    vi.mocked(organizationMemberService.updateOrganizationRole).mockResolvedValueOnce(org);

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).updateOrganizationRole(org);

    expect(organizationMemberService.updateOrganizationRole).toHaveBeenCalledWith(
      'test-project-id',
      '11111111-1111-1111-1111-111111111111',
      { role: 'MANAGER' },
    );
  });

  test('removeOrganization - removes organization successfully', async () => {
    const orgId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa';

    const removeMock = vi.mocked(organizationMemberService.removeOrganization).mockResolvedValueOnce();
    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValueOnce({ organizations: [] });

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).removeOrganization(orgId);

    expect(removeMock).toHaveBeenCalledWith('test-project-id', orgId);
    expect(organizationMemberService.getOrganizations).toHaveBeenCalledWith('test-project-id');
  });

  test('removeOrganization - rejects invalid UUID', async () => {
    const removeMock = vi.mocked(organizationMemberService.removeOrganization);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).removeOrganization('invalid-id');

    expect(removeMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Invalid organizationId format:', 'invalid-id');

    consoleSpy.mockRestore();
  });

  test('onMounted - calls fetchOrganizations on mount', () => {
    expect(organizationMemberService.getOrganizations).toHaveBeenCalledOnce();
    expect(organizationMemberService.getOrganizations).toHaveBeenCalledWith('test-project-id');
  });

  test('updateOrganizationRole - skips update when organizationId is undefined', async () => {
    const org: OrganizationMemberJson = { organizationName: 'Test GmbH', role: 'MANAGER' };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).updateOrganizationRole(org);

    expect(organizationMemberService.updateOrganizationRole).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Organization ID is undefined, cannot update role');
    consoleSpy.mockRestore();
  });

  test('fetchOrganizations - handles fetch error gracefully', async () => {
    vi.mocked(organizationMemberService.getOrganizations).mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).fetchOrganizations();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch organizations', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('fetchOrganizations - treats undefined organizations list as empty array', async () => {
    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValueOnce({ organizations: undefined });

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).fetchOrganizations();
    await flushPromises();

    const nameCells = wrapper.findAll('td').filter((td) => td.text() === 'Test GmbH' || td.text() === 'Muster AG');
    expect(nameCells.length).toBe(0);
  });

  test('updateOrganizationRole - handles update error gracefully', async () => {
    const org: OrganizationMemberJson = {
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER',
    };
    vi.mocked(organizationMemberService.updateOrganizationRole).mockRejectedValueOnce(new Error('Update failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).updateOrganizationRole(org);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update organization role:', expect.anything());
    consoleSpy.mockRestore();
  });

  test('removeOrganization - handles remove error gracefully', async () => {
    const orgId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa';
    vi.mocked(organizationMemberService.removeOrganization).mockRejectedValueOnce(new Error('Remove failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).removeOrganization(orgId);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to remove organization:', expect.anything());
    consoleSpy.mockRestore();
  });

  test('updateOrganizationRole - shows success toast on successful update', async () => {
    const org: OrganizationMemberJson = {
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER',
    };
    vi.mocked(organizationMemberService.updateOrganizationRole).mockResolvedValueOnce(org);

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).updateOrganizationRole(org);

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  test('onNewOrganization - refetches organizations and shows success toast', async () => {
    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValueOnce({ organizations: [] });

    const newOrgButton = wrapper.findComponent(NewOrganizationMemberButton);
    await newOrgButton.vm.$emit('newOrganization', 'New GmbH');
    await flushPromises();

    expect(organizationMemberService.getOrganizations).toHaveBeenCalledWith('test-project-id');
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });
});

describe('OrganizationMemberSettings.vue - member rows', () => {
  let wrapper: VueWrapper<InstanceType<typeof OrganizationMemberSettings>>;

  const mockOrganizationsWithMembers: OrganizationMemberJson[] = [
    {
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER' as MemberRole,
      members: [
        {
          id: 'member-1', name: 'Max Muster', email: 'max@test.de', role: 'MANAGER' as MemberRole, active: true,
        },
        {
          id: 'member-2', name: 'Erika Muster', email: 'erika@test.de', role: 'STAFF' as MemberRole, active: false,
        },
      ] as ProjectMemberJson[],
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValue({ organizations: mockOrganizationsWithMembers });

    wrapper = mount(OrganizationMemberSettings, { props: { projectId: 'test-project-id' } });

    await flushPromises();
  });

  test('renders member names and their translated roles', () => {
    expect(wrapper.text()).toContain('Max Muster');
    expect(wrapper.text()).toContain('Manager');
    expect(wrapper.text()).toContain('Erika Muster');
    expect(wrapper.text()).toContain('Mitarbeiter');
  });

  test('shows inactive suffix for an inactive member', () => {
    expect(wrapper.text()).toContain('Inaktiv');
  });

  test('does not render a role select for individual members', () => {
    const selects = wrapper.findAllComponents(ProjectMemberRoleSelect);
    expect(selects.length).toBe(mockOrganizationsWithMembers.length);
  });

  test('does not render a delete button for individual members', () => {
    const deleteButtons = wrapper.findAll('button').filter((b) => b.text() === 'Löschen');
    expect(deleteButtons.length).toBe(mockOrganizationsWithMembers.length);
  });

  test('updateOrganizationRole still targets the organization when member rows are present', async () => {
    const org = mockOrganizationsWithMembers[0];
    vi.mocked(organizationMemberService.updateOrganizationRole).mockResolvedValueOnce(org);

    await (wrapper.vm as InstanceType<typeof OrganizationMemberSettings>).updateOrganizationRole(org);

    expect(organizationMemberService.updateOrganizationRole).toHaveBeenCalledWith(
      'test-project-id',
      org.organizationId,
      { role: org.role },
    );
  });
});
