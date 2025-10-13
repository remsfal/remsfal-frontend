import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectMemberButton from '../../src/components/NewProjectMemberButton.vue';
import { projectMemberService } from '../../src/services/ProjectMemberService';

// Mock translation function
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key, // just return key for simplicity
  }),
}));

// Mock ProjectMemberService
vi.mock('../../src/services/ProjectMemberService', () => ({
  projectMemberService: {
    addMember: vi.fn(),
  },
}));

describe('NewProjectMemberButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewProjectMemberButton>>;

  beforeEach(async () => {
    wrapper = mount(NewProjectMemberButton, {
      props: { projectId: 'test-project-id' },
      attachTo: document.body, // required for PrimeVue Dialog (teleport)
    });
    vi.clearAllMocks();
  });

  test('renders add button and opens dialog', async () => {
    const openButton = wrapper.find('button');
    expect(openButton.exists()).toBe(true);

    await openButton.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = document.querySelector('.p-dialog');
    expect(dialog).toBeTruthy();
  });

  test('shows role validation error if role not selected', async () => {
    wrapper.vm.newMemberEmail = 'test@example.com';
    wrapper.vm.newMemberRole = null;

    await wrapper.vm.addMember();

    expect(wrapper.vm.isRoleInvalid).toBe(true);
    expect(wrapper.vm.roleErrorMessage).toContain('projectSettings.newProjectMemberButton.invalidRole');
  });

  test('shows email validation error for invalid email', async () => {
    wrapper.vm.newMemberEmail = 'invalid';
    wrapper.vm.newMemberRole = 'MANAGER';

    await wrapper.vm.addMember();

    expect(wrapper.vm.isEmailInvalid).toBe(true);
    expect(wrapper.vm.emailErrorMessage).toContain('projectSettings.newProjectMemberButton.invalidEmail');
  });

  test('calls service and emits event when valid', async () => {
    const mockAdd = projectMemberService.addMember as ReturnType<typeof vi.fn>;
    mockAdd.mockResolvedValueOnce({ email: 'user@example.com', role: 'MANAGER' });

    wrapper.vm.newMemberEmail = 'user@example.com';
    wrapper.vm.newMemberRole = 'MANAGER';

    await wrapper.vm.addMember();

    expect(mockAdd).toHaveBeenCalledWith('test-project-id', {
      email: 'user@example.com',
      role: 'MANAGER',
    });

    const emitted = wrapper.emitted();
    expect(emitted).toHaveProperty('newMember');
    expect(emitted.newMember[0]).toEqual(['user@example.com']);
  });

  test('resets form when dialog is hidden', async () => {
    wrapper.vm.newMemberEmail = 'temp@example.com';
    wrapper.vm.newMemberRole = 'TENANT';
    wrapper.vm.isEmailInvalid = true;

    await wrapper.vm.resetForm();

    expect(wrapper.vm.newMemberEmail).toBe('');
    expect(wrapper.vm.newMemberRole).toBeNull();
    expect(wrapper.vm.isEmailInvalid).toBe(false);
    expect(wrapper.vm.emailErrorMessage).toBe('');
    expect(wrapper.vm.isRoleInvalid).toBe(false);
    expect(wrapper.vm.roleErrorMessage).toBe('');
  });

  test('handles addMember error gracefully', async () => {
    const mockAdd = projectMemberService.addMember as ReturnType<typeof vi.fn>;
    mockAdd.mockRejectedValueOnce({ message: 'Backend error' });

    wrapper.vm.newMemberEmail = 'fail@example.com';
    wrapper.vm.newMemberRole = 'CONTRACTOR';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await wrapper.vm.addMember();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to add member:', 'Backend error');

    consoleSpy.mockRestore();
  });x
});
