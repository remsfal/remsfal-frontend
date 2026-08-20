<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import {rentalAgreementService,
  type RentalAgreementItemJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import type { UnitType } from '@/features/project/rentableUnits';

import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import BaseCard from '@/components/common/BaseCard.vue';
import NewRentalAgreementDialog from './NewRentalAgreementDialog.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps<{
  projectId: string;
  rentalUnitId?: string;
  rentalUnitType?: UnitType;
}>();
const { t } = useI18n();

const router = useRouter();

const isLoading = ref(true);

const rentalAgreements = ref<RentalAgreementItemJson[]>([]);

const showNewRentalDialog = ref(false);

type RentalAgreementCategory = 'current' | 'former';
type GroupedRentalAgreementItem = RentalAgreementItemJson & { category: RentalAgreementCategory };

function categoryFor(agreement: RentalAgreementItemJson): RentalAgreementCategory {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Strictly "after today" (unlike RentalAgreementKpiCards.vue's `>=` currentAgreements
  // filter) — an agreement ending today already counts as former here, by design.
  const isCurrent = !agreement.endOfRental || new Date(agreement.endOfRental) > today;
  return isCurrent ? 'current' : 'former';
}

// Pre-grouped/sorted for PrimeVue's rowGroupMode="subheader": current agreements before
// former ones, each sorted by startOfRental descending. This is a fixed business rule, not
// user-controlled sorting, so the DataTable columns below are not marked `sortable`.
const groupedRentalAgreements = computed<GroupedRentalAgreementItem[]>(() => {
  const categoryOrder: Record<RentalAgreementCategory, number> = { current: 0, former: 1 };

  return rentalAgreements.value
    .map((agreement) => ({ ...agreement, category: categoryFor(agreement) }))
    .sort((a, b) => {
      if (categoryOrder[a.category] !== categoryOrder[b.category]) {
        return categoryOrder[a.category] - categoryOrder[b.category];
      }
      return new Date(b.startOfRental).getTime() - new Date(a.startOfRental).getTime();
    });
});

function categoryLabel(category: RentalAgreementCategory): string {
  return category === 'current' ? t('projectTenancies.group.current') : t('projectTenancies.group.former');
}

function navigateToRentalAgreementDetails(id: string) {
  router.push({ name: 'RentalAgreementDetails', params: { projectId: props.projectId, agreementId: id } });
}

async function fetchRentalAgreements() {
  isLoading.value = true;
  try {
    rentalAgreements.value = await rentalAgreementService.getRentalAgreements(props.projectId, {
      rentalUnitId: props.rentalUnitId,
      rentalUnitType: props.rentalUnitType,
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchRentalAgreements);
</script>

<template>
  <BaseCard :loading="isLoading" :skeletonRows="4">
    <template #title>
      {{ t('projectTenancies.title') }}
    </template>
    <template #content>
      <DataTable
        :value="groupedRentalAgreements"
        :rows="10"
        rowHover
        dataKey="id"
        tableStyle="min-width: 60rem"
        scrollable
        scrollDirection="both"
        scrollHeight="var(--custom-scroll-height)"
        class="custom-scroll-height cursor-pointer"
        rowGroupMode="subheader"
        groupRowsBy="category"
        :pt="{ rowGroupHeaderCell: { colspan: 4 } }"
        @rowClick="navigateToRentalAgreementDetails($event.data.id)"
      >
        <Column field="startOfRental" :header="t('projectTenancies.table.rentalStart')" />
        <Column field="endOfRental" :header="t('projectTenancies.table.rentalEnd')" />

        <Column field="tenants" :header="t('projectTenancies.table.tenants')">
          <template #body="slotProps">
            <div class="space-y-2">
              <div
                v-for="(tenant, index) in slotProps.data.tenants"
                :key="`${tenant.id}-${index}`"
                class="py-2"
                :class="{ 'border-t': index !== 0 }"
                :style="index !== 0 ? { borderTopColor: 'var(--p-datatable-body-cell-border-color)' } : undefined"
              >
                {{ tenant.firstName }} {{ tenant.lastName }}
              </div>
            </div>
          </template>
        </Column>

        <Column field="rentalUnits" :header="t('projectTenancies.table.units')">
          <template #body="slotProps">
            <div class="space-y-2">
              <div
                v-for="(unit, index) in slotProps.data.rentalUnits"
                :key="`${unit.id}-${index}`"
                class="py-2"
                :class="{ 'border-t': index !== 0 }"
                :style="index !== 0 ? { borderTopColor: 'var(--p-datatable-body-cell-border-color)' } : undefined"
              >
                {{ unit.title || unit.location || 'N/A' }}
              </div>
            </div>
          </template>
        </Column>

        <template #groupheader="slotProps">
          <span class="font-semibold">{{ categoryLabel(slotProps.data.category) }}</span>
        </template>
      </DataTable>

      <div class="flex justify-end mt-6">
        <Button
          type="button"
          icon="pi pi-plus"
          :label="t('projectTenancies.button.addTenant')"
          class="mr-2 mb-2"
          @click="showNewRentalDialog = true"
        />
      </div>

      <NewRentalAgreementDialog
        v-model:visible="showNewRentalDialog"
        :projectId="projectId"
        @rentalAgreementCreated="fetchRentalAgreements"
      />
    </template>
  </BaseCard>
</template>
