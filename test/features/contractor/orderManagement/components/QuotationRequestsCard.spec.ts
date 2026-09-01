import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import QuotationRequestsCard from '@/features/contractor/orderManagement/components/QuotationRequestsCard.vue';
import QuotationRequestsTable from '@/features/contractor/orderManagement/components/QuotationRequestsTable.vue';
import { quotationRequestService, type QuotationRequestJson } from '@/services/QuotationRequestService';

const pushMock = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => ({ push: pushMock }) };
});

const mockRequests: QuotationRequestJson[] = [
  {
    id: 'qr-1',
    scopeOfWork: 'Dachrinne reparieren',
    status: 'REQUESTED',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'qr-2',
    scopeOfWork: 'Fenster erneuern',
    status: 'SUBMITTED',
    createdAt: '2026-01-16T10:00:00Z',
  },
];

describe('QuotationRequestsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockClear();
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({items: mockRequests,});
  });

  const mountCard = () => mount(QuotationRequestsCard);

  it('calls getContractorQuotationRequests on mount', async () => {
    mountCard();
    await flushPromises();
    expect(quotationRequestService.getContractorQuotationRequests).toHaveBeenCalledOnce();
  });

  it('renders card title "Anfragen zur Erstellung eines Angebots"', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Anfragen zur Erstellung eines Angebots');
  });

  it('shows only REQUESTED entries in the table', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Dachrinne reparieren');
    expect(wrapper.text()).not.toContain('Fenster erneuern');
  });

  it('renders translated status label for REQUESTED', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Angefragt');
  });

  it('shows empty message when no open requests exist', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({
      items: [{
        id: 'qr-1', status: 'SUBMITTED', scopeOfWork: 'Test'
      }],
    });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Keine Anfragen zur Erstellung eines Angebots vorhanden');
  });

  it('handles undefined items from API gracefully', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({items: undefined,});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('does not throw when getContractorQuotationRequests fails', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockRejectedValue(
      new Error('Network'),
    );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    consoleSpy.mockRestore();
  });

  it('navigates to the order details route when a row is selected', async () => {
    const wrapper = mountCard();
    await flushPromises();

    wrapper.getComponent(QuotationRequestsTable).vm.$emit('rowSelect', mockRequests[0]);

    expect(pushMock).toHaveBeenCalledWith({
      name: 'ContractorOrderDetails',
      params: { requestId: 'qr-1' },
    });
  });
});
