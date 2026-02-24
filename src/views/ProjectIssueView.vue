<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import IssueRelationshipsCard from '@/components/issue/IssueRelationshipsCard.vue';
import { issueService, type IssueJson } from '@/services/IssueService';

/* Props */
const props = defineProps<{ projectId: string; issueId: string }>();

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

/* Fetch issue from API and map to UI type */
const fetchIssue = async () => {
  loadingFetch.value = true;
  try {
    const issue: IssueJson = await issueService.getIssue(props.issueId);
    console.log('#######', issue);

    // Map API response to UI-friendly format
    issueDetailsData.value = {
      issueId: issue.id ?? '',
      status: issue.status ?? 'OPEN',
      assigneeId: issue.assigneeId ?? '',
      reporter: issue.reporterId ?? '',
      project: props.projectId,
      issueType: issue.type,
      tenancy: issue.agreementId ?? '',
    };
    console.log('Fetched assigneeId:', issue);

    description.value = issue.description ?? '';
  } catch (error) {
    console.error('Error fetching issue:', error);
    toast.add({
 severity: 'error', summary: t('error.general'), detail: t('issueDetails.fetchError'), life: 3000 
});
  } finally {
    loadingFetch.value = false;
  }
};

/* Handle save events from child components */
const handleDetailsSaved = () => {
  fetchIssue(); // refresh after saving details
};

const handleDescriptionSaved = () => {
  fetchIssue(); // refresh after saving description
};

/* Fetch issue on mount and when props change */
onMounted(() => fetchIssue());

/* Fetch issue on mount and when props change */
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
