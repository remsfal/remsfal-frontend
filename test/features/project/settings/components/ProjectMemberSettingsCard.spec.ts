import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ProjectMemberSettingsCard from '@/features/project/settings/components/ProjectMemberSettingsCard.vue';
import NewProjectMemberButton from '@/features/project/settings/components/NewProjectMemberButton.vue';
import {projectMemberService,
  type ProjectMemberJson,
  type MemberRole,} from '@/services/ProjectMemberService';

const { mockToastAdd } = vi.hoisted(() => ({mockToastAdd: vi.fn(),}));

vi.mock('primevue/usetoast', () => ({useToast: () => ({ add: mockToastAdd }),}));

vi.mock('@/services/ProjectMemberService');

describe('ProjectMemberSettingsCard.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectMemberSettingsCard>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const mockMembers = {
      members: [
        {
          id: '1', email: 'test1@example.com', role: 'MANAGER' as MemberRole 
        },
        {
          id: '2', email: 'test2@example.com', role: 'STAFF' as MemberRole 
        },
      ],
    };
    vi.mocked(projectMemberService.getMembers).mockResolvedValue(mockMembers);

    wrapper = mount(ProjectMemberSettingsCard, { props: { projectId: 'test-project-id' } });

    await wrapper.vm.$nextTick();
  });

  test('fetchMembers - loads members successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.at(0)?.text()).toEqual('test1@example.com');
    expect(rows.at(4)?.text()).toEqual('test2@example.com');
  });

  test("updateMemberRole - updates a member's role successfully", async () => {
    const member: ProjectMemberJson = {
      id: '1', email: 'test1@example.com', role: 'MANAGER' 
    };

    vi.mocked(projectMemberService.updateMemberRole).mockResolvedValueOnce(member);

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettingsCard>).updateMemberRole(member);

    expect(projectMemberService.updateMemberRole).toHaveBeenCalledWith('test-project-id', '1', { role: 'MANAGER' });
  });

  test('removeMember - removes a member successfully', async () => {
    const memberId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa';

    const removeMock = vi.mocked(projectMemberService.removeMember).mockResolvedValueOnce();
    vi.mocked(projectMemberService.getMembers).mockResolvedValueOnce({ members: [] });

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettingsCard>).removeMember(memberId);

    expect(removeMock).toHaveBeenCalledWith('test-project-id', memberId);
    expect(projectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
  });

  test('onMounted - calls fetchMembers on mount', () => {
    expect(projectMemberService.getMembers).toHaveBeenCalledOnce();
    expect(projectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
  });

  test('removeMember - rejects invalid UUID format', async () => {
    const removeMock = vi.mocked(projectMemberService.removeMember);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettingsCard>).removeMember('invalid-id');

    expect(removeMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Invalid memberId format:', 'invalid-id');
    consoleSpy.mockRestore();
  });

  test('updateMemberRole - skips update when member id is undefined', async () => {
    const member: ProjectMemberJson = { email: 'test@example.com', role: 'MANAGER' };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettingsCard>).updateMemberRole(member);

    expect(projectMemberService.updateMemberRole).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Member ID is undefined, cannot update role');
    consoleSpy.mockRestore();
  });

  test('fetchMembers - handles fetch error gracefully', async () => {
    vi.mocked(projectMemberService.getMembers).mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettingsCard>).fetchMembers();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch members', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('updateMemberRole - handles update error gracefully', async () => {
    const member: ProjectMemberJson = {
      id: '1', email: 'test@example.com', role: 'MANAGER' 
    };
    vi.mocked(projectMemberService.updateMemberRole).mockRejectedValueOnce(new Error('Update failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettingsCard>).updateMemberRole(member);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update member role:', expect.anything());
    consoleSpy.mockRestore();
  });

  test('removeMember - handles remove error gracefully', async () => {
    const memberId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa';
    vi.mocked(projectMemberService.removeMember).mockRejectedValueOnce(new Error('Remove failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettingsCard>).removeMember(memberId);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to remove member:', expect.anything());
    consoleSpy.mockRestore();
  });

  test('updateMemberRole - shows success toast on successful update', async () => {
    const member: ProjectMemberJson = {
      id: '1', email: 'test@example.com', role: 'MANAGER', name: 'Test User' 
    };
    vi.mocked(projectMemberService.updateMemberRole).mockResolvedValueOnce(member);

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettingsCard>).updateMemberRole(member);

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  test('onNewMember - refetches members and shows success toast', async () => {
    vi.mocked(projectMemberService.getMembers).mockResolvedValueOnce({ members: [] });

    const newMemberButton = wrapper.findComponent(NewProjectMemberButton);
    await newMemberButton.vm.$emit('newMember', 'new@example.com');
    await flushPromises();

    expect(projectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });
});
