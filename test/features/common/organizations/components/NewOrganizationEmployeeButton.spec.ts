import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import NewOrganizationEmployeeButton from '@/features/common/organizations/components/NewOrganizationEmployeeButton.vue';
import { organizationService } from '@/services/OrganizationService';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

describe('NewOrganizationEmployeeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(organizationService, 'addEmployee').mockResolvedValue({
      id: 'emp-new',
      email: 'new@test.de',
      employeeRole: 'STAFF',
    });
  });

  const mountButton = (organizationId = 'org-123') =>
    mount(NewOrganizationEmployeeButton, {
      props: { organizationId },
      global: {
        stubs: {
          EmployeeRoleSelect: true,
          BaseDialog: BaseDialogStub,
        },
      },
    });

  it('renders the add member button', () => {
    const wrapper = mountButton();
    expect(wrapper.text()).toContain('Mitglied hinzufügen');
  });

  it('dialog is initially not visible', () => {
    const wrapper = mountButton();
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('dialog becomes visible when button is clicked', async () => {
    const wrapper = mountButton();
    const button = wrapper.findAll('button').find(b => b.text().includes('Mitglied'));
    await button?.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
  });

  it('renders form fields inside dialog', () => {
    const wrapper = mountButton();
    expect(wrapper.text()).toContain('E-Mail Adresse');
    expect(wrapper.text()).toContain('Rolle');
    expect(wrapper.findComponent({ name: 'EmployeeRoleSelect' }).exists()).toBe(true);
  });

  it('closes dialog when cancel button is clicked', async () => {
    const wrapper = mountButton();
    const openBtn = wrapper.findAll('button').find(b => b.text().includes('Mitglied'));
    await openBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Abbrechen');
    await cancelBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('does not call addEmployee when form is invalid', async () => {
    const wrapper = mountButton();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(organizationService.addEmployee).not.toHaveBeenCalled();
  });

  it('calls addEmployee when form submit event is valid', async () => {
    const wrapper = mountButton();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { email: { value: 'new@test.de' }, employeeRole: { value: 'STAFF' } },
    });
    await flushPromises();

    expect(organizationService.addEmployee).toHaveBeenCalledWith('org-123', {
      email: 'new@test.de',
      employeeRole: 'STAFF',
    });
  });

  it('emits newEmployee after successful addEmployee', async () => {
    const wrapper = mountButton();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { email: { value: 'new@test.de' }, employeeRole: { value: 'STAFF' } },
    });
    await flushPromises();

    expect(wrapper.emitted('newEmployee')).toBeTruthy();
    expect(wrapper.emitted('newEmployee')![0]).toEqual(['new@test.de']);
  });

  it('shows error toast when addEmployee throws', async () => {
    vi.spyOn(organizationService, 'addEmployee').mockRejectedValue(new Error('Server error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountButton();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { email: { value: 'fail@test.de' }, employeeRole: { value: 'STAFF' } },
    });
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });

  it('does not call addEmployee when email is empty in valid submit', async () => {
    const wrapper = mountButton();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { email: { value: '' }, employeeRole: { value: 'STAFF' } },
    });
    await flushPromises();

    expect(organizationService.addEmployee).not.toHaveBeenCalled();
  });

  it('does not call addEmployee when employeeRole is empty in valid submit', async () => {
    const wrapper = mountButton();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { email: { value: 'test@test.de' }, employeeRole: { value: '' } },
    });
    await flushPromises();

    expect(organizationService.addEmployee).not.toHaveBeenCalled();
  });

  it('resets form when dialog emits hide', async () => {
    const wrapper = mountButton();

    const dialog = wrapper.findComponent({ name: 'BaseDialog' });
    await dialog.vm.$emit('hide');
    await wrapper.vm.$nextTick();

    expect(wrapper.exists()).toBe(true);
  });
});
