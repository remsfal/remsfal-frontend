import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import NewQuotationRequestButton from '@/features/project/issues/components/NewQuotationRequestButton.vue';
import { quotationRequestService } from '@/features/project/issues/services/QuotationRequestService';
import { projectService } from '@/services/ProjectService';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

// ContractorMultiSelect and NewContractorButton each have their own dedicated
// spec; stub them here so selection/creation can be driven directly via
// emitted events without hitting the real service or fetching contractors.
const ContractorMultiSelectStub = defineComponent({
  name: 'ContractorMultiSelect',
  props: ['projectId', 'modelValue', 'invalid', 'inputId'],
  emits: ['update:modelValue', 'blur'],
  methods: {
    addContractor(contractor: unknown) {
      this.$emit('update:modelValue', [...(this.modelValue ?? []), contractor]);
    },
  },
  template: '<div data-testid="contractor-select" />',
});

const NewContractorButtonStub = {
  name: 'NewContractorButton',
  props: ['projectId'],
  emits: ['newContractor'],
  template: '<button type="button" data-testid="new-contractor-button">Auftragnehmer hinzufügen</button>',
};

const mockProject = {
  title: 'Projekt 1',
  owner: 'Muster Eigentümer GmbH',
  careOf: 'Max Mustermann',
  billingAddress: {
    street: 'Musterstraße 1',
    zip: '12345',
    city: 'Berlin',
    province: 'Berlin',
    countryCode: 'DE',
  },
};

