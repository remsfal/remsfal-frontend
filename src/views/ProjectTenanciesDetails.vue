<script setup lang="ts">
import TenancyDataComponent from '@/components/tenancyDetails/TenancyDataComponent.vue';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import { tenancyService } from '@/services/TenancyService';
import type { components } from '@/services/api/platform-schema';
import { useProjectStore } from '@/stores/ProjectStore';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Use TenancyJson as the type
type TenancyItem = components['schemas']['TenancyJson'];
type TenancyUnitItem = components['schemas']['TenancyItemJson']; // for UnitsTableComponent

const router = useRouter();
const toast = useToast();
const projectStore = useProjectStore();

const confirmationDialogVisible = ref(false);
const tenancy = ref<TenancyItem | null>(null);

// Separate units ref
const listOfUnits = ref<TenancyUnitItem[]>([]);

const rentalStart = ref<string | null>(null);
const rentalEnd = ref<string | null>(null);

onMounted(async () => {
  const tenancyId = window.location.href.split('/').pop();
  if (!tenancyId) {
    console.error('Tenancy ID not found in URL');
    return;
  }

  tenancy.value = await tenancyService.loadTenancyData(tenancyId);
  rentalStart.value = tenancy.value?.startOfRental || null;
  rentalEnd.value = tenancy.value?.endOfRental || null;

  // If you have an API for units, you can fetch them here:
  // listOfUnits.value = await tenancyService.fetchUnitsForTenancy(tenancyId);
});

function confirmDeletion() {
  const tenancyId = tenancy.value?.id;
  if (!tenancyId) {
    console.error('Tenancy ID is missing');
    confirmationDialogVisible.value = false;
    return;
  }

  deleteTenancy(tenancyId);
  confirmationDialogVisible.value = false;
}

function deleteTenancy(tenancyId: string) {
  tenancyService
    .deleteTenancy(tenancyId)
    .then(() => redirectToTenanciesList())
    .catch((error) => console.error('Error deleting tenancy:', error));
}

function redirectToTenanciesList() {
  router.push('/project/' + projectStore.projectId + '/tenancies/');
}

function updateTenancy(tenancy: TenancyItem | null) {
  tenancyService.updateTenancy(tenancy);
  toast.add({
    severity: 'success',
    summary: 'Speichern erfolgreich',
    detail: `Der Mietvertrag mit der ID ${tenancy?.id} wurde erfolgreich aktualisiert.`,
    life: 3000,
  });
}

function handleTenancyDataChange(updatedTenancy: TenancyItem) {
  tenancy.value = updatedTenancy;
  rentalStart.value = tenancy.value?.startOfRental || null;
  rentalEnd.value = tenancy.value?.endOfRental || null;
}

defineExpose({
  confirmationDialogVisible,
  confirmDeletion,
});
</script>

<template>
  <div class="p-4">
    <!-- Tenancy data form -->
    <TenancyDataComponent
      v-if="tenancy"
      :tenancy="tenancy"
      @onChange="handleTenancyDataChange"
    />

    <div class="grid grid-cols-1 gap-6">
      <!-- Tenants Table -->
      <TenantsTableComponent
        :tenants="tenancy?.tenants || []"
        :isDeleteButtonEnabled="false"
      />

      <!-- Units Table (stubbed, can fetch units separately) -->
      <UnitsTableComponent
        :listOfUnits="listOfUnits"
        :isDeleteButtonEnabled="false"
      />

      <!-- Action buttons -->
      <div class="flex justify-end">
        <Button
          icon="pi pi-save"
          label="Speichern"
          text
          raised
          rounded
          class="mb-2 mr-2 hover:bg-blue-600 transition-colors"
          @click="updateTenancy(tenancy)"
        />
        <Button
          icon="pi pi-trash"
          label="Löschen"
          severity="danger"
          text
          raised
          rounded
          class="mb-2 mr-2 hover:bg-red-600 transition-colors"
          @click="confirmationDialogVisible = true"
        />
      </div>
    </div>
  </div>

  <!-- Delete confirmation dialog -->
  <Dialog v-model:visible="confirmationDialogVisible" header="Bestätigung" modal>
    <div class="p-fluid">
      <p>Sind Sie sicher, dass Sie den Mietvertrag mit der ID {{ tenancy?.id }} löschen möchten?</p>
    </div>
    <template #footer>
      <Button label="Abbrechen" icon="pi pi-times" @click="confirmationDialogVisible = false" />
      <Button label="Löschen" icon="pi pi-check" severity="danger" @click="confirmDeletion" />
    </template>
  </Dialog>
</template>
