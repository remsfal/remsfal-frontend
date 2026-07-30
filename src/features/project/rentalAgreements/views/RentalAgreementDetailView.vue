<script setup lang="ts">
import RentalAgreementTenantListCard from '../components/RentalAgreementTenantListCard.vue';
import RentalAgreementIssueCard from "@/features/project/rentalAgreements/components/RentalAgreementIssueCard.vue";
import RentalAgreementUnitListCard from '../components/RentalAgreementUnitListCard.vue';
import RentalAgreementSummaryCard from '../components/RentalAgreementSummaryCard.vue';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import BaseDialog from '@/components/common/BaseDialog.vue';
import Button from 'primevue/button';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { issueService, type IssueItemJson, type IssueStatus, type IssueType } from '@/services/IssueService';
import DangerZoneCard from "@/components/common/DangerZoneCard.vue";
import {useToast} from "primevue/usetoast";

const props = defineProps<{
  projectId: string; agreementId: string; status?: IssueStatus; type?: IssueType; assigneeId?: string;
}>();

const { t } = useI18n();
const router = useRouter();
const issues = ref<IssueItemJson[]>([]);
const toast = useToast();

const confirmationDialogVisible = ref(false);
const rentalAgreement = ref<RentalAgreementJson | null>(null);

const rentalStart = ref<string | null>(null);
const rentalEnd = ref<string | null>(null);

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

const loadIssues = async () => {
  try {
    const issueList = await issueService.getIssues(props.projectId, props.status, props.type, props.assigneeId);
    issues.value = issueList?.issues ?? [];
  } catch (err) {
    console.error(err);
  }
};

onMounted(loadIssues);

const deleteAgreement = async () => {
  try {
    await rentalAgreementService.deleteRentalAgreement(props.projectId, props.agreementId);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('rentalAgreement.dangerZone.deleteSuccess'),
      life: 3000,
    });
    redirectToRentalAgreementList();
  } catch (err) {
    console.error('Error deleting rental agreement:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('rentalAgreement.dangerZone.deleteError'),
      life: 6000,
    });
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
        :active="rentalAgreement.active"
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
