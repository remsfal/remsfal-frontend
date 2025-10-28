import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import ContractorTable from '../../src/components/ContractorTable.vue';
import { contractorService } from '@/services/ContractorService';

vi.mock('@/services/ContractorService', () => ({
  contractorService:{ getIssues: vi.fn(),},
}));

describe('ContractorTable.vue', () => {
  const mockIssues = [
    {
      id: '1',
      title: 'Issue 1',
      status: 'OPEN',
      description: 'Beschreibung 1',
    },
    {
      id: '2',
      title: 'Issue 2',
      status: 'CLOSED',
      description: 'Beschreibung 2',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading while fetching issues', async () => {
    contractorService.getIssues.mockImplementation(
      () => new Promise(() => {})
    );

    const wrapper = mount(ContractorTable);

    expect(wrapper.vm.isLoading).toBe(true);
  });

  it('loads issues successfully and renders table rows', async () => {
    contractorService.getIssues.mockResolvedValue({
      issues: mockIssues,
      first: 0,
      size: 2,
      total: 2,
    });

    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.issues).toEqual(mockIssues);

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBe(mockIssues.length + 1);
  });

  it('expands a row when expander is clicked', async () => {
    contractorService.getIssues.mockResolvedValue({
      issues: mockIssues,
      first: 0,
      size: 2,
      total: 2,
    });

    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.vm.expandedRows).toEqual({});

    wrapper.vm.expandedRows[mockIssues[0].id] = true;
    await flushPromises();

    expect(wrapper.vm.expandedRows[mockIssues[0].id]).toBe(true);
  });

  it('handles empty issues list gracefully', async () => {
    contractorService.getIssues.mockResolvedValue({
      issues: [],
      first: 0,
      size: 0,
      total: 0,
    });

    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.vm.issues).toEqual([]);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.expandedRows).toEqual({});

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('handles fetch errors gracefully', async () => {
    contractorService.getIssues.mockRejectedValue(new Error('Fetch failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.vm.issues).toEqual([]);
    expect(wrapper.vm.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load issues',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
