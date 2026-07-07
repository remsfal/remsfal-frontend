import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import { organizationService } from '@/services/OrganizationService';

const mockOrg = {
  id: 'org-1', name: 'Test GmbH', phone: '+4915123456789' 
};
const mockOrg2 = { id: 'org-2', name: 'Second GmbH' };

const mockEmployee = {
  id: 'emp-1',
  organizationId: 'org-1',
  organizationName: 'Test GmbH',
  name: 'Max Mustermann',
  email: 'max@test-gmbh.de',
  active: true,
  employeeRole: 'OWNER' as const,
};

const mockEmployeeStaff = {
  id: 'emp-2',
  organizationId: 'org-3',
  organizationName: 'Partner AG',
  name: 'Erika Muster',
  email: 'erika@partner-ag.de',
  active: false,
  employeeRole: 'STAFF' as const,
};

describe('OrganizationStore', () => {
  let store: ReturnType<typeof useOrganizationStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useOrganizationStore();
  });

  describe('initial state', () => {
    it('has empty userOrganizations array', () => {
      expect(store.userOrganizations).toEqual([]);
    });

    it('has empty userEmployments array', () => {
      expect(store.userEmployments).toEqual([]);
    });

    it('is not initialized', () => {
      expect(store.initialized).toBe(false);
    });

    it('hasOrganization getter returns false', () => {
      expect(store.hasOrganization).toBe(false);
    });
  });

  describe('hasOrganization getter', () => {
    it('returns true when userOrganizations has entries', () => {
      store.userOrganizations = [mockOrg];
      expect(store.hasOrganization).toBe(true);
    });

    it('returns false for empty array', () => {
      store.userOrganizations = [];
      expect(store.hasOrganization).toBe(false);
    });

    it('returns false even when userEmployments has entries', () => {
      store.userEmployments = [mockEmployee];
      expect(store.hasOrganization).toBe(false);
    });
  });

  describe('fetchUserOrganization', () => {
    it('calls both getOrganizations and getEmployments', async () => {
      const ownedSpy = vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({
        organizations: [mockOrg],
        total: 1,
      });
      const employedSpy = vi.spyOn(organizationService, 'getEmployments').mockResolvedValue({employees: [mockEmployee],});

      await store.fetchUserOrganization();

      expect(ownedSpy).toHaveBeenCalledOnce();
      expect(employedSpy).toHaveBeenCalledOnce();
    });

    it('stores owned organizations in userOrganizations', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({
        organizations: [mockOrg, mockOrg2],
        total: 2,
      });
      vi.spyOn(organizationService, 'getEmployments').mockResolvedValue({ employees: [] });

      await store.fetchUserOrganization();

      expect(store.userOrganizations).toEqual([mockOrg, mockOrg2]);
    });

    it('stores employments in userEmployments', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({ organizations: [] });
      vi.spyOn(organizationService, 'getEmployments').mockResolvedValue({employees: [mockEmployee, mockEmployeeStaff],});

      await store.fetchUserOrganization();

      expect(store.userEmployments).toEqual([mockEmployee, mockEmployeeStaff]);
    });

    it('populates both states independently', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({
        organizations: [mockOrg],
        total: 1,
      });
      vi.spyOn(organizationService, 'getEmployments').mockResolvedValue({employees: [mockEmployee, mockEmployeeStaff],});

      await store.fetchUserOrganization();

      expect(store.userOrganizations).toHaveLength(1);
      expect(store.userEmployments).toHaveLength(2);
    });

    it('sets initialized to true after successful fetch', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({ organizations: [] });
      vi.spyOn(organizationService, 'getEmployments').mockResolvedValue({ employees: [] });

      await store.fetchUserOrganization();

      expect(store.initialized).toBe(true);
    });

    it('sets empty arrays and marks initialized on error', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockRejectedValue(
        new Error('Network error'),
      );

      await store.fetchUserOrganization();

      expect(store.userOrganizations).toEqual([]);
      expect(store.userEmployments).toEqual([]);
      expect(store.initialized).toBe(true);
    });

    it('does not mix employment records into userOrganizations when owned list is empty', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({
        organizations: [],
        total: 0,
      });
      vi.spyOn(organizationService, 'getEmployments').mockResolvedValue({employees: [mockEmployee],});

      await store.fetchUserOrganization();

      expect(store.userOrganizations).toEqual([]);
      expect(store.userEmployments).toEqual([mockEmployee]);
    });
  });

  describe('setOrganization', () => {
    it('adds a new organization to userOrganizations', () => {
      store.setOrganization(mockOrg);

      expect(store.userOrganizations).toContainEqual(mockOrg);
      expect(store.initialized).toBe(true);
    });

    it('updates an existing organization matched by id', () => {
      store.userOrganizations = [mockOrg];
      const updated = { ...mockOrg, name: 'Umbenannte GmbH' };

      store.setOrganization(updated);

      expect(store.userOrganizations).toHaveLength(1);
      expect(store.userOrganizations[0]!.name).toBe('Umbenannte GmbH');
    });

    it('appends when id does not match any existing org', () => {
      store.userOrganizations = [mockOrg];

      store.setOrganization(mockOrg2);

      expect(store.userOrganizations).toHaveLength(2);
    });

    it('does nothing when org has no id', () => {
      store.setOrganization({ name: 'Ohne ID' });

      expect(store.userOrganizations).toHaveLength(0);
    });

    it('sets initialized to true', () => {
      store.setOrganization(mockOrg);

      expect(store.initialized).toBe(true);
    });

    it('does not affect userEmployments', () => {
      store.userEmployments = [mockEmployee];
      store.setOrganization(mockOrg);

      expect(store.userEmployments).toHaveLength(1);
    });
  });
});
