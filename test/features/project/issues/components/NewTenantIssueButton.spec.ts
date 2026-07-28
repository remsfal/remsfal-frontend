import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewTenantIssueButton from '@/features/project/issues/components/NewTenantIssueButton.vue';
import { issueService } from '@/services/IssueService';
import { Form } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Message from 'primevue/message';

vi.mock('@/services/IssueService', { spy: true });

const mockAgreement = {
  id: 'agreement-1',
  tenants: [{ firstName: 'Max', lastName: 'Mustermann' }],
  rentalUnits: [{ id: 'unit-1', title: 'Wohnung 1A' }],
};

// Always render dialog content so form fields are accessible without needing to simulate open
const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

// RentalAgreementSelect has its own dedicated spec; stub it here so selection
// can be driven directly via emitted events without hitting the real service.
const RentalAgreementSelectStub = {
  name: 'RentalAgreementSelect',
  props: ['projectId', 'modelValue', 'invalid', 'inputId'],
  emits: ['update:modelValue', 'blur'],
  template: '<div data-testid="agreement-select" />',
};

describe('NewTenantIssueButton.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof NewTenantIssueButton>>;

  beforeEach(() => {
    vi.spyOn(issueService, 'createProjectIssue').mockResolvedValue({
      id: 'issue-123',
      title: 'Test Issue',
      description: 'Test Description',
      type: 'INQUIRY',
      status: 'PENDING',
      visibleToTenants: true,
      agreementId: 'agreement-1',
    });

    wrapper = mount(NewTenantIssueButton, {
      props: { projectId: 'project-123' },
      global: {
        stubs: {
          BaseDialog: BaseDialogStub,
          RentalAgreementSelect: RentalAgreementSelectStub,
        },
        components: {
          Form,
          InputText,
          Textarea,
          Select,
          Message,
        },
      },
    });
  });

  it('renders the "Mieter kontaktieren" trigger button', () => {
    expect(wrapper.find('button').text()).toContain('Mieter kontaktieren');
  });

  it('dialog is initially not visible', () => {
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('dialog becomes visible when button is clicked', async () => {
    await wrapper.find('button').trigger('click');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
  });

  it('shows error when title is too short', async () => {
    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('AB');
    await input.trigger('blur');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    const errorMessage = wrapper.findComponent(Message);
    expect(errorMessage.exists()).toBe(true);
  });

  it('does not render a priority field', () => {
    expect(wrapper.find('select[name="issuePriority"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Priorität');
  });

  it('blocks submission and shows a required message when no agreement is selected', async () => {
    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('Valid Issue Title');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Bitte wählen Sie ein Mietverhältnis aus');
    expect(issueService.createProjectIssue).not.toHaveBeenCalled();
  });

  it('clears the required message once an agreement is selected', async () => {
    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('Valid Issue Title');

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Bitte wählen Sie ein Mietverhältnis aus');

    const agreementSelect = wrapper.findComponent(RentalAgreementSelectStub);
    await agreementSelect.vm.$emit('update:modelValue', mockAgreement);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain('Bitte wählen Sie ein Mietverhältnis aus');
  });

  it('calls createProjectIssue with agreementId and visibleToTenants set, no priority', async () => {
    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('Valid Issue Title');

    const agreementSelect = wrapper.findComponent(RentalAgreementSelectStub);
    await agreementSelect.vm.$emit('update:modelValue', mockAgreement);

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(issueService.createProjectIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Valid Issue Title',
        type: 'INQUIRY',
        projectId: 'project-123',
        agreementId: 'agreement-1',
        visibleToTenants: true,
      }),
    );
    const callArgs = vi.mocked(issueService.createProjectIssue).mock.calls[0][0];
    expect(callArgs).not.toHaveProperty('priority');
  });

  it('emits issueCreated event and closes dialog on success', async () => {
    await wrapper.find('button').trigger('click');

    const input = wrapper.find('input[name="issueTitle"]');
    await input.setValue('Valid Issue Title');

    const agreementSelect = wrapper.findComponent(RentalAgreementSelectStub);
    await agreementSelect.vm.$emit('update:modelValue', mockAgreement);

    const form = wrapper.findComponent(Form);
    await form.trigger('submit');

    await new Promise((resolve) => setTimeout(resolve, 50));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('issueCreated')).toBeTruthy();
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });
});
