import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';
import ContractorView from '@/views/ContractorView.vue';

const PROJECT_ID = 'project-123';

// Service mocken
vi.mock('@/services/ContractorService', () => ({
  contractorService: {
    createContractor: vi.fn(),
    updateContractor: vi.fn(),
    deleteContractor: vi.fn(),
  },
}));

// Import the service after mocking
const { contractorService } = await import('@/services/ContractorService');

// Minimaltypen für das ViewModel

type ContractorAddressForm = {
  street: string;
  city: string;
  zip: string;
  province?: string;
  countryCode?: string;
};

type ContractorForm = {
  companyName: string;
  email: string;
  phone?: string;
  trade?: string;
  address: ContractorAddressForm;
};

type ContractorViewVm = ComponentPublicInstance & {
  showDialog: boolean;
  isEditMode: boolean;
  currentContractor: {
    id?: string;
    companyName?: string;
    email?: string;
    address?: ContractorAddressForm;
  } | null;
  form: ContractorForm;
  globalError: string | null;
  openCreateDialog: () => void;
  submitForm: () => Promise<void>;
  deleteContractor: (contractor: {
    id?: string;
    companyName?: string;
    email?: string;
    address?: ContractorAddressForm;
  }) => Promise<void>;
};

const mountView = () => {
  return mount(ContractorView, {
    props: { projectId: PROJECT_ID },
    global: {
      stubs: {
        Card: {
          template:
              '<div class="card-stub"><slot name="title"></slot><slot name="content"></slot></div>',
        },
        Dialog: {
          template:
              '<div class="dialog-stub"><slot></slot><slot name="footer"></slot></div>',
        },
        InputText: {
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
        Button: {
          props: ['label', 'icon', 'severity'],
          emits: ['click'],
          template:
              '<button type="button" @click="$emit(\'click\')">{{ label }}</button>',
        },
        ContractorTable: {
          name: 'ContractorTable',
          template: '<div class="contractor-table-stub"></div>',
        },
      },
    },
  });
};

describe('ContractorView.vue', () => {
  beforeEach(() => {
    // FIX 1: Use 'as Mock' instead of 'as unknown as vi.Mock' for clean code smell fix
    (contractorService.createContractor as Mock).mockReset();
    (contractorService.updateContractor as Mock).mockReset();
    (contractorService.deleteContractor as Mock).mockReset();
  });

  it('renders header text and shows ContractorTable stub', () => {
    const wrapper = mountView();
    const text = wrapper.text();

    expect(text).toContain('Auftraggeber & Dienstleister');
    expect(text).toContain('Verwalte hier externe Firmen');

    // FIX 3: Define the missing variable that caused ReferenceError
    const tableStub = wrapper.find('.contractor-table-stub');
    expect(tableStub.exists()).toBe(true);
  });

  it('opens create dialog when header button is clicked', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    expect(vm.showDialog).toBe(false);

    const button = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Neuen Auftragnehmer hinzufügen'));

    expect(button).toBeTruthy();
    await button!.trigger('click');

    expect(vm.showDialog).toBe(true);
    expect(vm.isEditMode).toBe(false);
    expect(vm.currentContractor).toBeNull();
  });

  it('does not submit when required fields are missing and sets a validation error', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    await vm.submitForm();

    expect(contractorService.createContractor).not.toHaveBeenCalled();
    expect(contractorService.updateContractor).not.toHaveBeenCalled();
    expect(vm.globalError).toContain('Bitte folgende Pflichtfelder ausfüllen');
  });

  it('shows an error when phone number is invalid', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    vm.form.companyName = 'Testfirma';
    vm.form.email = 'test@example.com';
    vm.form.address.street = 'Teststraße 1';
    vm.form.address.zip = '12345';
    vm.form.address.city = 'Berlin';
    vm.form.phone = '123';

    await vm.submitForm();

    expect(contractorService.createContractor).not.toHaveBeenCalled();
    expect(vm.globalError).toContain('Telefonnummer muss 10–14 Ziffern enthalten');
  });

  it('creates a contractor when form is valid (create mode)', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    vm.form.companyName = 'Neue Firma';
    vm.form.email = 'firma@example.com';
    vm.form.address.street = 'Straße 1';
    vm.form.address.zip = '12345';
    vm.form.address.city = 'Berlin';
    vm.form.phone = '+491234567890';
    vm.form.trade = 'Dachdecker';

    // FIX 1: Use 'as Mock'
    (contractorService.createContractor as Mock).mockResolvedValue({id: 'c1',});

    await vm.submitForm();

    // FIX 1: Use 'as Mock'
    expect(contractorService.createContractor).toHaveBeenCalledTimes(1);
    const [calledProjectId, payload] = (
        contractorService.createContractor as Mock
    ).mock.calls[0];

    expect(calledProjectId).toBe(PROJECT_ID);
    expect(payload.companyName).toBe('Neue Firma');
    expect(payload.address.city).toBe('Berlin');
    expect(vm.showDialog).toBe(false);
  });

  it('updates a contractor when in edit mode and currentContractor has an id', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    vm.isEditMode = true;
    vm.currentContractor = {
      id: 'c-123',
      companyName: 'Alt',
      email: 'alt@example.com',
      address: {
        street: 'Altstraße 1',
        city: 'Altstadt',
        zip: '11111',
      },
    };

    vm.form.companyName = 'Geänderte Firma';
    vm.form.email = 'neu@example.com';
    vm.form.address.street = 'Neu Straße 2';
    vm.form.address.zip = '22222';
    vm.form.address.city = 'Neustadt';

    // FIX 1: Use 'as Mock'
    (contractorService.updateContractor as Mock).mockResolvedValue({id: 'c-123',});

    await vm.submitForm();

    // FIX 1: Use 'as Mock'
    expect(contractorService.updateContractor).toHaveBeenCalledTimes(1);
    const [projId, contractorId, payload] = (
        contractorService.updateContractor as Mock
    ).mock.calls[0];

    expect(projId).toBe(PROJECT_ID);
    expect(contractorId).toBe('c-123');
    expect(payload.companyName).toBe('Geänderte Firma');
    expect(payload.id).toBe('c-123');
    expect(vm.showDialog).toBe(false);
  });

  it('sets a specific error when backend rejects address with status 400', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    vm.form.companyName = 'Neue Firma';
    vm.form.email = 'firma@example.com';
    vm.form.address.street = 'Straße 1';
    vm.form.address.zip = '12345';
    vm.form.address.city = 'Berlin';

    // FIX 1: Use 'as Mock'
    (contractorService.createContractor as Mock).mockRejectedValueOnce(
        { response: { status: 400 } },
    );

    await vm.submitForm();

    expect(contractorService.createContractor).toHaveBeenCalledTimes(1);
    expect(vm.globalError).toContain(
        'Adresse wurde vom Backend als ungültig abgelehnt',
    );
  });

  it('sets a generic error when backend returns an unexpected error', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    vm.form.companyName = 'Neue Firma';
    vm.form.email = 'firma@example.com';
    vm.form.address.street = 'Straße 1';
    vm.form.address.zip = '12345';
    vm.form.address.city = 'Berlin';

    // FIX 1: Use 'as Mock'
    (contractorService.createContractor as Mock).mockRejectedValueOnce(
        new Error('server kaputt'),
    );

    await vm.submitForm();

    expect(contractorService.createContractor).toHaveBeenCalledTimes(1);
    expect(vm.globalError).toContain('Beim Speichern ist ein Fehler aufgetreten');
  });

  it('deletes a contractor when confirmed', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    // FIX 2: Use globalThis instead of window
    const confirmSpy = vi
        .spyOn(globalThis, 'confirm')
        .mockImplementation(() => true);

    const contractor = {
      id: 'to-delete',
      companyName: 'Lösch mich GmbH',
      email: 'x@example.com',
      address: {
        street: 'Straße',
        city: 'Stadt',
        zip: '00000',
      },
    };

    await vm.deleteContractor(contractor);

    expect(contractorService.deleteContractor).toHaveBeenCalledWith(
        PROJECT_ID,
        'to-delete',
    );

    confirmSpy.mockRestore();
  });

  it('does not delete contractor when user cancels confirm dialog', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as ContractorViewVm;

    // FIX 2: Use globalThis instead of window
    const confirmSpy = vi
        .spyOn(globalThis, 'confirm')
        .mockImplementation(() => false);

    const contractor = {
      id: 'to-not-delete',
      companyName: 'Bleib GmbH',
      email: 'stay@example.com',
      address: {
        street: 'Straße',
        city: 'Stadt',
        zip: '00000',
      },
    };

    await vm.deleteContractor(contractor);

    expect(contractorService.deleteContractor).not.toHaveBeenCalledWith(
        PROJECT_ID,
        'to-not-delete',
    );

    confirmSpy.mockRestore();
  });
});