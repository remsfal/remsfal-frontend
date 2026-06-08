import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UserOrganizationMembershipCard from '@/features/common/organizations/components/UserOrganizationMembershipCard.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';

const mockOwner = {
  id: 'emp-1',
  organizationId: 'org-123',
  organizationName: 'Test GmbH',
  name: 'Max Mustermann',
  email: 'max@test-gmbh.de',
  active: true,
  employeeRole: 'OWNER' as const,
};

const mockStaff = {
  id: 'emp-2',
  organizationId: 'org-456',
  organizationName: 'Partner AG',
  name: 'Erika Muster',
  email: 'erika@partner-ag.de',
  active: false,
  employeeRole: 'STAFF' as const,
};

const mockManager = {
  id: 'emp-3',
  organizationId: 'org-789',
  organizationName: 'Service KG',
  name: 'Hans Beispiel',
  email: 'hans@service-kg.de',
  active: true,
  employeeRole: 'MANAGER' as const,
};

describe('UserOrganizationMembershipCard', () => {
  let orgStore: ReturnType<typeof useOrganizationStore>;

  beforeEach(() => {
    // Use the global testing Pinia — do NOT call setActivePinia(createPinia())
    orgStore = useOrganizationStore();
    orgStore.userEmployments = [];
    orgStore.userOrganizations = [];
    orgStore.initialized = true;
    vi.clearAllMocks();
  });

  const mountCard = () => mount(UserOrganizationMembershipCard);

  describe('static rendering', () => {
    it('renders the card title', async () => {
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Meine Organisationszugehörigkeit');
    });

    it('renders the organization column header', async () => {
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Organisation');
    });

    it('renders the role column header', async () => {
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Rolle');
    });

    it('renders the status column header', async () => {
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Status');
    });
  });

  describe('empty state', () => {
    it('shows empty message when there are no memberships', async () => {
      orgStore.userEmployments = [];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Keine Organisationszugehörigkeiten vorhanden.');
    });

    it('passes empty array to DataTable', async () => {
      orgStore.userEmployments = [];
      const wrapper = mountCard();
      await flushPromises();
      const table = wrapper.findComponent({ name: 'DataTable' });
      expect(table.props('value')).toEqual([]);
    });
  });

  describe('membership data display', () => {
    it('passes membership data to DataTable', async () => {
      orgStore.userEmployments = [mockOwner, mockStaff];
      const wrapper = mountCard();
      await flushPromises();
      const table = wrapper.findComponent({ name: 'DataTable' });
      expect(table.props('value')).toHaveLength(2);
      expect(table.props('value')).toEqual([mockOwner, mockStaff]);
    });

    it('renders organization names', async () => {
      orgStore.userEmployments = [mockOwner, mockStaff];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Test GmbH');
      expect(wrapper.text()).toContain('Partner AG');
    });

    it('updates DataTable data when store state changes after mount', async () => {
      orgStore.userEmployments = [];
      const wrapper = mountCard();
      await flushPromises();

      orgStore.userEmployments = [mockOwner];
      await wrapper.vm.$nextTick();

      const table = wrapper.findComponent({ name: 'DataTable' });
      expect(table.props('value')).toEqual([mockOwner]);
    });
  });

  describe('role translations', () => {
    it('translates OWNER to "Eigentümer"', async () => {
      orgStore.userEmployments = [mockOwner];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Eigentümer');
    });

    it('translates STAFF to "Mitarbeiter"', async () => {
      orgStore.userEmployments = [mockStaff];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Mitarbeiter');
    });

    it('translates MANAGER to "Manager"', async () => {
      orgStore.userEmployments = [mockManager];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Manager');
    });

    it('renders all three roles when multiple memberships exist', async () => {
      orgStore.userEmployments = [mockOwner, mockStaff, mockManager];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Eigentümer');
      expect(wrapper.text()).toContain('Mitarbeiter');
      expect(wrapper.text()).toContain('Manager');
    });
  });

  describe('status display', () => {
    it('shows "Aktiv" for active membership', async () => {
      orgStore.userEmployments = [mockOwner];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Aktiv');
    });

    it('shows "Inaktiv" for inactive membership', async () => {
      orgStore.userEmployments = [mockStaff];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Inaktiv');
    });

    it('shows both statuses when mixed', async () => {
      orgStore.userEmployments = [mockOwner, mockStaff];
      const wrapper = mountCard();
      await flushPromises();
      expect(wrapper.text()).toContain('Aktiv');
      expect(wrapper.text()).toContain('Inaktiv');
    });
  });

  describe('initialization guard', () => {
    it('calls fetchUserOrganization when store is not initialized', async () => {
      orgStore.initialized = false;
      mountCard();
      await flushPromises();
      expect(orgStore.fetchUserOrganization).toHaveBeenCalledOnce();
    });

    it('does not call fetchUserOrganization when store is already initialized', async () => {
      orgStore.initialized = true;
      mountCard();
      await flushPromises();
      expect(orgStore.fetchUserOrganization).not.toHaveBeenCalled();
    });
  });
});
