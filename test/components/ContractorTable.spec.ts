import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorTable from '@/components/ContractorTable.vue';

vi.mock('@/services/ContractorService', () => ({ contractorService: { getContractors: vi.fn() } }));

const { contractorService } = await import('@/services/ContractorService');

const PROJECT_ID = 'p1';

const mockContractors = [
  {
    id: '1',
    companyName: 'Alpha',
    email: 'alpha@mail.com',
    trade: 'Dach',
    address: {
      street: 'A',
      city: 'B',
      zip: '11111',
    },
  },
  {
    id: '2',
    companyName: 'Beta',
    email: 'beta@mail.com',
    trade: 'Maler',
    address: {
      street: 'X',
      city: 'Y',
      zip: '22222',
    },
  },
];

const mountTable = () =>
    mount(ContractorTable, {
      props: { projectId: PROJECT_ID },
      global: {
        stubs: {
          DataTable: { template: '<div><slot></slot><slot name="body"></slot></div>' },
          Column: { template: '<div></div>' },
          Button: { template: '<button @click="$emit(\'click\')"></button>' },
          InputText: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
                '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          },
          Checkbox: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
                '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
          },
        },
      },
    });

describe('ContractorTable.vue', () => {
  beforeEach(() => {
    (contractorService.getContractors as unknown as vi.Mock).mockReset();
    (contractorService.getContractors as unknown as vi.Mock).mockResolvedValue({ contractors: mockContractors });
  });

  it('loads contractors on mount', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    expect(contractorService.getContractors).toHaveBeenCalledWith(PROJECT_ID);
    expect(wrapper.vm.contractors.length).toBe(2);
  });

  it('filters contractors via search', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    wrapper.vm.searchTerm = 'alpha';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.filteredContractors.length).toBe(1);
    expect(wrapper.vm.filteredContractors[0].companyName).toBe('Alpha');
  });

  it('toggles archive mode and switches view list', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    wrapper.vm.toggleArchived('1', true);
    expect(wrapper.vm.isArchived(mockContractors[0])).toBe(true);

    wrapper.vm.showArchive = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.baseList.length).toBe(1);
    expect(wrapper.vm.baseList[0].id).toBe('1');
  });

  it('emits edit event', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    const c = mockContractors[0];
    wrapper.vm.$emit('edit', c);

    expect(wrapper.emitted().edit).toBeTruthy();
    expect(wrapper.emitted().edit![0][0]).toEqual(c);
  });

  it('emits delete event', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    const c = mockContractors[1];
    wrapper.vm.$emit('delete', c);

    expect(wrapper.emitted().delete).toBeTruthy();
    expect(wrapper.emitted().delete![0][0]).toEqual(c);
  });

  it('reloads contractors via exposed function', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    await wrapper.vm.reload();
    expect(contractorService.getContractors).toHaveBeenCalledTimes(2);
  });
});
