import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ManagerContractorInfoCard from '@/features/manager/contractors/components/ManagerContractorInfoCard.vue';
import { organizationService } from '@/services/OrganizationService';

const mockOrgFull = {
  id: 'org-123',
  name: 'Test GmbH',
  email: 'info@test-gmbh.de',
  phone: '+4930123456',
  trade: 'Bauarbeiten',
  vatIdentificationNumber: 'DE123456789',
  address: {
    street: 'Musterstraße 1',
    zip: '10115',
    city: 'Berlin',
    province: 'Berlin',
    countryCode: 'DE',
  },
};

const mockOrgMinimal = {
  id: 'org-456',
  name: 'Minimal GmbH',
};

describe('ManagerContractorInfoCard', () => {
  beforeEach(() => {
    vi.spyOn(organizationService, 'getOrganization').mockResolvedValue(mockOrgFull);
  });

  const mountCard = (organizationId = 'org-123') =>
    mount(ManagerContractorInfoCard, { props: { organizationId } });

  it('calls getOrganization with provided id on mount', async () => {
    mountCard();
    await flushPromises();
    expect(organizationService.getOrganization).toHaveBeenCalledWith('org-123');
  });

  it('renders the card title', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Unternehmen');
  });

  it('renders company name', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Test GmbH');
  });

  it('renders email when present', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('info@test-gmbh.de');
  });

  it('renders phone when present', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('+4930123456');
  });

  it('renders trade when present', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Bauarbeiten');
  });

  it('renders VAT ID when present', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('DE123456789');
  });

  it('renders address section when address is present', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Adresse');
    expect(wrapper.text()).toContain('Musterstraße 1');
    expect(wrapper.text()).toContain('Berlin');
  });

  it('does not render address section when address is absent', async () => {
    vi.spyOn(organizationService, 'getOrganization').mockResolvedValue(mockOrgMinimal);
    const wrapper = mountCard('org-456');
    await flushPromises();
    expect(wrapper.text()).not.toContain('Adresse');
  });

  it('does not render optional fields when absent', async () => {
    vi.spyOn(organizationService, 'getOrganization').mockResolvedValue(mockOrgMinimal);
    const wrapper = mountCard('org-456');
    await flushPromises();
    expect(wrapper.text()).not.toContain('USt-IdNr.');
  });

  it('does not render org content when getOrganization fails', async () => {
    vi.spyOn(organizationService, 'getOrganization').mockRejectedValue(new Error('Not found'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).not.toContain('Test GmbH');
    consoleSpy.mockRestore();
  });

  it('renders zip and city combined', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('10115');
    expect(wrapper.text()).toContain('Berlin');
  });
});
