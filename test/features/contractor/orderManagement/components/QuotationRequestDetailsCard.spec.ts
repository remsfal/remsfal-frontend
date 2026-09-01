import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import QuotationRequestDetailsCard from
  '@/features/contractor/orderManagement/components/QuotationRequestDetailsCard.vue';
import type { QuotationRequestJson } from '@/services/QuotationRequestService';

const makeRequest = (overrides: Partial<QuotationRequestJson> = {}): QuotationRequestJson => ({
  id: 'qr-1',
  status: 'REQUESTED',
  scopeOfWork: 'Dachrinne reparieren',
  projectOwner: 'Max Mustermann',
  projectCareOf: 'Hausverwaltung Musterstadt',
  projectBillingAddress1: 'Musterstraße 1',
  projectBillingAddress2: '12345 Musterstadt',
  contractorName: 'Alpha Bau GmbH',
  initiatedBy: 'Erika Verwalter',
  createdAt: '2026-01-15T10:00:00Z',
  modifiedAt: '2026-01-16T11:00:00Z',
  ...overrides,
});

const mountCard = (request: QuotationRequestJson) => mount(QuotationRequestDetailsCard, { props: { request } });

describe('QuotationRequestDetailsCard component', () => {
  it('renders the request fields', () => {
    const wrapper = mountCard(makeRequest());

    expect(wrapper.get('#quotation-request-id').element as HTMLInputElement).toHaveProperty('value', 'qr-1');
    expect(wrapper.get('#quotation-request-contractor-name').element as HTMLInputElement)
      .toHaveProperty('value', 'Alpha Bau GmbH');
    expect(wrapper.get('#quotation-request-project-owner').element as HTMLInputElement)
      .toHaveProperty('value', 'Max Mustermann');
    expect(wrapper.get('#quotation-request-scope-of-work').element as HTMLTextAreaElement)
      .toHaveProperty('value', 'Dachrinne reparieren');
    expect(wrapper.get('#quotation-request-initiated-by').element as HTMLInputElement)
      .toHaveProperty('value', 'Erika Verwalter');
  });

  it('joins the billing address lines', () => {
    const wrapper = mountCard(makeRequest());

    expect((wrapper.get('#quotation-request-billing-address').element as HTMLInputElement).value)
      .toBe('Musterstraße 1, 12345 Musterstadt');
  });

  it('renders the translated status tag', () => {
    const wrapper = mountCard(makeRequest({ status: 'SUBMITTED' }));

    expect(wrapper.text()).toContain(i18n.global.t('quotationRequest.status.SUBMITTED'));
  });

  it('renders every field as disabled, with no save action', () => {
    const wrapper = mountCard(makeRequest());

    wrapper.findAll('input, textarea').forEach((input) => {
      expect(input.attributes('disabled')).toBeDefined();
    });
    expect(wrapper.find('button').exists()).toBe(false);
  });
});
