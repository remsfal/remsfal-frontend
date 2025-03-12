import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ContractorTable from '../../src/components/ContractorTable.vue';
import { contractorService } from '../../src/services/ContractorService';

describe('ContractorTable.vue', () => {
  let wrapper: VueWrapper;

  vi.mock('@/services/ContractorService');

  beforeEach(() => {
    vi.mocked(contractorService.getTasks).mockResolvedValue({
      tasks: [
        { id: '1', title: 'Task 1', status: 'OPEN', description: 'Beschreibung 1' },
        { id: '2', title: 'Task 2', status: 'CLOSED', description: 'Beschreibung 2' },
      ],
    });

    wrapper = mount(ContractorTable);
  });

  it('should render rows correctly', async () => {
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBeGreaterThan(1);
  });
});
