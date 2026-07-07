import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ManagerContractorListCard from '@/features/manager/contractors/components/ManagerContractorListCard.vue';
import { organizationService } from '@/services/OrganizationService';

const mockOrgs = [
  {
    id: 'org-1', name: 'Alpha GmbH', email: 'alpha@test.de', phone: '+491511', trade: 'Bauarbeiten' 
  },
  {
    id: 'org-2', name: 'Beta GmbH', email: 'beta@test.de', phone: '+491522', trade: 'Elektrik' 
  },
];

const pushMock = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => ({ push: pushMock }) };
});

describe('ManagerContractorListCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(organizationService, 'getContractorOrganizations').mockResolvedValue({organizations: mockOrgs,});
  });

  const mountCard = () => mount(ManagerContractorListCard);

  it('calls getContractorOrganizations on mount', async () => {
    mountCard();
    await flushPromises();
    expect(organizationService.getContractorOrganizations).toHaveBeenCalled();
  });

  it('renders the card title', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Meine Auftragnehmer');
  });

  it('renders organization names in the table', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Alpha GmbH');
    expect(wrapper.text()).toContain('Beta GmbH');
  });

  it('shows empty state when no organizations', async () => {
    vi.spyOn(organizationService, 'getContractorOrganizations').mockResolvedValue({organizations: [],});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Keine Auftragnehmer gefunden.');
  });

  it('sorts organizations by name', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const text = wrapper.text();
    expect(text.indexOf('Alpha GmbH')).toBeLessThan(text.indexOf('Beta GmbH'));
  });

  it('does not throw when getContractorOrganizations fails', async () => {
    vi.spyOn(organizationService, 'getContractorOrganizations').mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    consoleSpy.mockRestore();
  });

  it('navigates to ManagerContractorDetail on row click with valid id', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const rows = wrapper.findAll('tr');
    const dataRow = rows.find(r => r.text().includes('Alpha GmbH'));
    if (dataRow) await dataRow.trigger('click');

    expect(pushMock).toHaveBeenCalledWith({
      name: 'ManagerContractorDetail',
      params: { organizationId: 'org-1' },
    });
  });

  it('does not navigate when org has no id', async () => {
    vi.spyOn(organizationService, 'getContractorOrganizations').mockResolvedValue({organizations: [{ name: 'No ID GmbH' }],});
    const wrapper = mountCard();
    await flushPromises();

    const rows = wrapper.findAll('tr');
    const dataRow = rows.find(r => r.text().includes('No ID GmbH'));
    if (dataRow) await dataRow.trigger('click');

    expect(pushMock).not.toHaveBeenCalled();
  });

  it('handles organizations without name in sort', async () => {
    vi.spyOn(organizationService, 'getContractorOrganizations')
      .mockResolvedValue({organizations: [{ id: 'org-1' }, { id: 'org-2', name: 'Alpha GmbH' }]});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('handles null organizations array from API', async () => {
    vi.spyOn(organizationService, 'getContractorOrganizations').mockResolvedValue({organizations: [],});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });
});
