import { shallowMount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import ContractorView from '../../src/views/ContractorView.vue';
import { useContractorStore } from '../../src/stores/ContractorStore';
import PrimeVue from 'primevue/config';

vi.mock('@/stores/ContractorStore', () => ({
  useContractorStore: vi.fn(),
}));

vi.mock('../../src/components/ContractorTable.vue', () => ({
  default: {
    name: 'ContractorTable',
    template: '<div class="mock-contractor-table"></div>',
  },
}));

describe('ContractorView.vue', () => {
  let wrapper: VueWrapper<any>;
  const mockRefreshTaskList = vi.fn();

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    useContractorStore.mockReturnValue({
      refreshTaskList: mockRefreshTaskList,
      tasks: [],
      selectedTask: null,
      totalTasks: 0,
    });

    wrapper = shallowMount(ContractorView, {
      global: {
        plugins: [pinia, PrimeVue],
      },
    });
  });

  it('renders the view correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h5').text()).toBe('Übersicht der Aufträge');
  });

  it('calls refreshTaskList on mount', () => {
    expect(mockRefreshTaskList).toHaveBeenCalledWith('yourOwnerId');
  });
});
