<script setup lang="ts">
import TenancyDataComponent from '@/components/tenancyDetails/TenancyDataComponent.vue';
import TenantsTableComponent from '@/components/tenancyDetails/TenantsTableComponent.vue';
import UnitsTableComponent from '@/components/tenancyDetails/UnitsTableComponent.vue';
import { rentalAgreementService, type RentalAgreement } from '@/services/RentalAgreementService';
import type { components } from '@/services/api/platform-schema';
import { useProjectStore } from '@/stores/ProjectStore';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

type RentJson = components['schemas']['RentJson'];

const router = useRouter();
const toast = useToast();
const projectStore = useProjectStore();

const confirmationDialogVisible = ref(false);
const rentalAgreement = ref<RentalAgreement | null>(null);

const rentalStart = ref<string | null>(null);
const rentalEnd = ref<string | null>(null);

// Compute all units from all rent types
const listOfUnits = computed(() => {
  if (!rentalAgreement.value) return [];

  const allRents: RentJson[] = [
    ...(rentalAgreement.value.propertyRents || []),
    ...(rentalAgreement.value.siteRents || []),
    ...(rentalAgreement.value.buildingRents || []),
    ...(rentalAgreement.value.apartmentRents || []),
    ...(rentalAgreement.value.storageRents || []),
    ...(rentalAgreement.value.commercialRents || [])
  ];

  return allRents.map(rent => ({
    id: rent.rentalUnit?.id,
    title: rent.rentalUnit?.title,
    type: rent.rentalUnit?.type,
    location: rent.rentalUnit?.location,
    description: rent.rentalUnit?.description,
    space: rent.rentalUnit?.space
  }));
});

onMounted(async () => {
  const agreementId = window.location.href.split('/').pop();
  if (!agreementId || !projectStore.projectId) {
    console.error('Agreement ID or Project ID not found');
    return;
  }

  rentalAgreement.value = await rentalAgreementService.loadRentalAgreement(
    projectStore.projectId,
    agreementId
  );
  rentalStart.value = rentalAgreement.value?.startOfRental || null;
  rentalEnd.value = rentalAgreement.value?.endOfRental || null;
});

function confirmDeletion() {
  const agreementId = rentalAgreement.value?.id;
  if (!agreementId || !projectStore.projectId) {
    console.error('Agreement ID or Project ID is missing');
    confirmationDialogVisible.value = false;
    return;
  }

  deleteRentalAgreement(agreementId);
  confirmationDialogVisible.value = false;
}

function deleteRentalAgreement(agreementId: string) {
  if (!projectStore.projectId) return;

  rentalAgreementService
    .deleteRentalAgreement(projectStore.projectId, agreementId)
    .then(() => redirectToTenanciesList())
    .catch((error) => console.error('Error deleting rental agreement:', error));
}

function redirectToTenanciesList() {
  router.push('/project/' + projectStore.projectId + '/tenancies/');
}

function updateRentalAgreement(agreement: RentalAgreement | null) {
  if (!agreement?.id || !projectStore.projectId) return;

  rentalAgreementService.updateRentalAgreement(
    projectStore.projectId,
    agreement.id,
    agreement
  );
  toast.add({
    severity: 'success',
    summary: 'Speichern erfolgreich',
    detail: `Der Mietvertrag mit der ID ${agreement?.id} wurde erfolgreich aktualisiert.`,
    life: 3000,
  });
}

function handleTenancyDataChange(updatedAgreement: RentalAgreement) {
  rentalAgreement.value = updatedAgreement;
  rentalStart.value = rentalAgreement.value?.startOfRental || null;
  rentalEnd.value = rentalAgreement.value?.endOfRental || null;
}

defineExpose({
  confirmationDialogVisible,
  confirmDeletion,
});
</script>

<template>
  <div class="p-4">
    <!-- Rental Agreement data form -->
    <TenancyDataComponent
      v-if="rentalAgreement"
      :tenancy="rentalAgreement"
      @onChange="handleTenancyDataChange"
    />

    <div class="grid grid-cols-1 gap-6">
      <!-- Tenants Table -->
      <TenantsTableComponent
        :tenants="rentalAgreement?.tenants || []"
        :isDeleteButtonEnabled="false"
      />

      <!-- Units Table -->
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
          @click="updateRentalAgreement(rentalAgreement)"
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
      <p>Sind Sie sicher, dass Sie den Mietvertrag mit der ID {{ rentalAgreement?.id }} löschen möchten?</p>
    </div>
    <template #footer>
      <Button label="Abbrechen" icon="pi pi-times" @click="confirmationDialogVisible = false" />
      <Button label="Löschen" icon="pi pi-check" severity="danger" @click="confirmDeletion" />
    </template>
  </Dialog>
</template>
