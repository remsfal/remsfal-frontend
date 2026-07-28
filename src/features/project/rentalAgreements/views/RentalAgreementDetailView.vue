<script setup lang="ts">
import RentalAgreementIssueCard from "@/features/project/rentalAgreements/components/RentalAgreementIssueCard.vue";
import RentalAgreementSummaryCard from '../components/RentalAgreementSummaryCard.vue';
import {rentalAgreementService,
  type RentalAgreementJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';
import BaseDialog from '@/components/common/BaseDialog.vue';
import Button from 'primevue/button';
import { onMounted, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { issueService, type IssueItemJson, type IssueStatus, type IssueType } from '@/services/IssueService';

const props = defineProps<{
  projectId: string; agreementId: string; status?: IssueStatus; type?: IssueType; assigneeId?: string;
}>();

const { t } = useI18n();
const router = useRouter();
const issues = ref<IssueItemJson[]>([]);

const confirmationDialogVisible = ref(false);
const rentalAgreement = ref<RentalAgreementJson | null>(null);

const rentalStart = ref<string | null>(null);
const rentalEnd = ref<string | null>(null);

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

const loadIssues = async () => {
  try {
    const issueList = await issueService.getIssues(props.projectId, props.status, props.type, props.assigneeId);
    issues.value = issueList?.issues ?? [];
  } catch (err) {
    console.error(err);
  }
};

onMounted(loadIssues);

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

      <RentalAgreementIssueCard
        :projectId="props.projectId"
        :agreementId="props.agreementId"
      />
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
