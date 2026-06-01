import { defineStore } from 'pinia';
import { organizationService, type OrganizationJson } from '@/services/OrganizationService';

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    userOrganizations: [] as OrganizationJson[],
    initialized: false,
  }),
  getters: {hasOrganization: (state): boolean => state.userOrganizations.length > 0,},
  actions: {
    async fetchUserOrganization() {
      try {
        // Try owner-scoped list first (creator is always the owner)
        const owned = await organizationService.getOrganizations();
        if (owned.organizations?.length) {
          this.userOrganizations = owned.organizations;
          return;
        }
        // Fall back to employment-scoped list (employee / co-worker)
        const employed = await organizationService.getEmployments();
        this.userOrganizations = employed.organizations ?? [];
      } catch {
        this.userOrganizations = [];
      } finally {
        this.initialized = true;
      }
    },
    setOrganization(org: OrganizationJson) {
      if (!org.id) return;
      const idx = this.userOrganizations.findIndex(o => o.id === org.id);
      if (idx >= 0) {
        this.userOrganizations[idx] = org;
      } else {
        this.userOrganizations.push(org);
      }
      this.initialized = true;
    },
  },
});
