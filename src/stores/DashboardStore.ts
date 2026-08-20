import { defineStore } from 'pinia';
import {propertyService,
  type RentalUnitTreeNodeJson,} from '@/features/project/rentableUnits/services/PropertyService';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    rentableUnitTree: [] as RentalUnitTreeNodeJson[],
    loadedProjectId: undefined as string | undefined,
  }),
  actions: {
    async fetchRentalUnitTree(projectId: string) {
      if (this.loadedProjectId && this.loadedProjectId === projectId) return;
      const data = await propertyService.getPropertyTree(projectId);
      this.rentableUnitTree = (data.properties ?? []) as RentalUnitTreeNodeJson[];
      this.loadedProjectId = projectId;
    },
    invalidate() {
      this.loadedProjectId = undefined;
    },
  },
});
