import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import QuotationRequestDetailsCard from
  '@/features/contractor/orderManagement/components/QuotationRequestDetailsCard.vue';
import type { QuotationRequestJson } from '@/features/contractor/orderManagement/services/QuotationRequestService';

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

  it('renders the place of performance as the address', () => {
    const wrapper = mountCard(makeRequest({
      placeOfPerformanceAddress1: 'Parkstraße 6',
      placeOfPerformanceAddress2: '14482 Potsdam',
    }));

    const address = wrapper.get('[data-testid="place-of-performance"]');
    expect(address.text()).toContain(i18n.global.t('orderManagement.quotationRequestDetails.fields.address'));
    expect(address.text()).toContain('Parkstraße 6, 14482 Potsdam');
  });

  it('renders each tenant with name and email link', () => {
    const wrapper = mountCard(makeRequest({
      tenants: [
        {
          id: 't-1', firstName: 'Max', lastName: 'Mieter', email: 'max@example.org',
        },
        {
          id: 't-2', name: 'Erika Muster', email: 'erika@example.org',
        },
      ],
    }));

    const items = wrapper.findAll('[data-testid="tenant-item"]');
    expect(items).toHaveLength(2);
    expect(items[0]!.text()).toContain(i18n.global.t('orderManagement.quotationRequestDetails.fields.tenant'));
    expect(items[0]!.text()).toContain('Max Mieter');
    expect(items[0]!.text()).toContain(i18n.global.t('orderManagement.quotationRequestDetails.fields.email'));
    expect(items[0]!.find('a[href="mailto:max@example.org"]').exists()).toBe(true);
    expect(items[1]!.text()).toContain('Erika Muster');
    expect(items[1]!.find('a[href="mailto:erika@example.org"]').exists()).toBe(true);
  });

  it('omits the email row when a tenant has no email', () => {
    const wrapper = mountCard(makeRequest({
      tenants: [{
        id: 't-1', name: 'Max Mieter', email: '',
      }],
    }));

    const item = wrapper.get('[data-testid="tenant-item"]');
    expect(item.text()).toContain('Max Mieter');
    expect(item.text()).not.toContain(i18n.global.t('orderManagement.quotationRequestDetails.fields.email'));
  });

  it('renders the tenant phone number below the address, preferring the mobile number', () => {
    const wrapper = mountCard(makeRequest({
      placeOfPerformanceAddress1: 'Parkstraße 6',
      tenants: [{
        id: 't-1', name: 'Max Mieter', email: 'max@example.org',
        mobilePhoneNumber: '+491701234', privatePhoneNumber: '+49301111',
      }],
    }));

    const phone = wrapper.get('[data-testid="tenant-phone"]');
    expect(phone.text()).toContain(i18n.global.t('orderManagement.quotationRequestDetails.fields.phone'));
    expect(phone.find('a[href="tel:+491701234"]').exists()).toBe(true);
    expect(phone.text()).not.toContain('Max Mieter');

    const html = wrapper.html();
    expect(html.indexOf('data-testid="place-of-performance"')).toBeLessThan(html.indexOf('data-testid="tenant-phone"'));
  });

  it('labels each phone number with the tenant name when there are several tenants', () => {
    const wrapper = mountCard(makeRequest({
      tenants: [
        {
          id: 't-1', name: 'Max Mieter', email: 'max@example.org', businessPhoneNumber: '+49302222',
        },
        {
          id: 't-2', name: 'Erika Muster', email: 'erika@example.org',
        },
      ],
    }));

    const phones = wrapper.findAll('[data-testid="tenant-phone"]');
    expect(phones).toHaveLength(1);
    expect(phones[0]!.find('a[href="tel:+49302222"]').exists()).toBe(true);
    expect(phones[0]!.text()).toContain('(Max Mieter)');
  });

  it('hides tenants and address when not provided', () => {
    const wrapper = mountCard(makeRequest({ tenants: [] }));

    expect(wrapper.find('[data-testid="place-of-performance"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="tenant-item"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain(i18n.global.t('orderManagement.quotationRequestDetails.fields.tenant'));
  });
});
