import { defineStore } from 'pinia';
import {propertyService,
  type RentalUnitTreeNodeJson,} from '@/features/project/rentableUnits/services/PropertyService';

export const useRentableUnitsStore = defineStore('rentable-units', {
  state: () => ({
    rentableUnitTree: [] as RentalUnitTreeNodeJson[],
    loadedProjectId: undefined as string | undefined,
    isLoading: false,
    version: 0,
    requestId: 0,
    loadingProjectId: undefined as string | undefined,
    loadingPromise: undefined as Promise<void> | undefined,
  }),
  actions: {
    async fetchRentalUnitTree(projectId: string): Promise<void> {
      if (this.loadedProjectId && this.loadedProjectId === projectId) return;
      if (this.loadingPromise && this.loadingProjectId === projectId) return this.loadingPromise;

      this.requestId += 1;
      const requestId = this.requestId;
      this.isLoading = true;
      this.loadingProjectId = projectId;

      const promise = (async () => {
        try {
          const data = await propertyService.getPropertyTree(projectId);
          if (this.requestId !== requestId) return; // superseded by a newer fetch or invalidate()
          this.rentableUnitTree = (data.properties ?? []) as RentalUnitTreeNodeJson[];
          this.loadedProjectId = projectId;
        } finally {
          if (this.requestId === requestId) {
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
      this.requestId += 1;
      this.loadedProjectId = undefined;
      this.loadingProjectId = undefined;
      this.loadingPromise = undefined;
      this.isLoading = false;
      this.version += 1;
    },
  },
});
