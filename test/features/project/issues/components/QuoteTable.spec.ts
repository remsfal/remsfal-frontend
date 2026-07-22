import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import QuoteTable from '@/features/project/issues/components/QuoteTable.vue';
import { quotationService, type QuotationJson } from '@/services/QuotationService';
import { orderPlacementService } from '@/services/OrderPlacementService';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

const mockQuotations: QuotationJson[] = [
  {
    id: 'q-1', contractorName: 'ACME GmbH', status: 'VALID',
    createdAt: '2026-01-10T10:00:00Z', validUntil: '2026-02-10T10:00:00Z',
  },
  {
    id: 'q-2', contractorName: 'BauCo', status: 'ACCEPTED',
    createdAt: '2026-01-11T10:00:00Z', validUntil: '2026-02-11T10:00:00Z',
  },
];

describe('QuoteTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(quotationService, 'getQuotations').mockResolvedValue({ items: mockQuotations });
  });

  const mountTable = () => mount(QuoteTable, { props: { issueId: 'issue-1' } });

  it('calls getQuotations with issueId on mount', async () => {
    mountTable();
    await flushPromises();
    expect(quotationService.getQuotations).toHaveBeenCalledWith('issue-1');
  });

  it('renders contractor names', async () => {
    const wrapper = mountTable();
    await flushPromises();
    expect(wrapper.text()).toContain('ACME GmbH');
    expect(wrapper.text()).toContain('BauCo');
  });

  it('renders translated status labels', async () => {
    const wrapper = mountTable();
    await flushPromises();
    expect(wrapper.text()).toContain('Gültig');
    expect(wrapper.text()).toContain('Angenommen');
  });

  it('shows Place Order button only for VALID quotations', async () => {
    const wrapper = mountTable();
    await flushPromises();
    const buttons = wrapper.findAllComponents({ name: 'Button' })
      .filter((b) => b.text().includes('Auftrag erteilen'));
    expect(buttons).toHaveLength(1);
  });

  it('places order and refetches on button click', async () => {
    const placeOrderSpy = vi.spyOn(orderPlacementService, 'placeOrder').mockResolvedValue({ id: 'op-1' });
    const wrapper = mountTable();
    await flushPromises();

    const getQuotationsSpy = vi.spyOn(quotationService, 'getQuotations').mockResolvedValue({ items: [] });
    const button = wrapper.findAllComponents({ name: 'Button' })
      .find((b) => b.text().includes('Auftrag erteilen'));
    await button!.trigger('click');
    await flushPromises();

    expect(placeOrderSpy).toHaveBeenCalledWith('issue-1', 'q-1');
    expect(getQuotationsSpy).toHaveBeenCalled();
  });

  it('does not throw when getQuotations fails', async () => {
    vi.spyOn(quotationService, 'getQuotations').mockRejectedValue(new Error('Network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountTable();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    consoleSpy.mockRestore();
  });

  it('shows error toast when placeOrder fails', async () => {
    vi.spyOn(orderPlacementService, 'placeOrder').mockRejectedValue(new Error('fail'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountTable();
    await flushPromises();
    const button = wrapper.findAllComponents({ name: 'Button' })
      .find((b) => b.text().includes('Auftrag erteilen'));
    await button!.trigger('click');
    await flushPromises();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });
});
