import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ProjectMemberSettings from '@/components/projectMembership/ProjectMemberSettings.vue';
import {
  projectMemberService,
  type ProjectMemberJson,
  type MemberRole,
} from '@/services/ProjectMemberService';

vi.mock('../../../src/services/ProjectMemberService');

describe('ProjectMemberSettings.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectMemberSettings>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const mockMembers = {
      members: [
        { id: '1', email: 'test1@example.com', role: 'MANAGER' as MemberRole },
        { id: '2', email: 'test2@example.com', role: 'STAFF' as MemberRole },
      ],
    };
    vi.mocked(projectMemberService.getMembers).mockResolvedValue(mockMembers);

    wrapper = mount(ProjectMemberSettings, { props: { projectId: 'test-project-id' } });

    await wrapper.vm.$nextTick();
  });

  test('fetchMembers - loads members successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.at(0)?.text()).toEqual('test1@example.com');
    expect(rows.at(3)?.text()).toEqual('test2@example.com');
  });

  test("updateMemberRole - updates a member's role successfully", async () => {
    const member: ProjectMemberJson = { id: '1', email: 'test1@example.com', role: 'MANAGER' };

    vi.mocked(projectMemberService.updateMemberRole).mockResolvedValueOnce(member);

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettings>).updateMemberRole(member);

    expect(projectMemberService.updateMemberRole).toHaveBeenCalledWith('test-project-id', '1', { role: 'MANAGER' });
  });

  test('removeMember - removes a member successfully', async () => {
    const memberId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa';

    const removeMock = vi.mocked(projectMemberService.removeMember).mockResolvedValueOnce();
    vi.mocked(projectMemberService.getMembers).mockResolvedValueOnce({ members: [] });

    await (wrapper.vm as InstanceType<typeof ProjectMemberSettings>).removeMember(memberId);

    expect(removeMock).toHaveBeenCalledWith('test-project-id', memberId);
    expect(projectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
  });
});
