import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Service mocken – Pfad MUSS exakt dem Import in ContractorTable.vue entsprechen
vi.mock('@/services/ContractorService', () => ({ contractorService: { getContractors: vi.fn() } }));


import ContractorTable from '../../src/components/ContractorTable.vue';
import { contractorService } from '@/services/ContractorService';

const PROJECT_ID = 'test-project-id';

const factory = () =>
    shallowMount(ContractorTable, {
      props: { projectId: PROJECT_ID },
      global: {
        stubs: {
          DataTable: true,
          Column: true,
          Button: true,
          InputText: true,
          Checkbox: true,
        },
      },
    });

describe('ContractorTable.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Standard-Response, damit loadContractors nicht crasht
    (contractorService.getContractors as any).mockResolvedValue({ contractors: [] });
  });

  it('lädt Contractors beim Mount mit der übergebenen projectId', async () => {
    factory();

    // onMounted(loadContractors) ruft getContractors einmal auf
    expect(contractorService.getContractors).toHaveBeenCalledTimes(1);
    expect(contractorService.getContractors).toHaveBeenCalledWith(PROJECT_ID);
  });

  it('stellt eine reload-Methode bereit, die getContractors erneut aufruft', async () => {
    const wrapper = factory();
    const vm = wrapper.vm as any;

    // reload ist über defineExpose verfügbar
    expect(typeof vm.reload).toBe('function');

    // initialer Call durch onMounted
    expect(contractorService.getContractors).toHaveBeenCalledTimes(1);

    // reload aufrufen
    await vm.reload();

    // jetzt zweimal: einmal Mount, einmal reload
    expect(contractorService.getContractors).toHaveBeenCalledTimes(2);
    expect(contractorService.getContractors).toHaveBeenLastCalledWith(PROJECT_ID);
  });
});
