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

//   it('should expand row on expander click', async () => {
//     await wrapper.vm.$nextTick();

//     const expandButtons = wrapper.findAll('.p-row-toggler');
//     expect(expandButtons.length).toBe(2);

//     await expandButtons[0].trigger('click');
//     await wrapper.vm.$nextTick();

//     expect(wrapper.text()).toContain('Details für "Task 1"');
//     expect(wrapper.text()).toContain('Beschreibung: Beschreibung 1');
//   });

//   it('should display loading state correctly', async () => {
//     wrapper.vm.isLoading.value = true;
    
//     await wrapper.vm.$nextTick(); 
  
//     expect(wrapper.find('.p-datatable-loading').exists()).toBe(true);
  
//     wrapper.vm.isLoading.value = false;
//     await wrapper.vm.$nextTick();
  
//     expect(wrapper.find('.p-datatable-loading').exists()).toBe(false);
//   });
  
});
