import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import IssueOrderManagementCard from '@/features/project/issues/components/IssueOrderManagementCard.vue';
import { setupResizeObserverMock } from '../../../../setup/issueTestHelpers';

// PrimeVue TabList relies on ResizeObserver, which JSDOM does not implement.
setupResizeObserverMock();

describe('IssueOrderManagementCard', () => {
  const mountCard = () =>
    mount(IssueOrderManagementCard, {
      props: { projectId: 'proj-1', issueId: 'issue-1' },
      global: {
        stubs: {
          QuotationRequestTable: { template: '<div data-test="qr-table" />' },
          QuoteTable: { template: '<div data-test="quote-table" />' },
          OrderTable: { template: '<div data-test="order-table" />' },
        },
      },
    });

  it('renders card title "Auftragsmanagement"', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Auftragsmanagement');
  });

  it('renders all 3 tab labels', () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain('Angebotsanfragen');
    expect(wrapper.text()).toContain('Angebote');
    expect(wrapper.text()).toContain('Aufträge');
  });

  it('renders the quotation requests table by default', () => {
    const wrapper = mountCard();
    expect(wrapper.find('[data-test="qr-table"]').exists()).toBe(true);
  });

  it('switches to the quotations tab on click', async () => {
    const wrapper = mountCard();
    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[1]!.trigger('click');

    const quotePanel = wrapper.find('[data-test="quote-table"]').element.closest('[role="tabpanel"]');
    expect(quotePanel?.getAttribute('data-p-active')).toBe('true');

    const requestPanel = wrapper.find('[data-test="qr-table"]').element.closest('[role="tabpanel"]');
    expect(requestPanel?.getAttribute('data-p-active')).toBe('false');
  });
});
