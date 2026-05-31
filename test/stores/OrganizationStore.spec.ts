import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import { organizationService } from '@/services/OrganizationService';

const mockOrg = {
 id: 'org-1', name: 'Test GmbH', phone: '+4915123456789' 
};
const mockOrg2 = { id: 'org-2', name: 'Second GmbH' };

describe('OrganizationStore', () => {
  let store: ReturnType<typeof useOrganizationStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useOrganizationStore();
  });

  describe('initial state', () => {
    it('has empty organizations array', () => {
      expect(store.userOrganizations).toEqual([]);
    });

    it('is not initialized', () => {
      expect(store.initialized).toBe(false);
    });

    it('hasOrganization is false', () => {
      expect(store.hasOrganization).toBe(false);
    });
  });

  describe('hasOrganization getter', () => {
    it('returns true when organizations array has entries', () => {
      store.userOrganizations = [mockOrg];
      expect(store.hasOrganization).toBe(true);
    });

    it('returns false for empty array', () => {
      store.userOrganizations = [];
      expect(store.hasOrganization).toBe(false);
    });
  });

  describe('fetchUserOrganization', () => {
    it('stores owned organizations and skips employments endpoint', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({
        organizations: [mockOrg],
        total: 1,
      });
      vi.spyOn(organizationService, 'getEmployments');

      await store.fetchUserOrganization();

      expect(store.userOrganizations).toEqual([mockOrg]);
      expect(store.initialized).toBe(true);
      expect(organizationService.getEmployments).not.toHaveBeenCalled();
    });

    it('stores all organizations from owned list', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({
        organizations: [mockOrg, mockOrg2],
        total: 2,
      });

      await store.fetchUserOrganization();

      expect(store.userOrganizations).toHaveLength(2);
    });

    it('falls back to employments when owned list is empty', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({
        organizations: [],
        total: 0,
      });
      vi.spyOn(organizationService, 'getEmployments').mockResolvedValue({
        organizations: [mockOrg],
        total: 1,
      });

      await store.fetchUserOrganization();

      expect(organizationService.getEmployments).toHaveBeenCalled();
      expect(store.userOrganizations).toEqual([mockOrg]);
      expect(store.initialized).toBe(true);
    });

    it('sets empty array and marks initialized on error', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockRejectedValue(
        new Error('Network error'),
      );

      await store.fetchUserOrganization();

      expect(store.userOrganizations).toEqual([]);
      expect(store.initialized).toBe(true);
    });

    it('sets initialized true even when employments returns empty', async () => {
      vi.spyOn(organizationService, 'getOrganizations').mockResolvedValue({
        organizations: [],
        total: 0,
      });
      vi.spyOn(organizationService, 'getEmployments').mockResolvedValue({
        organizations: [],
        total: 0,
      });

      await store.fetchUserOrganization();

      expect(store.initialized).toBe(true);
      expect(store.userOrganizations).toEqual([]);
    });
  });

  describe('setOrganization', () => {
    it('adds a new organization to the array', () => {
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
  });
});
