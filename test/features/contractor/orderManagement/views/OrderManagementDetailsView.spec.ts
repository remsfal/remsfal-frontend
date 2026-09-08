import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import OrderManagementDetailsView from '@/features/contractor/orderManagement/views/OrderManagementDetailsView.vue';
import QuotationRequestDetailsCard from
  '@/features/contractor/orderManagement/components/QuotationRequestDetailsCard.vue';
import { quotationRequestService, type QuotationRequestJson } from
  '@/features/contractor/orderManagement/services/QuotationRequestService';

const makeRequest = (overrides: Partial<QuotationRequestJson> = {}): QuotationRequestJson => ({
  id: 'qr-1',
  issueId: 'issue-1',
  status: 'REQUESTED',
  scopeOfWork: 'Dachrinne reparieren',
  ...overrides,
});

const mountView = (requestId = 'issue-1') => mount(OrderManagementDetailsView, {
  props: { requestId },
  global: { stubs: { QuotationRequestDetailsCard: true } },
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

  it('shows a not-found message when no item matches the requestId', async () => {
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
