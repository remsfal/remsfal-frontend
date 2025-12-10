import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
      zip: '11111'
    }
  },
  {
    id: '2',
    companyName: 'Beta',
    email: 'beta@mail.com',
    trade: 'Maler',
    address: {
      street: 'X',
      city: 'Y',
      zip: '22222'
    }
  }
];

const mountTable = (props: Record<string, unknown> = { projectId: PROJECT_ID }) =>
    mount(ContractorTable, {
      props,
      global: {
        stubs: {
          DataTable: { template: '<div><slot></slot><slot name="body"></slot></div>' },
          Column: { template: '<div></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          InputText: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
                '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
          },
          Checkbox: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template:
                '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />'
          }
        }
      }
    });

describe('ContractorTable.vue', () => {
  let warnSpy: vi.SpyInstance;
  let errorSpy: vi.SpyInstance;

  beforeEach(() => {
    (contractorService.getContractors as unknown as vi.Mock).mockReset();

    (contractorService.getContractors as unknown as vi.Mock).mockResolvedValue({ contractors: mockContractors });

    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('loads contractors on mount when projectId is provided', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    expect(contractorService.getContractors).toHaveBeenCalledWith(PROJECT_ID);
    expect(wrapper.vm.contractors.length).toBe(2);
  });

  it('reacts to projectId changes and reloads data', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    expect(contractorService.getContractors).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ projectId: 'p2' });
    await wrapper.vm.$nextTick();

    expect(contractorService.getContractors).toHaveBeenCalledTimes(2);
    expect((contractorService.getContractors as unknown as vi.Mock).mock.calls[1][0]).toBe('p2');
  });

  it('handles missing projectId by logging warning and not calling service', async () => {
    const wrapper = mountTable({});
    await wrapper.vm.$nextTick();

    expect(contractorService.getContractors).not.toHaveBeenCalled();
    expect(wrapper.vm.contractors.length).toBe(0);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('handles service errors and sets contractors to empty', async () => {
    (contractorService.getContractors as unknown as vi.Mock).mockRejectedValueOnce(new Error('boom'));

    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    expect(errorSpy).toHaveBeenCalled();
    expect(wrapper.vm.contractors.length).toBe(0);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('filters contractors via search (company/email/trade)', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    wrapper.vm.searchTerm = 'alpha';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.filteredContractors.length).toBe(1);
    expect(wrapper.vm.filteredContractors[0].companyName).toBe('Alpha');

    wrapper.vm.searchTerm = 'MALER';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.filteredContractors.length).toBe(1);
    expect(wrapper.vm.filteredContractors[0].trade).toBe('Maler');

    wrapper.vm.searchTerm = 'mail.com';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.filteredContractors.length).toBe(2);
  });

  it('returns full base list when search term is empty', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    wrapper.vm.searchTerm = '';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.filteredContractors.length).toBe(wrapper.vm.baseList.length);
  });

  it('toggles archive state and baseList responds to showArchive flag', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.baseList.length).toBe(2);

    wrapper.vm.toggleArchived('1', true);
    expect(wrapper.vm.isArchived(mockContractors[0])).toBe(true);
    expect(wrapper.vm.isArchived({ ...mockContractors[0], id: undefined })).toBe(false);

    wrapper.vm.showArchive = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.baseList.length).toBe(1);
    expect(wrapper.vm.baseList[0].id).toBe('1');
  });

  it('ignores toggleArchived call when id is undefined', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    const before = { ...wrapper.vm.archiveState };
    wrapper.vm.toggleArchived(undefined, true);
    expect(wrapper.vm.archiveState).toEqual(before);
  });

  it('computes countLabel depending on showArchive flag', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.countLabel).toBe('Auftragnehmer');

    wrapper.vm.showArchive = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.countLabel).toBe('archivierte Auftragnehmer');
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

  it('reloads contractors via exposed reload function', async () => {
    const wrapper = mountTable();
    await wrapper.vm.$nextTick();

    await wrapper.vm.reload();
    expect(contractorService.getContractors).toHaveBeenCalledTimes(2);
  });
});
