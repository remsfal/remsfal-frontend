<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { rentalAgreementService, type RentalAgreement, type TenantItem } from '@/services/RentalAgreementService';

import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import NewRentalAgreementDialog from '@/components/NewRentalAgreementDialog.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';

const props = defineProps<{
  projectId: string;
}>();
const { t } = useI18n();

const router = useRouter();
const projectStore = useProjectStore();

const tenantData = ref<TenantItem[]>([]);
const isLoading = ref(true);

const rentalAgreements = ref<RentalAgreement[]>([]);

const confirmationDialogVisible = ref(false);
const tenantToDelete = ref<TenantItem | null>(null);
const showNewRentalDialog = ref(false);

function deleteTenant(tenantId: string) {
  tenantData.value = tenantData.value.filter((t) => t.id !== tenantId);
}

function confirmDeletion() {
  if (tenantToDelete.value?.id) {
    // only if id exists
    deleteTenant(tenantToDelete.value.id);
  }
  confirmationDialogVisible.value = false;
}

function navigateToTenancyDetails(id: string) {
  router.push('/projects/' + projectStore.projectId + '/tenancies/' + id);
}

function navigateToNewTenancy() {
  showNewRentalDialog.value = true;
}

async function handleRentalAgreementCreated() {
  // Refresh rental agreements list
  rentalAgreements.value = await rentalAgreementService.fetchRentalAgreements(props.projectId);
  tenantData.value = rentalAgreementService.extractTenants(rentalAgreements.value);
}

onMounted(async () => {
  rentalAgreements.value = await rentalAgreementService.fetchRentalAgreements(props.projectId);
  tenantData.value = rentalAgreementService.extractTenants(rentalAgreements.value);
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
          :rowHover="true"
          dataKey="id"
          tableStyle="min-width: 60rem"
          scrollable
          scrollDirection="both"
          scrollHeight="var(--custom-scroll-height)"
          class="custom-scroll-height cursor-pointer"
          @rowClick="navigateToTenancyDetails($event.data.id)"
        >
          <Column field="startOfRental" :header="t('projectTenancies.table.rentalStart')" :sortable="true" />
          <Column field="endOfRental" :header="t('projectTenancies.table.rentalEnd')" :sortable="true" />

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
                  v-for="(rent, index) in [
                    ...(slotProps.data.propertyRents || []),
                    ...(slotProps.data.siteRents || []),
                    ...(slotProps.data.buildingRents || []),
                    ...(slotProps.data.apartmentRents || []),
                    ...(slotProps.data.storageRents || []),
                    ...(slotProps.data.commercialRents || [])
                  ]"
                  :key="`${rent.unitId}-${index}`"
                  class="border-b last:border-none py-2"
                >
                  {{ rent.unitId || 'N/A' }}
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
            @click="navigateToNewTenancy"
          />
        </div>
      </div>
    </div>

    <Dialog v-model:visible="confirmationDialogVisible" :header="t('projectTenancies.dialog.confirmationTitle')" modal>
      <div class="p-fluid">
        <p>
          {{
            t('projectTenancies.dialog.confirmDelete', {
              firstName: tenantToDelete?.firstName,
              lastName: tenantToDelete?.lastName
            })
          }}
        </p>
      </div>
      <template #footer>
        <Button :label="t('projectTenancies.dialog.cancel')" icon="pi pi-times" @click="confirmationDialogVisible = false" />
        <Button :label="t('projectTenancies.dialog.delete')" icon="pi pi-check" severity="danger" @click="confirmDeletion" />
      </template>
    </Dialog>

    <!-- New Rental Agreement Dialog -->
    <NewRentalAgreementDialog
      v-model:visible="showNewRentalDialog"
      :projectId="projectId"
      @rentalAgreementCreated="handleRentalAgreementCreated"
    />
  </main>
</template>
