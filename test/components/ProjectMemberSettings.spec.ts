import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import ProjectMemberSettings from '../../src/components/ProjectMemberSettings.vue';
import { type MemberList, projectMemberService } from '../../src/services/ProjectMemberService';

describe('ProjectMemberSettings.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectMemberSettings>>;

  vi.mock('@/services/ProjectMemberService');

  beforeEach(async () => {
    const mockMembers: MemberList = {
      members: [
        { id: '1', email: 'test1@example.com', role: 'MANAGER' },
        { id: '2', email: 'test2@example.com', role: 'TENANCY' },
      ],
    };
    vi.mocked(projectMemberService.getMembers).mockResolvedValue(mockMembers);
    wrapper = mount(ProjectMemberSettings, {
      props: {
        projectId: 'test-project-id',
      },
    });
    vi.clearAllMocks();
  });

  // Test for fetchMembers
  test('fetchMembers - loads members successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBe(6);
    expect(rows.at(0).text()).toEqual('test1@example.com');
    expect(rows.at(3).text()).toEqual('test2@example.com');
  });

  // Test for updateMemberRole
  test("updateMemberRole - updates a member's role successfully", async () => {
    expect(wrapper.vm.projectId).toBe('test-project-id');
    vi.mocked(projectMemberService.updateMemberRole).mockResolvedValueOnce({});
    const member = { id: '1', email: 'test@example.com', role: 'MANAGER' };

    await wrapper.vm.updateMemberRole(member);

    expect(projectMemberService.updateMemberRole).toHaveBeenCalledWith('test-project-id', member);
  });

  // Test for removeMember
  test('removeMember - removes a member successfully', async () => {
    const validMemberId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa'; // Valid UUID
    vi.mocked(projectMemberService.removeMember).mockResolvedValueOnce({});
    vi.mocked(projectMemberService.getMembers).mockResolvedValueOnce([]);

    await wrapper.vm.removeMember(validMemberId); // Use valid UUID

    expect(projectMemberService.removeMember).toHaveBeenCalledWith(
      'test-project-id',
      validMemberId,
    );
    expect(projectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
  });
});
