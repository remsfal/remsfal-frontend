import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DataTable from 'primevue/datatable';
import ContractorTable from '@/components/ContractorTable.vue';
import { contractorService } from '@/services/ContractorService';
import type { IssueItemJson } from '@/services/IssueService';

vi.mock('@/services/ContractorService', () => ({ contractorService: { getIssues: vi.fn() } }));

describe('ContractorTable.vue', () => {
  const mockIssues: IssueItemJson[] = [
    {
      id: '1', title: 'Issue 1', status: 'OPEN' 
    },
    {
      id: '2', title: 'Issue 2', status: 'CLOSED' 
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading while fetching issues', async () => {
    vi.mocked(contractorService.getIssues).mockImplementation(
      () => new Promise(() => {})
    );

    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.findComponent(DataTable).props('loading')).toBe(true);
  });

  it('loads issues successfully and renders table rows', async () => {
    vi.mocked(contractorService.getIssues).mockResolvedValue({
      issues: mockIssues,
      first: 0,
      size: 2,
    });

    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.findComponent(DataTable).props('loading')).toBe(false);
    expect(wrapper.findComponent(DataTable).props('value')).toEqual(mockIssues);

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBe(mockIssues.length + 1);
  });

  it('expands a row when expander is clicked', async () => {
    vi.mocked(contractorService.getIssues).mockResolvedValue({
      issues: mockIssues,
      first: 0,
      size: 2,
    });

    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.findComponent(DataTable).props('expandedRows')).toEqual({});

    await wrapper.find('button[aria-expanded]').trigger('click');
    await flushPromises();

    expect(wrapper.findComponent(DataTable).props('expandedRows')).toEqual(
      expect.objectContaining({ [mockIssues[0].id ?? '']: true }),
    );
  });

  it('handles empty issues list gracefully', async () => {
    vi.mocked(contractorService.getIssues).mockResolvedValue({
      issues: [],
      first: 0,
      size: 0,
    });

    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.findComponent(DataTable).props('value')).toEqual([]);
    expect(wrapper.findComponent(DataTable).props('loading')).toBe(false);
    expect(wrapper.findComponent(DataTable).props('expandedRows')).toEqual({});

    const rows = wrapper.findAll('tr');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('handles fetch errors gracefully', async () => {
    vi.mocked(contractorService.getIssues).mockRejectedValue(new Error('Fetch failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mount(ContractorTable);
    await flushPromises();

    expect(wrapper.findComponent(DataTable).props('value')).toEqual([]);
    expect(wrapper.findComponent(DataTable).props('loading')).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load issues',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
