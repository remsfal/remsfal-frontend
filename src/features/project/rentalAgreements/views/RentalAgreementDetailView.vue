<script setup lang="ts">
import RentalAgreementTenantListCard from '../components/RentalAgreementTenantListCard.vue';
import RentalAgreementSummaryCard from '../components/RentalAgreementSummaryCard.vue';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import BaseDialog from '@/components/common/BaseDialog.vue';
import Button from 'primevue/button';
import { onMounted, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps<{
  projectId: string;
  agreementId: string;
}>();

const { t } = useI18n();
const router = useRouter();

const confirmationDialogVisible = ref(false);
const rentalAgreement = ref<RentalAgreementJson | null>(null);

onMounted(async () => {
  if (!props.agreementId || !props.projectId) {
    console.error('Agreement ID or Project ID not found');
    return;
  }

  rentalAgreement.value = await rentalAgreementService.getRentalAgreement(
    props.projectId,
    props.agreementId
  );
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
        :rentalAgreement="rentalAgreement"
        @delete="confirmDeletion"
      />

      <!-- Tenants -->
      <RentalAgreementTenantListCard
        v-if="rentalAgreement"
        :active="!rentalAgreement.active"
        :projectId="projectId"
        :rentalAgreement="rentalAgreement"
        @update:rentalAgreement="(updated) => (rentalAgreement = updated)"
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
