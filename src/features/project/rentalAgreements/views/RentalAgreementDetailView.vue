<script setup lang="ts">
import TenancyDataComponent from '../components/TenancyDataComponent.vue';
import TenantsTableComponent from '../components/TenantsTableComponent.vue';
import UnitsTableComponent from '../components/UnitsTableComponent.vue';
import { rentalAgreementService, type RentalAgreementJson } from '@/services/RentalAgreementService';
import type { components } from '@/services/api/platform-schema';
import BaseDialog from '@/components/common/BaseDialog.vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps<{
  projectId: string;
  agreementId: string;
}>();

type RentJson = components['schemas']['RentJson'];

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const confirmationDialogVisible = ref(false);
const rentalAgreement = ref<RentalAgreementJson | null>(null);

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

  // Note: RentJson only has unitId, not full rentalUnit object
  // We map to TenancyItemJson structure for compatibility with UnitsTableComponent
  return allRents.map(rent => ({
    id: rent.unitId,
    rentalType: 'APARTMENT' as const, // We don't have type info, using default
    rentalTitle: rent.unitId, // Using unitId as title since we don't have full unit data
    active: true
  }));
});

onMounted(async () => {
  if (!props.agreementId || !props.projectId) {
    console.error('Agreement ID or Project ID not found');
    return;
  }

  rentalAgreement.value = await rentalAgreementService.loadRentalAgreement(
    props.projectId,
    props.agreementId
  );
  rentalStart.value = rentalAgreement.value?.startOfRental || null;
  rentalEnd.value = rentalAgreement.value?.endOfRental || null;
});

function confirmDeletion() {
  const agreementId = rentalAgreement.value?.id;
  if (!agreementId || !props.projectId) {
    console.error('Agreement ID or Project ID is missing');
    confirmationDialogVisible.value = false;
    return;
  }

  deleteRentalAgreement(agreementId);
  confirmationDialogVisible.value = false;
}

function deleteRentalAgreement(agreementId: string) {
  if (!props.projectId) return;

  rentalAgreementService
    .deleteRentalAgreement(props.projectId, agreementId)
    .then(() => redirectToTenanciesList())
    .catch((error) => console.error('Error deleting rental agreement:', error));
}

function redirectToTenanciesList() {
  router.push({ name: 'RentalAgreementView', params: { projectId: props.projectId } });
}

function updateRentalAgreement(agreement: RentalAgreementJson | null) {
  if (!agreement?.id || !props.projectId) return;

  rentalAgreementService.updateRentalAgreement(
    props.projectId,
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

function handleTenancyDataChange(updatedAgreement: RentalAgreementJson) {
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
        :projectId="props.projectId"
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
  <BaseDialog v-model:visible="confirmationDialogVisible" :header="t('projectTenancies.dialog.confirmationTitle')">
    <p>{{ t('rentalAgreement.dialog.confirmDelete', { id: rentalAgreement?.id }) }}</p>
    <template #footer>
      <Button :label="t('button.cancel')" icon="pi pi-times" @click="confirmationDialogVisible = false" />
      <Button :label="t('button.delete')" icon="pi pi-check" severity="danger" @click="confirmDeletion" />
    </template>
  </BaseDialog>
</template>
