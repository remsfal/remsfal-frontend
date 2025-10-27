import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ContractorTable from '../../src/components/ContractorTable.vue';
import { contractorService } from '../../src/services/ContractorService';

describe('ContractorTable.vue', () => {
  let wrapper: VueWrapper;

  // Mock the service
  vi.mock('@/services/ContractorService');

  beforeEach(() => {
    vi.mocked(contractorService.getIssues).mockResolvedValue({
      issues: [
        {
 id: '1', title: 'Issue 1', status: 'OPEN', description: 'Beschreibung 1'
},
        {
 id: '2', title: 'Issue 2', status: 'CLOSED', description: 'Beschreibung 2'
},
      ],
      first: 0,
      size: 2,
      total: 2,
    });

    wrapper = mount(ContractorTable);
  });

  it('should render rows correctly', async () => {
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBeGreaterThan(1);
  });
});
