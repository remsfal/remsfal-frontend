import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ContractorClientListCard from '@/features/contractor/customers/components/ContractorClientListCard.vue';
import { clientService, type ClientProjectJson } from '@/features/contractor/customers/services/ClientService';

const mockProjects: ClientProjectJson[] = [
  {
    id: 'project-1',
    title: 'Wohnanlage Musterstraße',
    owner: 'WEG Musterstraße',
    careOf: 'Hausverwaltung Süd GmbH',
    billingAddress: {
      street: 'Musterstraße 1', zip: '10115', city: 'Berlin', province: 'Berlin', countryCode: 'DE',
    },
  },
  {
    id: 'project-2',
    title: 'Gewerbehof Nord',
  },
];

describe('ContractorClientListCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(clientService, 'getClients').mockResolvedValue({ projects: mockProjects });
  });

  const mountCard = () =>
    mount(ContractorClientListCard, { props: { organizationId: 'org-1' } });

  it('loads the clients of the given organization on mount', async () => {
    mountCard();
    await flushPromises();
    expect(clientService.getClients).toHaveBeenCalledWith('org-1');
  });

  it('renders the card title and billing columns', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const headers = wrapper.findAll('thead th').map((th) => th.text());
    expect(wrapper.text()).toContain('Übersicht aller Auftraggeber');
    expect(headers).toEqual(['Liegenschaft', 'Besitzer', 'Vertreten durch ("c/o")', 'Rechnungsadresse']);
  });

  it('renders the billing data of each project', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const cells = wrapper.findAll('tbody tr')[0].findAll('td').map((td) => td.text());
    expect(cells).toEqual([
      'Wohnanlage Musterstraße',
      'WEG Musterstraße',
      'Hausverwaltung Süd GmbH',
      'Musterstraße 1, 10115 Berlin, Deutschland',
    ]);
  });

  it('renders empty cells for projects without billing data', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const cells = wrapper.findAll('tbody tr')[1].findAll('td').map((td) => td.text());
    expect(cells).toEqual(['Gewerbehof Nord', '', '', '']);
  });

  it('shows empty state when no projects', async () => {
    vi.spyOn(clientService, 'getClients').mockResolvedValue({ projects: [] });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Keine Auftraggeber gefunden.');
  });

  it('shows empty state when the request fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(clientService, 'getClients').mockRejectedValue(new Error('network'));
    const wrapper = mountCard();
    await flushPromises();
    expect(consoleSpy).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Keine Auftraggeber gefunden.');
  });

  it('renders rows without hover highlighting since they are not clickable', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.find('.p-datatable-hoverable').exists()).toBe(false);
  });
});
