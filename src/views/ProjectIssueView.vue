<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import { issueService, type Issue } from '@/services/IssueService';

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
  status: Issue['status'];
  issueType: Issue['type'];
};

/* State */
const loadingFetch = ref(false);
const issueDetailsData = ref<IssueUI | null>(null);
const description = ref('');

/* Fetch issue from API and map to UI type */
const fetchIssue = async () => {
  loadingFetch.value = true;
  try {
    const issue: Issue = await issueService.getIssue(props.issueId);
    console.log('#######', issue);

    // Map API response to UI-friendly format
    issueDetailsData.value = {
      issueId: issue.id ?? '',
      title: issue.title ?? '',
      status: issue.status ?? 'OPEN',
      assigneeId: issue.assigneeId ?? '',
      reporter: issue.reporterId ?? '',
      project: props.projectId,
      issueType: issue.type,
      tenancy: issue.tenancyId ?? '',
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

watch(
  () => [props.projectId, props.issueId],
  () => fetchIssue()
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
  </div>
</template>
