import {describe, test, expect, beforeEach, vi} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import type { FormSubmitEvent } from '@primevue/forms';
import NewProjectMemberButton from '../../src/components/NewProjectMemberButton.vue';
import { projectMemberService } from '../../src/services/ProjectMemberService';

// Mock translation function
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) })); // just return key for simplicity

// Mock ProjectMemberService
vi.mock('../../src/services/ProjectMemberService', () => ({projectMemberService: {addMember: vi.fn(),},}));

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

  test('validates role is required', async () => {
    // The validation is handled by Zod schema
    // We can test by calling onSubmit directly with invalid data
    const event = {
      valid: false,
      states: {
        email: {
          value: 'test@example.com',
          invalid: false,
          touched: true,
        },
        role: {
          value: '',
          invalid: true,
          touched: true,
        },
      },
    } as unknown as FormSubmitEvent;

    const mockAdd = projectMemberService.addMember as ReturnType<typeof vi.fn>;
    
    // Call onSubmit with invalid data - it should not call addMember
    await wrapper.vm.onSubmit(event);

    expect(mockAdd).not.toHaveBeenCalled();
  });

  test('shows email validation error for invalid email', async () => {
    // Open dialog
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fill email field with invalid email
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
    expect(emailInput).toBeTruthy();
    emailInput.value = 'invalid';
    emailInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('blur'));
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check for validation error message
    const errorMessages = document.querySelectorAll('.p-message');
    const hasEmailError = Array.from(errorMessages).some(msg => 
      msg.textContent?.includes('projectSettings.newProjectMemberButton.invalidEmail')
    );
    expect(hasEmailError).toBe(true);
  });

  test('calls service and emits event when valid', async () => {
    const mockAdd = projectMemberService.addMember as ReturnType<typeof vi.fn>;
    mockAdd.mockResolvedValueOnce({ email: 'user@example.com', role: 'MANAGER' });

    // Call the addMember method directly since form validation is complex to test
    await wrapper.vm.addMember('user@example.com', 'MANAGER');

    expect(mockAdd).toHaveBeenCalledWith('test-project-id', {
      email: 'user@example.com',
      role: 'MANAGER',
    });

    const emitted = wrapper.emitted();
    expect(emitted).toHaveProperty('newMember');
    expect(emitted.newMember[0]).toEqual(['user@example.com']);
  });

  test('resets form when dialog is hidden', async () => {
    // Set initial values
    wrapper.vm.initialValues = { email: 'temp@example.com', role: 'MANAGER' };
    
    // Reset form
    await wrapper.vm.resetForm();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.initialValues.email).toBe('');
    expect(wrapper.vm.initialValues.role).toBe('');
  });

  test('handles addMember error gracefully', async () => {
    const mockAdd = projectMemberService.addMember as ReturnType<typeof vi.fn>;
    mockAdd.mockRejectedValueOnce({ message: 'Backend error' });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Call addMember directly
    await wrapper.vm.addMember('fail@example.com', 'MANAGER');

    expect(consoleSpy).toHaveBeenCalledWith('Failed to add member:', 'Backend error');

    consoleSpy.mockRestore();
  });
});
