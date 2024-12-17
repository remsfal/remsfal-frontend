import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ContractorTable from '../../src/components/ContractorTable.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useContractorStore } from '../../src/stores/ContractorStore';
import PrimeVue from 'primevue/config';

vi.mock('@/stores/ContractorStore');

describe('ContractorTable.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const contractorStore = {
      tasks: [
        { id: 1, title: 'Task 1', status: 'Open', description: 'Beschreibung 1' },
        { id: 2, title: 'Task 2', status: 'Closed', description: 'Beschreibung 2' },
      ],
      totalTasks: 2,
    };

    useContractorStore.mockReturnValue(contractorStore);

    wrapper = mount(ContractorTable, {
      global: {
        plugins: [pinia, PrimeVue],
      },
    });
  });

  it('should render rows correctly', async () => {
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBeGreaterThan(1);
  });  
});
