<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import { issueService } from '@/services/IssueService';

const props = defineProps<{
  projectId: string;
  issueId: string;
}>();

const toast = useToast();
const { t } = useI18n();

/* Data state for child components */
const issueDetailsData = ref({
  issueId: '',
  title: '',
  status: 'OPEN',
  ownerId: '',
  reporter: '',
  project: '',
  issueType: 'TASK',
  tenancy: '',
});

const description = ref('');

/* Loading state */
const loadingFetch = ref(false);

/* Fetch issue data from API */
const fetchIssue = async () => {
  loadingFetch.value = true;
  try {
    const issue = await issueService.getIssue(props.projectId, props.issueId);
    
    // Populate issue details data
    issueDetailsData.value = {
      issueId: issue.id || '',
      title: issue.title || '',
      status: issue.status || 'OPEN',
      ownerId: issue.ownerId || '',
      reporter: issue.reporterId || '',
      project: props.projectId,
      issueType: issue.type || 'TASK',
      tenancy: issue.tenancyId || '',
    };
    
    // Populate description
    description.value = issue.description || '';
  } catch (error) {
    console.error('Error fetching issue:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.fetchError'),
      life: 3000,
    });
  } finally {
    loadingFetch.value = false;
  }
};

/* Handle save events from child components */
const handleDetailsSaved = () => {
  // Re-fetch issue data to ensure UI shows latest persisted values
  fetchIssue();
};

const handleDescriptionSaved = () => {
  // Re-fetch issue data to ensure UI shows latest persisted values
  fetchIssue();
};

/* Fetch issue on mount and when props change */
onMounted(() => fetchIssue());

watch(() => [props.projectId, props.issueId], () => {
  fetchIssue();
});
</script>
  
<template>
  <div v-if="loadingFetch" class="flex justify-center items-center p-8">
    <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
  </div>
  
  <div v-else class="flex flex-col gap-4">
    <!-- Issue Details Card Component -->
    <IssueDetailsCard
      :project-id="projectId"
      :issue-id="issueId"
      :initial-data="issueDetailsData"
      @saved="handleDetailsSaved"
    />

    <!-- Description Card Component -->
    <IssueDescriptionCard
      :project-id="projectId"
      :issue-id="issueId"
      :initial-description="description"
      @saved="handleDescriptionSaved"
    />
  </div>
</template>
  