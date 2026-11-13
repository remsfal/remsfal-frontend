import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Message from 'primevue/message';
import OrganizationDashboardCards from '@/features/common/organizations/components/OrganizationDashboardCards.vue';
import BaseCard from '@/components/BaseCard.vue';
import { useOrganizationStore } from '@/features/common/organizations/stores/OrganizationStore';
import type { OrganizationJson, OrganizationEmployeeJson } from '@/features/common/organizations/services/OrganizationService';

const org1: OrganizationJson = {
  id: 'org-1',
  name: 'Musterfirma GmbH',
  email: 'info@musterfirma.de',
  phone: '+4915123456789',
  address: {
    street: 'Musterstraße 1',
    zip: '10115',
    city: 'Berlin',
    province: 'Berlin',
    countryCode: 'DE',
  },
};

const org2: OrganizationJson = {
  id: 'org-2',
  name: 'Zweitfirma GmbH',
};

const ownerEmployment: OrganizationEmployeeJson = {
  id: 'emp-1',
  organizationId: 'org-1',
  organizationName: 'Musterfirma GmbH',
  name: 'Max Mustermann',
  email: 'max@musterfirma.de',
  active: true,
  employeeRole: 'OWNER',
};

const staffEmployment: OrganizationEmployeeJson = {
  id: 'emp-2',
  organizationId: 'org-3',
  organizationName: 'Drittfirma GmbH',
  name: 'Erika Musterfrau',
  email: 'erika@drittfirma.de',
  active: true,
  employeeRole: 'STAFF',
};

describe('OrganizationDashboardCards', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    useOrganizationStore().$reset();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders one card per owned organization with name, address, email and phone', async () => {
    const store = useOrganizationStore();
    store.userOrganizations = [org1, org2];
    store.userEmployments = [ownerEmployment];
    store.initialized = true;

    wrapper = mount(OrganizationDashboardCards);
    await flushPromises();

    const cards = wrapper.findAllComponents(BaseCard).filter((c) => !c.props('loading'));
    expect(cards).toHaveLength(2);
    expect(wrapper.text()).toContain('Musterfirma GmbH');
    expect(wrapper.text()).toContain('Musterstraße 1, 10115 Berlin');
    expect(wrapper.text()).toContain('info@musterfirma.de');
    expect(wrapper.text()).toContain('+4915123456789');
    expect(wrapper.text()).toContain('Zweitfirma GmbH');
    expect(wrapper.findComponent(Message).exists()).toBe(false);

    const titleLinks = wrapper.findAll('a[href^="/contractor/organizations/"]');
    expect(titleLinks.map((l) => l.attributes('href'))).toEqual(
      expect.arrayContaining(['/contractor/organizations/org-1', '/contractor/organizations/org-2']),
    );
  });

  it('shows neither a card nor the empty-state message for a user who is only an employee', async () => {
    const store = useOrganizationStore();
    store.userOrganizations = [];
    store.userEmployments = [staffEmployment];
    store.initialized = true;

    wrapper = mount(OrganizationDashboardCards);
    await flushPromises();

    expect(wrapper.findAllComponents(BaseCard).filter((c) => !c.props('loading'))).toHaveLength(0);
    expect(wrapper.findComponent(Message).exists()).toBe(false);
  });

  it('does not show the empty-state message for an owner without employment records', async () => {
    const store = useOrganizationStore();
    store.userOrganizations = [org1];
    store.initialized = true;

    wrapper = mount(OrganizationDashboardCards);
    await flushPromises();

    expect(wrapper.findComponent(Message).exists()).toBe(false);
    expect(wrapper.text()).toContain(org1.name);
  });

  const NewOrganizationDialogStub = {
    name: 'NewOrganizationDialog',
    props: ['visible'],
    emits: ['update:visible'],
    template: '<div class="new-organization-dialog-stub" />',
  };

  const mountWithoutOrganization = async () => {
    const store = useOrganizationStore();
    store.userOrganizations = [];
    store.userEmployments = [];
    store.initialized = true;

    wrapper = mount(OrganizationDashboardCards, { global: { stubs: { NewOrganizationDialog: NewOrganizationDialogStub } } });
    await flushPromises();
  };

  it('shows the empty-state message with a create action when the user belongs to no organization', async () => {
    await mountWithoutOrganization();

    const message = wrapper.findComponent(Message);
    expect(message.exists()).toBe(true);
    expect(message.props('severity')).toBe('warn');
    expect(message.find('button[type="button"]').text()).toBe('Organisation anlegen');
  });

  it('opens and closes the new organization dialog from the empty-state message', async () => {
    await mountWithoutOrganization();

    const dialog = wrapper.findComponent(NewOrganizationDialogStub);
    expect(dialog.props('visible')).toBe(false);

    await wrapper.findComponent(Message).find('button[type="button"]').trigger('click');
    expect(dialog.props('visible')).toBe(true);

    dialog.vm.$emit('update:visible', false);
    await flushPromises();
    expect(dialog.props('visible')).toBe(false);
  });

  it('shows a loading placeholder and no message before the store finishes fetching', () => {
    const store = useOrganizationStore();
    store.initialized = false;

    wrapper = mount(OrganizationDashboardCards);

    expect(wrapper.findComponent(Message).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'CardSkeletonRows' }).exists()).toBe(true);
  });
});
