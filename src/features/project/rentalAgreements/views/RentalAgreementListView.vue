<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {rentalAgreementService,
  type RentalAgreementItemJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';

import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import NewRentalAgreementDialog from '../components/NewRentalAgreementDialog.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps<{
  projectId: string;
}>();
const { t } = useI18n();

const router = useRouter();

const isLoading = ref(true);

const rentalAgreements = ref<RentalAgreementItemJson[]>([]);

const showNewRentalDialog = ref(false);

function navigateToRentalAgreementDetails(id: string) {
  router.push({ name: 'RentalAgreementDetails', params: { projectId: props.projectId, agreementId: id } });
}

async function handleRentalAgreementCreated() {
  // Refresh rental agreements list
  rentalAgreements.value = await rentalAgreementService.getRentalAgreements(props.projectId);
}

onMounted(async () => {
  rentalAgreements.value = await rentalAgreementService.getRentalAgreements(props.projectId);
  isLoading.value = false;
});
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <h1 class="col-span-12">
        {{ t('projectTenancies.title') }}
      </h1>
      <div v-if="isLoading">
        {{ t('projectTenancies.loading') }}
      </div>
      <div v-if="!isLoading" class="col-span-12 card">
        <DataTable
          :value="rentalAgreements"
          :rows="10"
          rowHover
          dataKey="id"
          tableStyle="min-width: 60rem"
          scrollable
          scrollDirection="both"
          scrollHeight="var(--custom-scroll-height)"
          class="custom-scroll-height cursor-pointer"
          @rowClick="navigateToRentalAgreementDetails($event.data.id)"
        >
          <Column field="startOfRental" :header="t('projectTenancies.table.rentalStart')" sortable />
          <Column field="endOfRental" :header="t('projectTenancies.table.rentalEnd')" sortable />

          <Column field="tenants" :header="t('projectTenancies.table.tenants')">
            <template #body="slotProps">
              <div class="space-y-2">
                <div
                  v-for="(tenant, index) in slotProps.data.tenants"
                  :key="`${tenant.id}-${index}`"
                  class="border-b last:border-none py-2"
                >
                  {{ tenant.firstName }} {{ tenant.lastName }}
                </div>
              </div>
            </template>
          </Column>

          <Column :header="t('projectTenancies.table.units')">
            <template #body="slotProps">
              <div class="space-y-2">
                <div
                  v-for="(unit, index) in (slotProps.data.rentalUnits || [])"
                  :key="`${unit.id}-${index}`"
                  class="border-b last:border-none py-2"
                >
                  {{ unit.title || unit.location || 'N/A' }}
                </div>
              </div>
            </template>
          </Column>
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
      </div>
    </div>

    <!-- New Rental Agreement Dialog -->
    <NewRentalAgreementDialog
      v-model:visible="showNewRentalDialog"
      :projectId="projectId"
      @rentalAgreementCreated="handleRentalAgreementCreated"
    />
  </main>
</template>
