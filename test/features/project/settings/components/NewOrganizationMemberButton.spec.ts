import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper, DOMWrapper, flushPromises } from '@vue/test-utils';
import NewOrganizationMemberButton from '@/features/project/settings/components/NewOrganizationMemberButton.vue';
import { organizationMemberService } from '@/services/OrganizationMemberService';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock('@/services/OrganizationMemberService', () => ({organizationMemberService: { addOrganization: vi.fn() },}));

vi.mock('@/stores/OrganizationStore', () => ({
  useOrganizationStore: vi.fn(() => ({
    userOrganizations: [
      { id: 'org-1', name: 'Test GmbH' },
      { id: 'org-2', name: 'Muster AG' },
    ],
    initialized: true,
    fetchUserOrganization: vi.fn(),
  })),
}));

// BaseDialog renders PrimeVue's Dialog, which teleports its entire content (via Portal) to
// document.body. Vue Test Utils' `wrapper.find()` only searches the wrapper's own DOM subtree, so
// it can never see anything inside the dialog (organization/role selects, submit button) -
// everything there must be located via a DOMWrapper rooted at document.body instead.
function body(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(document.body);
}

async function openDialog(wrapper: VueWrapper<InstanceType<typeof NewOrganizationMemberButton>>) {
  await wrapper.find('button').trigger('click');
  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, 100));
}

// Both the organization and role fields are PrimeVue Select components registered with
// @primevue/forms via their `name` prop. Their internal writeValue() both emits
// 'update:modelValue' AND calls the injected formField.onChange(), so the Form's validity state
// only updates for real when an option is picked through the actual overlay (click to open,
// mousedown on the option) rather than by emitting 'update:modelValue' directly.
async function selectOption(select: DOMWrapper<Element>, ariaLabel: string) {
  await select.trigger('click');
  await new Promise((resolve) => setTimeout(resolve, 100));

  const option = body()
    .findAll('li[role="option"]')
    .find((li) => li.attributes('aria-label') === ariaLabel);
  if (!option) {
    throw new Error(`Option with aria-label "${ariaLabel}" not found`);
  }
  await option.trigger('mousedown');
  await new Promise((resolve) => setTimeout(resolve, 100));
}

async function selectOrganization(ariaLabel: string) {
  await selectOption(body().find('#organizationId'), ariaLabel);
}

async function selectRole(ariaLabel: string) {
  const roleSelect = body()
    .findAll('.p-select')
    .find((select) => select.attributes('id') !== 'organizationId');
  if (!roleSelect) {
    throw new Error('Role select not found');
  }
  await selectOption(roleSelect, ariaLabel);
}

describe('NewOrganizationMemberButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewOrganizationMemberButton>>;

  beforeEach(async () => {
    wrapper = mount(NewOrganizationMemberButton, {
      props: { projectId: 'test-project-id' },
      attachTo: document.body,
    });
    vi.clearAllMocks();
  });

  // BaseDialog teleports its content to document.body via PrimeVue's Portal. Without unmounting,
  // a still-open dialog from a previous test would leave a stray select/form in document.body,
  // and DOMWrapper(document.body) queries in the next test could match those stale elements
  // instead of the current test's dialog.
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

  test('validates organization is required', async () => {
    const mockAdd = organizationMemberService.addOrganization as ReturnType<typeof vi.fn>;

    await openDialog(wrapper);

    await selectRole('roles.manager');

    // Deliberately do not select an organization, then submit directly on the <form> element to
    // bypass the submit button's disabled attribute.
    await body().find('form').trigger('submit');
    await flushPromises();

    expect(mockAdd).not.toHaveBeenCalled();
  });

  test('calls service and emits event when valid', async () => {
    const mockAdd = organizationMemberService.addOrganization as ReturnType<typeof vi.fn>;
    mockAdd.mockResolvedValueOnce({
      organizationId: 'org-1', organizationName: 'Test GmbH', role: 'MANAGER',
    });

    await openDialog(wrapper);

    await selectOrganization('Test GmbH');
    await selectRole('roles.manager');

    await body().find('form').trigger('submit');
    await flushPromises();

    expect(mockAdd).toHaveBeenCalledWith('test-project-id', {
      organizationId: 'org-1',
      role: 'MANAGER',
    });

    const emitted = wrapper.emitted();
    expect(emitted).toHaveProperty('newOrganization');
    expect(emitted.newOrganization[0]).toEqual(['Test GmbH']);
  });

  test('resets form when dialog is hidden', async () => {
    await openDialog(wrapper);

    await selectOrganization('Test GmbH');
    await selectRole('roles.manager');

    await body().find('.p-dialog-close-button').trigger('click');
    await flushPromises();

    await openDialog(wrapper);

    const organizationLabel = body().find('#organizationId').text();
    expect(organizationLabel).toBe(
      'projectSettings.newOrganizationMemberButton.organizationPlaceholder',
    );
  });

  test('handles addOrganization error gracefully', async () => {
    const mockAdd = organizationMemberService.addOrganization as ReturnType<typeof vi.fn>;
    mockAdd.mockRejectedValueOnce(new Error('Backend error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await openDialog(wrapper);

    await selectOrganization('Test GmbH');
    await selectRole('roles.manager');

    await body().find('form').trigger('submit');
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to add organization:', 'Backend error');

    consoleSpy.mockRestore();
  });
});
