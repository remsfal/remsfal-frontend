<script setup lang="ts">
import RentalAgreementTenantListCard from '../components/RentalAgreementTenantListCard.vue';
import RentalAgreementKeyCard from '../components/RentalAgreementKeyCard.vue';
import RentalAgreementIssueCard from "@/features/project/rentalAgreements/components/RentalAgreementIssueCard.vue";
import RentalAgreementUnitListCard from '../components/RentalAgreementUnitListCard.vue';
import RentalAgreementSummaryCard from '../components/RentalAgreementSummaryCard.vue';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import BaseDialog from '@/components/BaseDialog.vue';
import Button from 'primevue/button';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import DangerZoneCard from "@/components/DangerZoneCard.vue";
import { useAppToast } from '@/composables/useAppToast';

const props = defineProps<{
  projectId: string; agreementId: string;
}>();

const { t } = useI18n();
const router = useRouter();
const appToast = useAppToast();

const confirmationDialogVisible = ref(false);
const rentalAgreement = ref<RentalAgreementJson | null>(null);

const rentalStart = ref<string | null>(null);
const rentalEnd = ref<string | null>(null);

const isAgreementActive = computed(() => {
  const endOfRental = rentalAgreement.value?.endOfRental;
  if (!endOfRental) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(endOfRental) >= today;
});

onMounted(async () => {
  if (!props.agreementId || !props.projectId) {
    console.error('Agreement ID or Project ID not found');
    return;
  }

  rentalAgreement.value = await rentalAgreementService.getRentalAgreement(
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
    .then(() => redirectToRentalAgreementList())
    .catch((error) => console.error('Error deleting rental agreement:', error));
}

function redirectToRentalAgreementList() {
  router.push({ name: 'RentalAgreementView', params: { projectId: props.projectId } });
}

const deleteAgreement = async () => {
  try {
    await rentalAgreementService.deleteRentalAgreement(props.projectId, props.agreementId);
    appToast.success(t('rentalAgreement.dangerZone.deleteSuccess'), { summary: t('success.saved') });
    redirectToRentalAgreementList();
  } catch (err) {
    console.error('Error deleting rental agreement:', err);
  }
};

defineExpose({
  confirmationDialogVisible,
  confirmDeletion,
});
</script>

<template>
  <div class="p-4">
    <div class="grid grid-cols-1 gap-6">
      <RentalAgreementSummaryCard
        v-if="rentalAgreement"
        :projectId="props.projectId"
        :rentalAgreement="rentalAgreement"
        @update:rentalAgreement="rentalAgreement = $event"
      />

      <!-- Tenants -->
      <RentalAgreementTenantListCard
        v-if="rentalAgreement"
        :active="isAgreementActive"
        :projectId="projectId"
        :rentalAgreement="rentalAgreement"
        @update:rentalAgreement="(updated) => (rentalAgreement = updated)"
      />

      <RentalAgreementKeyCard
        v-if="rentalAgreement"
        :projectId="projectId"
        :rentalAgreement="rentalAgreement"
        @update:rentalAgreement="(updated) => (rentalAgreement = updated)"
      />

      <RentalAgreementUnitListCard
        v-if="rentalAgreement"
        :projectId="props.projectId"
        :rentalAgreement="rentalAgreement"
        @update:rentalAgreement="rentalAgreement = $event"
      />

      <RentalAgreementIssueCard
        :projectId="props.projectId"
        :agreementId="props.agreementId"
      />

      <DangerZoneCard
        :description="t('rentalAgreement.dangerZone.description')"
        :deleteButtonLabel="t('rentalAgreement.dangerZone.deleteButton')"
        :confirmTitle="t('rentalAgreement.dangerZone.confirmTitle')"
        :confirmMessage="t('rentalAgreement.dangerZone.confirmMessage')"
        @confirm="deleteAgreement"
      />
    </div>
  </div>

  <BaseDialog v-model:visible="confirmationDialogVisible" :header="t('projectTenancies.dialog.confirmationTitle')">
    <p>{{ t('rentalAgreement.dialog.confirmDelete', { id: rentalAgreement?.id }) }}</p>
    <template #footer>
      <Button :label="t('button.cancel')" icon="pi pi-times" @click="confirmationDialogVisible = false" />
      <Button :label="t('button.delete')" icon="pi pi-check" severity="danger" @click="confirmDeletion" />
    </template>
  </BaseDialog>
</template>