describe('NewQuotationRequestButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(quotationRequestService, 'createQuotationRequest').mockResolvedValue(undefined);
    vi.spyOn(projectService, 'getProject').mockResolvedValue(mockProject);
  });

  const mountButton = (props = { projectId: 'proj-1', issueId: 'issue-1' }) =>
    mount(NewQuotationRequestButton, {
      props,
      global: {
        stubs: {
          BaseDialog: BaseDialogStub,
          Textarea: true,
          ContractorMultiSelect: ContractorMultiSelectStub,
          NewContractorButton: NewContractorButtonStub,
        },
      },
    });

  it('renders trigger button with label "Neues Angebot anfragen"', () => {
    const wrapper = mountButton();
    expect(wrapper.text()).toContain('Neues Angebot anfragen');
  });

  it('dialog is initially not visible', () => {
    const wrapper = mountButton();
    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
  });

  it('dialog becomes visible when button is clicked', async () => {
    const wrapper = mountButton();
    const trigger = wrapper.findAll('button').find((b) => b.text().includes('Angebot'));
    await trigger?.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('true');
  });

  it('fetches billing recipient data on mount', async () => {
    mountButton();
    await flushPromises();
    expect(projectService.getProject).toHaveBeenCalledWith('proj-1');
  });

  it('renders form field labels', () => {
    const wrapper = mountButton();
    expect(wrapper.text()).toContain('Leistungsbeschreibung');
    expect(wrapper.text()).toContain('Auftragnehmer');
  });

  it('renders the contractor multi-select and the "add contractor" button', () => {
    const wrapper = mountButton();
    expect(wrapper.findComponent(ContractorMultiSelectStub).exists()).toBe(true);
    expect(wrapper.findComponent(NewContractorButtonStub).exists()).toBe(true);
  });

  it('closes dialog when cancel button is clicked', async () => {
    const wrapper = mountButton();
    const trigger = wrapper.findAll('button').find((b) => b.text().includes('Angebot'));
    await trigger?.trigger('click');
    await wrapper.vm.$nextTick();

    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Abbrechen');
    await cancelBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
  });

  it('does not call createQuotationRequest when no contractor is selected', async () => {
    const wrapper = mountButton();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { scopeOfWork: { value: 'Dachrinne reparieren' } },
    });
    await flushPromises();

    expect(quotationRequestService.createQuotationRequest).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Mindestens ein Auftragnehmer muss ausgewählt werden');
  });

  it('calls createQuotationRequest with correct payload on valid submit', async () => {
    const wrapper = mountButton();
    const selectedContractors = [{ id: 'c-1', name: 'Alpha Bau GmbH' }];

    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    await contractorSelect.vm.$emit('update:modelValue', selectedContractors);

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { scopeOfWork: { value: 'Dachrinne reparieren' } },
    });
    await flushPromises();

    expect(quotationRequestService.createQuotationRequest).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({
        scopeOfWork: 'Dachrinne reparieren',
        contractors: selectedContractors,
        projectOwner: 'Muster Eigentümer GmbH',
        projectCareOf: 'Max Mustermann',
        billingAddress: mockProject.billingAddress,
      }),
    );
  });

  it('emits created event after successful submit', async () => {
    const wrapper = mountButton();
    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    await contractorSelect.vm.$emit('update:modelValue', [{ id: 'c-1', name: 'Alpha Bau GmbH' }]);

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: true, states: { scopeOfWork: { value: 'Reparatur' } } });
    await flushPromises();
    expect(wrapper.emitted('created')).toBeTruthy();
  });

  it('shows success toast after valid submit', async () => {
    const wrapper = mountButton();
    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    await contractorSelect.vm.$emit('update:modelValue', [{ id: 'c-1' }]);

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: true, states: { scopeOfWork: { value: 'Reparatur' } } });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('closes dialog after successful submit', async () => {
    const wrapper = mountButton();
    const trigger = wrapper.findAll('button').find((b) => b.text().includes('Angebot'));
    await trigger?.trigger('click');
    await wrapper.vm.$nextTick();

    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    await contractorSelect.vm.$emit('update:modelValue', [{ id: 'c-1' }]);

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: true, states: { scopeOfWork: { value: 'Reparatur' } } });
    await flushPromises();

    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
  });

  it('logs and shows no toast when createQuotationRequest fails', async () => {
    vi.spyOn(quotationRequestService, 'createQuotationRequest').mockRejectedValue(new Error('API error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountButton();
    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    await contractorSelect.vm.$emit('update:modelValue', [{ id: 'c-1' }]);

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: true, states: { scopeOfWork: { value: 'Reparatur' } } });
    await flushPromises();

    expect(addMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('does not emit created when createQuotationRequest fails', async () => {
    vi.spyOn(quotationRequestService, 'createQuotationRequest').mockRejectedValue(new Error('API error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountButton();
    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    await contractorSelect.vm.$emit('update:modelValue', [{ id: 'c-1' }]);

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: true, states: { scopeOfWork: { value: 'Reparatur' } } });
    await flushPromises();

    expect(wrapper.emitted('created')).toBeFalsy();
    consoleSpy.mockRestore();
  });

  it('does not call createQuotationRequest when scope of work is invalid', async () => {
    const wrapper = mountButton();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: false, states: {} });
    await flushPromises();
    expect(quotationRequestService.createQuotationRequest).not.toHaveBeenCalled();
  });

  it('resets form and contractor selection when dialog emits hide', async () => {
    const wrapper = mountButton();
    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    await contractorSelect.vm.$emit('update:modelValue', [{ id: 'c-1', name: 'Alpha Bau GmbH' }]);
    await wrapper.vm.$nextTick();
    expect(contractorSelect.props('modelValue')).toEqual([{ id: 'c-1', name: 'Alpha Bau GmbH' }]);

    const dialog = wrapper.findComponent({ name: 'BaseDialog' });
    await dialog.vm.$emit('hide');
    await wrapper.vm.$nextTick();

    expect(contractorSelect.props('modelValue')).toEqual([]);
  });

  it('selects the newly created contractor when NewContractorButton emits newContractor', async () => {
    const wrapper = mountButton();
    const newContractor = { id: 'c-new', name: 'Neue Firma GmbH' };

    const newContractorButton = wrapper.findComponent(NewContractorButtonStub);
    await newContractorButton.vm.$emit('newContractor', newContractor);
    await wrapper.vm.$nextTick();

    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    expect(contractorSelect.props('modelValue')).toEqual([newContractor]);
  });

  it('trims whitespace from scopeOfWork before submitting', async () => {
    const wrapper = mountButton();
    const contractorSelect = wrapper.findComponent(ContractorMultiSelectStub);
    await contractorSelect.vm.$emit('update:modelValue', [{ id: 'c-1' }]);

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: true, states: { scopeOfWork: { value: '  Reparatur  ' } } });
    await flushPromises();

    expect(quotationRequestService.createQuotationRequest).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ scopeOfWork: 'Reparatur' }),
    );
  });
});
