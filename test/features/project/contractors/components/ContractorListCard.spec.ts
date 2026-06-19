import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ContractorListCard from '@/features/project/contractors/components/ContractorListCard.vue';
import { projectContractorService } from '@/services/ProjectContractorService';

const mockContractors = [
  { id: 'c-1', companyName: 'Alpha Bau GmbH', email: 'alpha@bau.de', phone: '+491511', trade: 'Bauarbeiten', contactPerson: 'Alice' },
  { id: 'c-2', companyName: 'Beta Elektro GmbH', email: 'beta@elektro.de', phone: '+491522', trade: 'Elektrik', contactPerson: 'Bob' },
];

const pushMock = vi.fn();
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => ({ push: pushMock }) };
});

describe('ContractorListCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(projectContractorService, 'getContractors').mockResolvedValue({
      contractors: mockContractors,
    });
  });

  const mountCard = (projectId = 'proj-1') =>
    mount(ContractorListCard, {
      props: { projectId },
      global: { stubs: { NewContractorButton: true } },
    });

  it('calls getContractors with projectId on mount', async () => {
    mountCard();
    await flushPromises();
    expect(projectContractorService.getContractors).toHaveBeenCalledWith('proj-1');
  });

  it('renders the card title', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Auftragnehmer');
  });

  it('renders contractor names in the table', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Alpha Bau GmbH');
    expect(wrapper.text()).toContain('Beta Elektro GmbH');
  });

  it('renders NewContractorButton stub', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'NewContractorButton' }).exists()).toBe(true);
  });

  it('shows empty state when no contractors', async () => {
    vi.spyOn(projectContractorService, 'getContractors').mockResolvedValue({
      contractors: [],
    });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Keine Auftragnehmer vorhanden.');
  });

  it('sorts contractors by companyName', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const text = wrapper.text();
    expect(text.indexOf('Alpha Bau GmbH')).toBeLessThan(text.indexOf('Beta Elektro GmbH'));
  });

  it('handles null contractors list from API', async () => {
    vi.spyOn(projectContractorService, 'getContractors').mockResolvedValue({
      contractors: undefined,
    });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('does not throw when getContractors fails', async () => {
    vi.spyOn(projectContractorService, 'getContractors').mockRejectedValue(new Error('Network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    consoleSpy.mockRestore();
  });

  it('navigates to ProjectContractorDetail on row click', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const rows = wrapper.findAll('tr');
    const dataRow = rows.find(r => r.text().includes('Alpha Bau GmbH'));
    if (dataRow) await dataRow.trigger('click');

    expect(pushMock).toHaveBeenCalledWith({
      name: 'ProjectContractorDetail',
      params: { projectId: 'proj-1', contractorId: 'c-1' },
    });
  });

  it('does not navigate when contractor has no id', async () => {
    vi.spyOn(projectContractorService, 'getContractors').mockResolvedValue({
      contractors: [{ companyName: 'No ID GmbH' }],
    });
    const wrapper = mountCard();
    await flushPromises();

    const rows = wrapper.findAll('tr');
    const dataRow = rows.find(r => r.text().includes('No ID GmbH'));
    if (dataRow) await dataRow.trigger('click');

    expect(pushMock).not.toHaveBeenCalled();
  });

  it('handles contractors without companyName in sort', async () => {
    vi.spyOn(projectContractorService, 'getContractors').mockResolvedValue({
      contractors: [{ id: 'c-1' }, { id: 'c-2', companyName: 'Alpha Bau' }],
    });
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('re-fetches contractors when NewContractorButton emits newContractor', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const spy = vi.spyOn(projectContractorService, 'getContractors').mockResolvedValue({ contractors: [] });
    const btn = wrapper.findComponent({ name: 'NewContractorButton' });
    await btn.vm.$emit('newContractor', 'New Bau GmbH');
    await flushPromises();

    expect(spy).toHaveBeenCalled();
  });
});
