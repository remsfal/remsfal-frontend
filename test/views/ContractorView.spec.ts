import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
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

const { contractorService } = await import('@/services/ContractorService');

// Minimaltyp für das, was wir vom ViewModel brauchen
type ContractorViewVm = {
  deleteContractor: (contractor: {
    id?: string;
    companyName?: string;
    email?: string;
    address?: { street?: string; city?: string; zip?: string };
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
    (contractorService.createContractor as unknown as vi.Mock).mockReset();
    (contractorService.updateContractor as unknown as vi.Mock).mockReset();
    (contractorService.deleteContractor as unknown as vi.Mock).mockReset();
  });

  // … alles andere bleibt unverändert …

  it('deletes a contractor when confirmed', async () => {
    const wrapper = mountView();
    const vm = wrapper.vm as unknown as ContractorViewVm;

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
    const vm = wrapper.vm as unknown as ContractorViewVm;

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
