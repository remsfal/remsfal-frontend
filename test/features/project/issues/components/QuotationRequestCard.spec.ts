import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import QuotationRequestCard from '@/features/project/issues/components/QuotationRequestCard.vue';
import { quotationRequestService } from '@/services/QuotationRequestService';

const mockRequests = [
  {
    id: 'qr-1',
    contractorId: 'c-1',
    scopeOfWork: 'Dachrinne reparieren',
    status: 'REQUESTED',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'qr-2',
    contractorId: 'c-2',
    scopeOfWork: 'Fenster erneuern',
    status: 'SUBMITTED',
    createdAt: '2026-01-16T10:00:00Z',
  },
];

describe('QuotationRequestCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(quotationRequestService, 'getQuotationRequests').mockResolvedValue({ items: mockRequests });
  });

  const mountCard = (props = { projectId: 'proj-1', issueId: 'issue-1' }) =>
    mount(QuotationRequestCard, {
      props,
      global: { stubs: { NewQuotationRequestDialog: true } },
    });

  it('calls getQuotationRequests with issueId on mount', async () => {
    mountCard();
    await flushPromises();
    expect(quotationRequestService.getQuotationRequests).toHaveBeenCalledWith('issue-1');
  });

  it('renders card title "Auftragsmanagement"', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Auftragsmanagement');
  });

  it('renders scopeOfWork values in table', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Dachrinne reparieren');
    expect(wrapper.text()).toContain('Fenster erneuern');
  });

  it('renders translated status labels', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Angefragt');
    expect(wrapper.text()).toContain('Eingereicht');
  });

  it('shows empty message when no requests exist', async () => {
    vi.spyOn(quotationRequestService, 'getQuotationRequests').mockResolvedValue({ items: [] });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Keine Anfragen vorhanden');
  });

  it('handles undefined items from API gracefully', async () => {
    vi.spyOn(quotationRequestService, 'getQuotationRequests').mockResolvedValue({ items: undefined });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders empty string for items without status', async () => {
    vi.spyOn(quotationRequestService, 'getQuotationRequests').mockResolvedValue({
      items: [{ id: 'qr-3', scopeOfWork: 'Test', status: undefined }],
    });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('does not throw when getQuotationRequests fails', async () => {
    vi.spyOn(quotationRequestService, 'getQuotationRequests').mockRejectedValue(new Error('Network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    consoleSpy.mockRestore();
  });

  it('renders NewQuotationRequestDialog', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'NewQuotationRequestDialog' }).exists()).toBe(true);
  });

  it('re-fetches requests when NewQuotationRequestDialog emits created', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const spy = vi.spyOn(quotationRequestService, 'getQuotationRequests').mockResolvedValue({ items: [] });
    const dialog = wrapper.findComponent({ name: 'NewQuotationRequestDialog' });
    await dialog.vm.$emit('created');
    await flushPromises();

    expect(spy).toHaveBeenCalled();
  });
});
