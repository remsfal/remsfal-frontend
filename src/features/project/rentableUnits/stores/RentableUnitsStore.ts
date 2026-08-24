import { defineStore } from 'pinia';
import {propertyService,
  type RentalUnitTreeNodeJson,} from '@/features/project/rentableUnits/services/PropertyService';

export const useRentableUnitsStore = defineStore('rentable-units', {
  state: () => ({
    rentableUnitTree: [] as RentalUnitTreeNodeJson[],
    loadedProjectId: undefined as string | undefined,
    isLoading: false,
    version: 0,
    loadingProjectId: undefined as string | undefined,
    loadingPromise: undefined as Promise<void> | undefined,
  }),
  actions: {
    async fetchRentalUnitTree(projectId: string): Promise<void> {
      if (this.loadedProjectId && this.loadedProjectId === projectId) return;
      if (this.loadingPromise && this.loadingProjectId === projectId) return this.loadingPromise;

      this.isLoading = true;
      this.loadingProjectId = projectId;

      const promise = (async () => {
        try {
          const data = await propertyService.getPropertyTree(projectId);
          this.rentableUnitTree = (data.properties ?? []) as RentalUnitTreeNodeJson[];
          this.loadedProjectId = projectId;
        } finally {
          if (this.loadingProjectId === projectId) {
            this.isLoading = false;
            this.loadingProjectId = undefined;
            this.loadingPromise = undefined;
          }
        }
      })();

      this.loadingPromise = promise;
      return promise;
    },
    invalidate() {
      this.loadedProjectId = undefined;
      this.version += 1;
    },
  },
});
