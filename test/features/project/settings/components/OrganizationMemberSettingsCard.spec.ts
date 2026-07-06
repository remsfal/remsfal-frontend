import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import OrganizationMemberSettingsCard from '@/features/project/settings/components/OrganizationMemberSettingsCard.vue';
import NewOrganizationMemberButton from '@/features/project/settings/components/NewOrganizationMemberButton.vue';
import ProjectMemberRoleSelect from '@/features/project/settings/components/ProjectMemberRoleSelect.vue';
import {organizationMemberService,
  type OrganizationMemberJson,
  type MemberRole,} from '@/services/OrganizationMemberService';
import type { ProjectMemberJson } from '@/services/ProjectMemberService';

const { mockToastAdd } = vi.hoisted(() => ({mockToastAdd: vi.fn(),}));

vi.mock('primevue/usetoast', () => ({useToast: () => ({ add: mockToastAdd }),}));

vi.mock('@/services/OrganizationMemberService');

// PrimeVue's Select emits 'change' after 'update:modelValue', so simulate both to mirror a real selection.
async function selectRole(roleSelect: ReturnType<VueWrapper['findComponent']>, role: MemberRole) {
  await roleSelect.vm.$emit('update:modelValue', role);
  await roleSelect.vm.$emit('change');
  await flushPromises();
}

describe('OrganizationMemberSettingsCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof OrganizationMemberSettingsCard>>;

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

    wrapper = mount(OrganizationMemberSettingsCard, { props: { projectId: 'test-project-id' } });

    await wrapper.vm.$nextTick();
  });

  test('fetchOrganizations - loads organizations successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.at(0)?.text()).toEqual('Test GmbH');
    expect(rows.at(3)?.text()).toEqual('Muster AG');
  });

  test('updateOrganizationRole - updates role successfully', async () => {
    vi.mocked(organizationMemberService.updateOrganizationRole).mockResolvedValueOnce({
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER',
    });

    const roleSelects = wrapper.findAllComponents(ProjectMemberRoleSelect);
    await selectRole(roleSelects[0], 'MANAGER');

    expect(organizationMemberService.updateOrganizationRole).toHaveBeenCalledWith(
      'test-project-id',
      '11111111-1111-1111-1111-111111111111',
      { role: 'MANAGER' },
    );
  });

  test('removeOrganization - removes organization successfully', async () => {
    const removeMock = vi.mocked(organizationMemberService.removeOrganization).mockResolvedValueOnce();
    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValueOnce({ organizations: [] });

    const deleteButtons = wrapper.findAll('button').filter((b) => b.text() === 'Löschen');
    await deleteButtons[1].trigger('click');
    await flushPromises();

    expect(removeMock).toHaveBeenCalledWith('test-project-id', '22222222-2222-2222-2222-222222222222');
    expect(organizationMemberService.getOrganizations).toHaveBeenCalledWith('test-project-id');
  });

  test('removeOrganization - rejects invalid UUID', async () => {
    const invalidOrg: OrganizationMemberJson = {
      organizationId: 'invalid-id', organizationName: 'Invalid Org', role: 'MANAGER',
    };
    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValueOnce({ organizations: [invalidOrg] });
    const removeMock = vi.mocked(organizationMemberService.removeOrganization);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const invalidWrapper = mount(OrganizationMemberSettingsCard, { props: { projectId: 'test-project-id' } });
    await flushPromises();

    const deleteButtons = invalidWrapper.findAll('button').filter((b) => b.text() === 'Löschen');
    await deleteButtons[0].trigger('click');

    expect(removeMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Invalid organizationId format:', 'invalid-id');

    consoleSpy.mockRestore();
  });

  test('onMounted - calls fetchOrganizations on mount', () => {
    expect(organizationMemberService.getOrganizations).toHaveBeenCalledOnce();
    expect(organizationMemberService.getOrganizations).toHaveBeenCalledWith('test-project-id');
  });

  test('updateOrganizationRole - skips update when organizationId is undefined', async () => {
    const orgWithoutId: OrganizationMemberJson = { organizationName: 'Test GmbH', role: 'MANAGER' };
    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValueOnce({ organizations: [orgWithoutId] });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const noIdWrapper = mount(OrganizationMemberSettingsCard, { props: { projectId: 'test-project-id' } });
    await flushPromises();

    const roleSelect = noIdWrapper.findComponent(ProjectMemberRoleSelect);
    await selectRole(roleSelect, 'MANAGER');

    expect(organizationMemberService.updateOrganizationRole).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Organization ID is undefined, cannot update role');
    consoleSpy.mockRestore();
  });

  test('fetchOrganizations - handles fetch error gracefully', async () => {
    vi.mocked(organizationMemberService.getOrganizations).mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mount(OrganizationMemberSettingsCard, { props: { projectId: 'test-project-id' } });
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch organizations', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('fetchOrganizations - treats undefined organizations list as empty array', async () => {
    vi.mocked(organizationMemberService.getOrganizations).mockResolvedValueOnce({ organizations: undefined });

    const emptyWrapper = mount(OrganizationMemberSettingsCard, { props: { projectId: 'test-project-id' } });
    await flushPromises();

    const nameCells = emptyWrapper.findAll('td').filter((td) => td.text() === 'Test GmbH' || td.text() === 'Muster AG');
    expect(nameCells).toHaveLength(0);
  });

  test('updateOrganizationRole - handles update error gracefully', async () => {
    vi.mocked(organizationMemberService.updateOrganizationRole).mockRejectedValueOnce(new Error('Update failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const roleSelects = wrapper.findAllComponents(ProjectMemberRoleSelect);
    await selectRole(roleSelects[0], 'MANAGER');

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update organization role:', expect.anything());
    consoleSpy.mockRestore();
  });

  test('removeOrganization - handles remove error gracefully', async () => {
    vi.mocked(organizationMemberService.removeOrganization).mockRejectedValueOnce(new Error('Remove failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const deleteButtons = wrapper.findAll('button').filter((b) => b.text() === 'Löschen');
    await deleteButtons[0].trigger('click');
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to remove organization:', expect.anything());
    consoleSpy.mockRestore();
  });

  test('updateOrganizationRole - shows success toast on successful update', async () => {
    vi.mocked(organizationMemberService.updateOrganizationRole).mockResolvedValueOnce({
      organizationId: '11111111-1111-1111-1111-111111111111',
      organizationName: 'Test GmbH',
      role: 'MANAGER',
    });

    const roleSelects = wrapper.findAllComponents(ProjectMemberRoleSelect);
    await selectRole(roleSelects[0], 'MANAGER');

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

describe('OrganizationMemberSettingsCard.vue - member rows', () => {
  let wrapper: VueWrapper<InstanceType<typeof OrganizationMemberSettingsCard>>;

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

    wrapper = mount(OrganizationMemberSettingsCard, { props: { projectId: 'test-project-id' } });

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
    expect(selects).toHaveLength(mockOrganizationsWithMembers.length);
  });

  test('does not render a delete button for individual members', () => {
    const deleteButtons = wrapper.findAll('button').filter((b) => b.text() === 'Löschen');
    expect(deleteButtons).toHaveLength(mockOrganizationsWithMembers.length);
  });

  test('updateOrganizationRole still targets the organization when member rows are present', async () => {
    const org = mockOrganizationsWithMembers[0];
    vi.mocked(organizationMemberService.updateOrganizationRole).mockResolvedValueOnce(org);

    const roleSelect = wrapper.findComponent(ProjectMemberRoleSelect);
    await selectRole(roleSelect, org.role as MemberRole);

    expect(organizationMemberService.updateOrganizationRole).toHaveBeenCalledWith(
      'test-project-id',
      org.organizationId,
      { role: org.role },
    );
  });
});
