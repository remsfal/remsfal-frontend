import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectMemberButton from '../../src/components/NewProjectMemberButton.vue';
import { projectMemberService } from '../../src/services/ProjectMemberService';

describe('NewProjectMemberButton.vue', () => {
  let wrapper: VueWrapper;

  vi.mock('@/services/ProjectMemberService');

  beforeEach(async () => {
    wrapper = mount(NewProjectMemberButton, {
      propsData: {
        projectId: 'test-project-id',
      },
    });
    vi.clearAllMocks();
  });

  // Test for addMember
  test('addMember - adds a new member successfully', async () => {
    projectMemberService.addMember.mockResolvedValueOnce({});
    projectMemberService.getMembers.mockResolvedValueOnce([]);

    wrapper.vm.newMemberEmail = 'test@example.com';
    wrapper.vm.newMemberRole = 'MANAGER';

    await wrapper.vm.addMember();

    expect(projectMemberService.addMember).toHaveBeenCalledWith('test-project-id', {
      email: 'test@example.com',
      role: 'MANAGER',
    });
    expect(wrapper.vm.newMemberEmail).toBe('');
    expect(wrapper.vm.newMemberRole).toBe('');
  });
});
