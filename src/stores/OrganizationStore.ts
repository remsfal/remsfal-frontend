import { defineStore } from 'pinia';
import {organizationService,
  type OrganizationJson,
  type OrganizationEmployeeJson,} from '@/services/OrganizationService';

export const useOrganizationStore = defineStore('organization', {
  state: () => ({
    userOrganizations: [] as OrganizationJson[],
    userEmployments: [] as OrganizationEmployeeJson[],
    initialized: false,
  }),
  getters: {hasOrganization: (state): boolean => state.userOrganizations.length > 0,},
  actions: {
    async fetchUserOrganization() {
      try {
        const [owned, employed] = await Promise.all([
          organizationService.getOrganizations(),
          organizationService.getEmployments(),
        ]);
        this.userOrganizations = owned.organizations ?? [];
        this.userEmployments = employed.employees ?? [];
      } catch {
        this.userOrganizations = [];
        this.userEmployments = [];
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
