import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import NewQuotationRequestDialog from '@/features/project/issues/components/NewQuotationRequestDialog.vue';
import { quotationRequestService } from '@/services/QuotationRequestService';
import { projectContractorService } from '@/services/ProjectContractorService';
import { projectService } from '@/services/ProjectService';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

const mockContractors = [
  { id: 'c-1', companyName: 'Alpha Bau GmbH' },
  { id: 'c-2', companyName: 'Beta Elektro GmbH' },
];
const mockProject = {
  title: 'Projekt 1',
  owner: 'Muster Eigentümer GmbH',
  careOf: 'Max Mustermann',
  address: {
    street: 'Musterstraße 1',
    zip: '12345',
    city: 'Berlin',
    province: 'Berlin',
    countryCode: 'DE',
  },
};

describe('NewQuotationRequestDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(quotationRequestService, 'createQuotationRequest').mockResolvedValue(undefined);
    vi.spyOn(projectContractorService, 'getContractors').mockResolvedValue({ contractors: mockContractors });
    vi.spyOn(projectService, 'getProject').mockResolvedValue(mockProject);
  });

  const mountDialog = (props = { projectId: 'proj-1', issueId: 'issue-1' }) =>
    mount(NewQuotationRequestDialog, {
      props,
      global: {
        stubs: {
          BaseDialog: BaseDialogStub, Textarea: true, MultiSelect: true 
        } 
      },
    });

  it('renders trigger button with label "Neues Angebot anfragen"', () => {
    const wrapper = mountDialog();
    expect(wrapper.text()).toContain('Neues Angebot anfragen');
  });

  it('dialog is initially not visible', () => {
    const wrapper = mountDialog();
    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
  });

  it('dialog becomes visible when button is clicked', async () => {
    const wrapper = mountDialog();
    const trigger = wrapper.findAll('button').find((b) => b.text().includes('Angebot'));
    await trigger?.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('true');
  });

  it('fetches contractors on mount', async () => {
    mountDialog();
    await flushPromises();
    expect(projectContractorService.getContractors).toHaveBeenCalledWith('proj-1');
  });

  it('fetches billing recipient data on mount', async () => {
    mountDialog();
    await flushPromises();
    expect(projectService.getProject).toHaveBeenCalledWith('proj-1');
  });

  it('renders form field labels', () => {
    const wrapper = mountDialog();
    expect(wrapper.text()).toContain('Leistungsbeschreibung');
    expect(wrapper.text()).toContain('Auftragnehmer');
  });

  it('closes dialog when cancel button is clicked', async () => {
    const wrapper = mountDialog();
    const trigger = wrapper.findAll('button').find((b) => b.text().includes('Angebot'));
    await trigger?.trigger('click');
    await wrapper.vm.$nextTick();

    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Abbrechen');
    await cancelBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
  });

  it('calls createQuotationRequest with correct payload on valid submit', async () => {
    const wrapper = mountDialog();
    const selectedContractors = [{ id: 'c-1', companyName: 'Alpha Bau GmbH' }];

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        scopeOfWork: { value: 'Dachrinne reparieren' },
        contractors: { value: selectedContractors },
      },
    });
    await flushPromises();

    expect(quotationRequestService.createQuotationRequest).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({
        scopeOfWork: 'Dachrinne reparieren',
        contractors: selectedContractors,
        projectOwner: 'Muster Eigentümer GmbH',
        projectCareOf: 'Max Mustermann',
        billingAddress: mockProject.address,
      }),
    );
  });

  it('emits created event after successful submit', async () => {
    const wrapper = mountDialog();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        scopeOfWork: { value: 'Reparatur' },
        contractors: { value: [{ id: 'c-1', companyName: 'Alpha Bau GmbH' }] },
      },
    });
    await flushPromises();
    expect(wrapper.emitted('created')).toBeTruthy();
  });

  it('shows success toast after valid submit', async () => {
    const wrapper = mountDialog();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        scopeOfWork: { value: 'Reparatur' },
        contractors: { value: [{ id: 'c-1' }] },
      },
    });
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('closes dialog after successful submit', async () => {
    const wrapper = mountDialog();
    const trigger = wrapper.findAll('button').find((b) => b.text().includes('Angebot'));
    await trigger?.trigger('click');
    await wrapper.vm.$nextTick();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        scopeOfWork: { value: 'Reparatur' },
        contractors: { value: [{ id: 'c-1' }] },
      },
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
  });

  it('shows error toast when createQuotationRequest fails', async () => {
    vi.spyOn(quotationRequestService, 'createQuotationRequest').mockRejectedValue(new Error('API error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountDialog();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        scopeOfWork: { value: 'Reparatur' },
        contractors: { value: [{ id: 'c-1' }] },
      },
    });
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });

  it('does not emit created when createQuotationRequest fails', async () => {
    vi.spyOn(quotationRequestService, 'createQuotationRequest').mockRejectedValue(new Error('API error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountDialog();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        scopeOfWork: { value: 'Reparatur' },
        contractors: { value: [{ id: 'c-1' }] },
      },
    });
    await flushPromises();

    expect(wrapper.emitted('created')).toBeFalsy();
    consoleSpy.mockRestore();
  });

  it('does not call createQuotationRequest when form is invalid', async () => {
    const wrapper = mountDialog();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: false, states: {} });
    await flushPromises();
    expect(quotationRequestService.createQuotationRequest).not.toHaveBeenCalled();
  });

  it('resets form when dialog emits hide', async () => {
    const wrapper = mountDialog();
    const dialog = wrapper.findComponent({ name: 'BaseDialog' });
    await dialog.vm.$emit('hide');
    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
  });

  it('handles contractor fetch failure gracefully', async () => {
    vi.spyOn(projectContractorService, 'getContractors').mockRejectedValue(new Error('Network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountDialog();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    consoleSpy.mockRestore();
  });

  it('trims whitespace from scopeOfWork before submitting', async () => {
    const wrapper = mountDialog();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        scopeOfWork: { value: '  Reparatur  ' },
        contractors: { value: [{ id: 'c-1' }] },
      },
    });
    await flushPromises();

    expect(quotationRequestService.createQuotationRequest).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ scopeOfWork: 'Reparatur' }),
    );
  });
});
