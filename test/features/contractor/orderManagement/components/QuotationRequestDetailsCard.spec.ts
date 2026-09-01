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
  it('renders the request fields as plain text', () => {
    const wrapper = mountCard(makeRequest());

    expect(wrapper.text()).toContain('qr-1');
    expect(wrapper.text()).toContain('Alpha Bau GmbH');
    expect(wrapper.text()).toContain('Max Mustermann');
    expect(wrapper.text()).toContain('Dachrinne reparieren');
    expect(wrapper.text()).toContain('Erika Verwalter');
  });

  it('renders the id small, under the title, separated by a divider', () => {
    const wrapper = mountCard(makeRequest());

    const titleBlock = wrapper.get('.p-card-title');
    const divider = titleBlock.get('.border-b');
    expect(titleBlock.text()).toContain(i18n.global.t('orderManagement.quotationRequestDetails.title'));
    const idLine = divider.find('p');
    expect(idLine.text()).toContain('qr-1');

    const contentText = wrapper.get('.p-card-content').text();
    expect(contentText).not.toContain('qr-1');
  });
});
