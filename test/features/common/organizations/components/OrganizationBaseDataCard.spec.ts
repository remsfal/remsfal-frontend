import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import OrganizationBaseDataCard from '@/features/common/organizations/components/OrganizationBaseDataCard.vue';
import { organizationService } from '@/services/OrganizationService';
import { setActivePinia, createPinia } from 'pinia';

const mockOrg = {
  id: 'org-123',
  name: 'Test GmbH',
  phone: '+4915123456789',
  email: 'info@test-gmbh.de',
  trade: 'Hausverwaltung',
};

describe('OrganizationBaseDataCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(organizationService, 'getOrganization').mockResolvedValue(mockOrg);
  });

  const mountCard = () =>
    mount(OrganizationBaseDataCard, {
      props: { organizationId: 'org-123' },
      global: {stubs: { PhoneInput: true },},
    });

  it('calls getOrganization with the provided id on mount', async () => {
    mountCard();
    await flushPromises();

    expect(organizationService.getOrganization).toHaveBeenCalledWith('org-123');
  });

  it('renders the settings title', async () => {
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).toContain('Organisationseinstellungen');
  });

  it('renders the name field label', async () => {
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).toContain('Name');
  });

  it('renders the trade field label', async () => {
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).toContain('Gewerbe / Branche');
  });

  it('renders the phone and email field labels', async () => {
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).toContain('Telefon');
    expect(wrapper.text()).toContain('E-Mail-Adresse');
  });

  it('renders PhoneInput stub for phone field', async () => {
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'PhoneInput' }).exists()).toBe(true);
  });

  it('save button is disabled initially (not dirty)', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('does not throw when getOrganization rejects', async () => {
    vi.spyOn(organizationService, 'getOrganization').mockRejectedValue(
      new Error('Not found'),
    );

    const wrapper = mountCard();
    await expect(flushPromises()).resolves.not.toThrow();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows phone validation error for invalid E.164 number', async () => {
    const wrapper = mountCard();
    await flushPromises();

    // Simulate PhoneInput emitting an invalid value
    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', 'not-a-phone');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Telefonformat');
  });

  it('does not show phone error when value is empty', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', '');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain('Telefonformat');
  });

  it('renders required fields indicator', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Plichtfelder');
  });
});
