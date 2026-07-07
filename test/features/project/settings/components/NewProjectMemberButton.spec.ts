import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper, DOMWrapper, flushPromises } from '@vue/test-utils';
import NewProjectMemberButton from '@/features/project/settings/components/NewProjectMemberButton.vue';
import { projectMemberService } from '@/services/ProjectMemberService';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock('@/services/ProjectMemberService', () => ({projectMemberService: { addMember: vi.fn() },}));

// BaseDialog renders PrimeVue's Dialog, which teleports its entire content (via Portal) to
// document.body. Vue Test Utils' `wrapper.find()` only searches the wrapper's own DOM subtree, so
// it can never see anything inside the dialog (email input, role select, submit button) -
// everything there must be located via a DOMWrapper rooted at document.body instead.
function body(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(document.body);
}

async function openDialog(wrapper: VueWrapper<InstanceType<typeof NewProjectMemberButton>>) {
  await wrapper.find('button').trigger('click');
  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, 100));
}

// PrimeVue's Select field is registered with @primevue/forms via its `name` prop. Its internal
// writeValue() both emits 'update:modelValue' AND calls the injected formField.onChange(), so the
// Form's validity state only updates for real when the option is picked through the actual overlay
// (click to open, mousedown on the option) rather than by emitting 'update:modelValue' directly.
async function selectRole(ariaLabel: string) {
  await body().find('.p-select').trigger('click');
  await new Promise((resolve) => setTimeout(resolve, 100));

  const option = body()
    .findAll('li[role="option"]')
    .find((li) => li.attributes('aria-label') === ariaLabel);
  if (!option) {
    throw new Error(`Role option with aria-label "${ariaLabel}" not found`);
  }
  await option.trigger('mousedown');
  await new Promise((resolve) => setTimeout(resolve, 100));
}

describe('NewProjectMemberButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewProjectMemberButton>>;

  beforeEach(async () => {
    wrapper = mount(NewProjectMemberButton, {
      props: { projectId: 'test-project-id' },
      attachTo: document.body,
    });
    vi.clearAllMocks();
  });

  // BaseDialog teleports its content to document.body via PrimeVue's Portal. Without unmounting,
  // a still-open dialog from a previous test would leave a stray input/select/form in
  // document.body, and DOMWrapper(document.body) queries in the next test could match those
  // stale elements instead of the current test's dialog.
  afterEach(() => {
    wrapper.unmount();
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
    const mockAdd = projectMemberService.addMember as ReturnType<typeof vi.fn>;

    await openDialog(wrapper);

    await body().find('input[name="email"]').setValue('test@example.com');

    // Deliberately do not select a role, then submit directly on the <form> element to bypass
    // the submit button's disabled attribute.
    await body().find('form').trigger('submit');
    await flushPromises();

    expect(mockAdd).not.toHaveBeenCalled();
  });

  test('shows email validation error for invalid email', async () => {
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
    expect(emailInput).toBeTruthy();
    emailInput.value = 'invalid';
    emailInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('blur'));
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const errorMessages = document.querySelectorAll('.p-message');
    const hasEmailError = Array.from(errorMessages).some((msg) =>
      msg.textContent?.includes('projectSettings.newProjectMemberButton.invalidEmail'),
    );
    expect(hasEmailError).toBe(true);
  });

  test('calls service and emits event when valid', async () => {
    const mockAdd = projectMemberService.addMember as ReturnType<typeof vi.fn>;
    mockAdd.mockResolvedValueOnce({ email: 'user@example.com', role: 'MANAGER' });

    await openDialog(wrapper);

    await body().find('input[name="email"]').setValue('user@example.com');
    await selectRole('roles.manager');

    await body().find('form').trigger('submit');
    await flushPromises();

    expect(mockAdd).toHaveBeenCalledWith('test-project-id', {
      email: 'user@example.com',
      role: 'MANAGER',
    });

    const emitted = wrapper.emitted();
    expect(emitted).toHaveProperty('newMember');
    expect(emitted.newMember[0]).toEqual(['user@example.com']);
  });

  test('resets form when dialog is hidden', async () => {
    await openDialog(wrapper);

    await body().find('input[name="email"]').setValue('temp@example.com');

    await body().find('.p-dialog-close-button').trigger('click');
    await flushPromises();

    await openDialog(wrapper);

    const emailInput = body().find('input[name="email"]').element as HTMLInputElement;
    expect(emailInput.value).toBe('');
  });

  test('handles addMember error gracefully', async () => {
    const mockAdd = projectMemberService.addMember as ReturnType<typeof vi.fn>;
    mockAdd.mockRejectedValueOnce(new Error('Backend error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await openDialog(wrapper);

    await body().find('input[name="email"]').setValue('fail@example.com');
    await selectRole('roles.manager');

    await body().find('form').trigger('submit');
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to add member:', 'Backend error');

    consoleSpy.mockRestore();
  });
});
