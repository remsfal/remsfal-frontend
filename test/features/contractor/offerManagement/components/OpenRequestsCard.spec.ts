import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import OpenRequestsCard from '@/features/contractor/offerManagement/components/OpenRequestsCard.vue';
import { quotationRequestService } from '@/services/QuotationRequestService';

const mockRequests = [
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

describe('OpenRequestsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValue({items: mockRequests,});
  });

  const mountCard = () => mount(OpenRequestsCard);

  it('calls getContractorQuotationRequests on mount', async () => {
    mountCard();
    await flushPromises();
    expect(quotationRequestService.getContractorQuotationRequests).toHaveBeenCalledOnce();
  });

  it('renders card title "Offene Anfragen"', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Offene Anfragen');
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
    expect(wrapper.text()).toContain('Keine offenen Anfragen vorhanden');
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
});
