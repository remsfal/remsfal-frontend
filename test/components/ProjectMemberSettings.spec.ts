import {
 describe, test, expect, beforeEach, vi 
} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ProjectMemberSettings from '../../src/components/ProjectMemberSettings.vue';
import {
  projectMemberService,
  type Member,
  type MemberRole,
} from '../../src/services/ProjectMemberService';

vi.mock('../../src/services/ProjectMemberService');

describe('ProjectMemberSettings.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProjectMemberSettings>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock GET members response
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

    wrapper = mount(ProjectMemberSettings, {props: {projectId: 'test-project-id',},});

    // Wait for fetchMembers to resolve
    await wrapper.vm.$nextTick();
  });

  // Test for fetchMembers
  test('fetchMembers - loads members successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.at(0)?.text()).toEqual('test1@example.com');
    expect(rows.at(3)?.text()).toEqual('test2@example.com');
  });

  // Test for updateMemberRole
  test("updateMemberRole - updates a member's role successfully", async () => {
    const member: Member = {
 id: '1', email: 'test1@example.com', role: 'MANAGER' 
};

    vi.mocked(projectMemberService.updateMemberRole).mockResolvedValueOnce(member);

    await (wrapper.vm as any).updateMemberRole(member);

    expect(projectMemberService.updateMemberRole).toHaveBeenCalledWith('test-project-id', '1', {role: 'MANAGER',});
  });
  // Test for removeMember
  test('removeMember - removes a member successfully', async () => {
    const memberId = '6a5cf8c4-e060-4ff7-8abb-601438f67bfa'; // valid UUID

    // Mock the removeMember and getMembers methods
    const removeMock = vi.mocked(projectMemberService.removeMember).mockResolvedValueOnce();
    vi.mocked(projectMemberService.getMembers).mockResolvedValueOnce({ members: [] }); // return empty list after removal

    // Call removeMember on the component
    await (wrapper.vm as any).removeMember(memberId);

    // Assert removeMember was called with correct arguments
    expect(removeMock).toHaveBeenCalledWith('test-project-id', memberId);

    // Assert getMembers was called to refresh the list
    expect(projectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
  });
});
