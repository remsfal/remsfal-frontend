<script setup lang="ts">
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import IssueRelationshipsCard from '@/components/issue/IssueRelationshipsCard.vue';

import { issueService, type IssueJson } from '@/services/IssueService';

/* Props */
const props = defineProps<{
  projectId: string;
  issueId: string;
}>();

/* Toast & i18n */
const toast = useToast();
const { t } = useI18n();

/* UI-friendly Issue type */
type IssueUI = {
  issueId: string;
  title: string;
  assigneeId: string;
  reporter: string;
  project: string;
  tenancy: string;
  status: IssueJson['status'];
  issueType: IssueJson['type'];
};

/* State */
const loadingFetch = ref(false);
const issueDetailsData = ref<IssueUI | null>(null);
const description = ref('');

/* Mapper: API -> UI */
function mapIssueToUI(issue: IssueJson): IssueUI {
  return {
    issueId: issue.id ?? '',
    title: issue.title ?? '',
    assigneeId: issue.assigneeId ?? '',
    reporter: issue.reporterId ?? '',
    project: issue.projectId ?? '',
    tenancy: issue.rentalUnitId ?? '', // adjust if agreementId is correct instead
    status: issue.status,
    issueType: issue.type,
  };
}

/* Fetch issue from API */
const fetchIssue = async () => {
  loadingFetch.value = true;

  try {
    const issue: IssueJson = await issueService.getIssue(props.issueId);

    issueDetailsData.value = mapIssueToUI(issue);
    description.value = issue.description ?? '';

  } catch (error) {
    console.error('Error fetching issue:', error);

    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.fetchError'),
      life: 3000
    });
  } finally {
    loadingFetch.value = false;
  }
};

/* Handle save events from child components */
const handleDetailsSaved = () => {
  fetchIssue();
};

const handleDescriptionSaved = () => {
  fetchIssue();
};

/* Fetch when props change (runs on mount too) */
watch(
  () => [props.projectId, props.issueId],
  () => fetchIssue(),
  { immediate: true }
);
</script>

<template>
  <div v-if="loadingFetch" class="flex justify-center items-center p-8">
    <i class="pi pi-spin pi-spinner text-4xl text-primary" />
  </div>

  <div v-else class="flex flex-col gap-4">
    <!-- Issue Details Card -->
    <IssueDetailsCard
      v-if="issueDetailsData"
      :projectId="projectId"
      :issueId="issueId"
      :initialData="issueDetailsData"
      @saved="handleDetailsSaved"
    />

    <!-- Issue Description Card -->
    <IssueDescriptionCard
      :projectId="projectId"
      :issueId="issueId"
      :initialDescription="description"
      @saved="handleDescriptionSaved"
    />

    <!-- Issue Relationships Card -->
    <IssueRelationshipsCard
      :projectId="projectId"
      :issueId="issueId"
    />
  </div>
</template>