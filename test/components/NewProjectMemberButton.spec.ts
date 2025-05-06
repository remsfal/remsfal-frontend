import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectMemberButton from '../../src/components/NewProjectMemberButton.vue';
import { projectMemberService } from '../../src/services/ProjectMemberService';

vi.mock('@/services/ProjectMemberService');

describe('NewProjectMemberButton.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(async () => {
    wrapper = mount(NewProjectMemberButton, {
      propsData: {
        projectId: 'test-project-id',
      },
    });
    vi.clearAllMocks();
  });

  test('addMember - adds a new member successfully', async () => {
    projectMemberService.addMember.mockResolvedValueOnce({});
    wrapper.vm.newMemberEmail = 'test@example.com';
    wrapper.vm.newMemberRole = 'MANAGER';
    await wrapper.vm.addMember();
    expect(projectMemberService.addMember).toHaveBeenCalledWith('test-project-id', {
      email: 'test@example.com',
      role: 'MANAGER',
    });
  });

  test('email validation - invalid email shows error and does not call service', async () => {
    wrapper.vm.newMemberEmail = 'invalid-email';
    wrapper.vm.newMemberRole = 'MANAGER';
    await wrapper.vm.addMember();
    expect(projectMemberService.addMember).not.toHaveBeenCalled();

    await wrapper.vm.$nextTick();
    const input = wrapper.find('input#email');
    expect(input.classes()).toContain('p-invalid');
    const errorText = wrapper.find('small.text-red-500');
    expect(errorText.exists()).toBe(true);
    expect(errorText.text()).toContain('gültige E-Mail-Adresse');
  });
});
