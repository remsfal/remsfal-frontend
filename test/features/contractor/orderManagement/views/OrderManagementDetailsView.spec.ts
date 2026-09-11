import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import OrderManagementDetailsView from '@/features/contractor/orderManagement/views/OrderManagementDetailsView.vue';
import QuotationRequestDetailsCard from
  '@/features/contractor/orderManagement/components/QuotationRequestDetailsCard.vue';
import ContractorOrderTimelineCard from
  '@/features/contractor/orderManagement/components/ContractorOrderTimelineCard.vue';
import { quotationRequestService, type QuotationRequestJson } from
  '@/features/contractor/orderManagement/services/QuotationRequestService';

const makeRequest = (overrides: Partial<QuotationRequestJson> = {}): QuotationRequestJson => ({
  id: 'qr-1',
  issueId: 'issue-1',
  status: 'REQUESTED',
  scopeOfWork: 'Dachrinne reparieren',
  ...overrides,
});

const mountView = (issueId = 'issue-1') => mount(OrderManagementDetailsView, {
  props: { issueId },
  global: { stubs: { QuotationRequestDetailsCard: true, ContractorOrderTimelineCard: true } },
});

describe('OrderManagementDetailsView', () => {
  it('finds the matching request from the contractor request list by issueId', async () => {
    const request = makeRequest();
    const items = [makeRequest({ id: 'other', issueId: 'other-issue' }), request];
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValueOnce({ items });

    const wrapper = mountView('issue-1');
    await flushPromises();

    expect(wrapper.getComponent(QuotationRequestDetailsCard).props('request')).toEqual(request);
  });

  it('renders the contractor timeline for the matching request', async () => {
    const request = makeRequest();
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValueOnce({ items: [request] });

    const wrapper = mountView('issue-1');
    await flushPromises();

    const timeline = wrapper.getComponent(ContractorOrderTimelineCard);
    expect(timeline.props('issueId')).toBe('issue-1');
    expect(timeline.props('requestId')).toBe('qr-1');
  });

  it('shows a not-found message when no item matches the issueId', async () => {
    const items = [makeRequest({ id: 'other', issueId: 'other-issue' })];
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockResolvedValueOnce({ items });

    const wrapper = mountView('issue-1');
    await flushPromises();

    expect(wrapper.find('.p-message').exists()).toBe(true);
    expect(wrapper.findComponent(QuotationRequestDetailsCard).exists()).toBe(false);
  });

  it('shows a load-error message when the request fails', async () => {
    vi.spyOn(quotationRequestService, 'getContractorQuotationRequests').mockRejectedValueOnce(new Error('network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountView('issue-1');
    await flushPromises();

    expect(wrapper.find('.p-message').exists()).toBe(true);
    consoleSpy.mockRestore();
  });
});
