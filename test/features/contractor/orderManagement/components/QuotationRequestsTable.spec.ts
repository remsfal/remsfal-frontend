import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DataTable from 'primevue/datatable';
import QuotationRequestsTable from '@/features/contractor/orderManagement/components/QuotationRequestsTable.vue';
import type { QuotationRequestJson } from '@/services/QuotationRequestService';

const mockRequests: QuotationRequestJson[] = [
  {
    id: 'qr-1', scopeOfWork: 'Dachrinne reparieren', status: 'REQUESTED', createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'qr-2', scopeOfWork: 'Fenster erneuern', status: 'REQUESTED', createdAt: '2026-01-16T10:00:00Z'
  },
];

describe('QuotationRequestsTable', () => {
  it('renders one row per request', () => {
    const wrapper = mount(QuotationRequestsTable, { props: { requests: mockRequests } });

    expect(wrapper.text()).toContain('Dachrinne reparieren');
    expect(wrapper.text()).toContain('Fenster erneuern');
  });

  it('shows the empty message when there are no requests', () => {
    const wrapper = mount(QuotationRequestsTable, { props: { requests: [] } });

    expect(wrapper.text()).toContain('Keine Anfragen zur Erstellung eines Angebots vorhanden');
  });

  it('emits rowSelect with the selected request when a row is clicked', async () => {
    const wrapper = mount(QuotationRequestsTable, { props: { requests: mockRequests } });

    wrapper.getComponent(DataTable).vm.$emit('rowSelect', { data: mockRequests[1] });

    expect(wrapper.emitted('rowSelect')).toEqual([[mockRequests[1]]]);
  });
});
