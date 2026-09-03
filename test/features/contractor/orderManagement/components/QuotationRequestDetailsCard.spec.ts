import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import QuotationRequestDetailsCard from
  '@/features/contractor/orderManagement/components/QuotationRequestDetailsCard.vue';
import type { QuotationRequestJson } from '@/services/QuotationRequestService';

const makeRequest = (overrides: Partial<QuotationRequestJson> = {}): QuotationRequestJson => ({
  id: 'quotation-req-77',
  issueId: 'PROJECT-1-issue-42',
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

    expect(wrapper.text()).toContain('Alpha Bau GmbH');
    expect(wrapper.text()).toContain('Max Mustermann');
    expect(wrapper.text()).toContain('Dachrinne reparieren');
    expect(wrapper.text()).toContain('Erika Verwalter');
  });

  it('renders the ticket number in the title, and care-of/billing address top-right without labels', () => {
    const wrapper = mountCard(makeRequest());

    const titleBlock = wrapper.get('.p-card-title');
    const divider = titleBlock.get('.border-b');
    expect(titleBlock.text()).toContain(i18n.global.t('orderManagement.quotationRequestDetails.title'));
    expect(divider.text()).toContain(
      `${i18n.global.t('orderManagement.quotationRequestDetails.fields.ticketNumber')} PROJECT-1-issue-42`,
    );

    const letterheadLines = divider.findAll('.text-right');
    expect(letterheadLines).toHaveLength(2);
    expect(letterheadLines[0]!.text()).toBe('Hausverwaltung Musterstadt');
    expect(letterheadLines[1]!.text()).toBe('Musterstraße 1, 12345 Musterstadt');
    expect(divider.text()).not.toContain('c/o');
    expect(divider.text()).not.toContain('Rechnungsadresse');

    const contentText = wrapper.get('.p-card-content').text();
    expect(contentText).toContain(i18n.global.t('orderManagement.quotationRequestDetails.fields.requestNumber'));
    expect(contentText).toContain('77');
    expect(contentText).not.toContain('Hausverwaltung Musterstadt');
    expect(contentText).not.toContain('Musterstraße 1');
  });

  it('falls back to em dash when issueId is empty', () => {
    const wrapper = mountCard(makeRequest({ issueId: undefined }));

    expect(wrapper.text()).toContain(
      `${i18n.global.t('orderManagement.quotationRequestDetails.fields.ticketNumber')} —`,
    );
  });
});
