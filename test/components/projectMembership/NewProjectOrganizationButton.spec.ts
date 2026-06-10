import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import type { FormSubmitEvent } from '@primevue/forms';
import NewProjectOrganizationButton from '@/components/projectMembership/NewProjectOrganizationButton.vue';
import { projectOrganizationService } from '@/services/ProjectOrganizationService';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock('@/services/ProjectOrganizationService', () => ({projectOrganizationService: { addOrganization: vi.fn() },}));

vi.mock('../../../src/stores/OrganizationStore', () => ({
  useOrganizationStore: vi.fn(() => ({
    userOrganizations: [
      { id: 'org-1', name: 'Test GmbH' },
      { id: 'org-2', name: 'Muster AG' },
    ],
    initialized: true,
    fetchUserOrganization: vi.fn(),
  })),
}));

describe('NewProjectOrganizationButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewProjectOrganizationButton>>;

  beforeEach(async () => {
    wrapper = mount(NewProjectOrganizationButton, {
      props: { projectId: 'test-project-id' },
      attachTo: document.body,
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

  test('validates organization is required', async () => {
    const event = {
      valid: false,
      states: {
        organizationId: {
          value: '', invalid: true, touched: true 
        },
        role: {
          value: 'MANAGER', invalid: false, touched: true 
        },
      },
    } as unknown as FormSubmitEvent;

    const mockAdd = projectOrganizationService.addOrganization as ReturnType<typeof vi.fn>;

    await wrapper.vm.onSubmit(event);

    expect(mockAdd).not.toHaveBeenCalled();
  });

  test('calls service and emits event when valid', async () => {
    const mockAdd = projectOrganizationService.addOrganization as ReturnType<typeof vi.fn>;
    mockAdd.mockResolvedValueOnce({
      organizationId: 'org-1', organizationName: 'Test GmbH', role: 'MANAGER' 
    });

    await wrapper.vm.addOrganization('org-1', 'MANAGER');

    expect(mockAdd).toHaveBeenCalledWith('test-project-id', {
      organizationId: 'org-1',
      role: 'MANAGER',
    });

    const emitted = wrapper.emitted();
    expect(emitted).toHaveProperty('newOrganization');
    expect(emitted.newOrganization[0]).toEqual(['Test GmbH']);
  });

  test('resets form when dialog is hidden', async () => {
    wrapper.vm.initialValues = { organizationId: 'org-1', role: 'MANAGER' };

    await wrapper.vm.resetForm();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.initialValues.organizationId).toBe('');
    expect(wrapper.vm.initialValues.role).toBe('');
  });

  test('handles addOrganization error gracefully', async () => {
    const mockAdd = projectOrganizationService.addOrganization as ReturnType<typeof vi.fn>;
    mockAdd.mockRejectedValueOnce(new Error('Backend error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await wrapper.vm.addOrganization('org-1', 'MANAGER');

    expect(consoleSpy).toHaveBeenCalledWith('Failed to add organization:', 'Backend error');

    consoleSpy.mockRestore();
  });
});
