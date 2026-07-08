<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import IssueDetailsCard from '../components/IssueDetailsCard.vue';
import IssueDescriptionCard from '../components/IssueDescriptionCard.vue';
import IssueAttachmentCard from '../components/IssueAttachmentCard.vue';
import IssueRelationshipsCard from '../components/IssueRelationshipsCard.vue';
import QuotationRequestCard from '../components/QuotationRequestCard.vue';
import { issueService, type IssueAttachmentJson, type IssueJson } from '@/services/IssueService';

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
  reportedBy: string;
  project: string;
  tenancy: string;
  status: IssueJson['status'];
  issueType: IssueJson['type'];
  category: IssueJson['category'];
  priority: IssueJson['priority'];
  modifiedAt?: IssueJson['modifiedAt'];
};

/* State */
const loadingFetch = ref(false);
const issueDetailsData = ref<IssueUI | null>(null);
const description = ref('');
const attachments = ref<IssueAttachmentJson[]>([]);
const relations = ref<{
  relatedTo: string[];
  duplicateOf: string[];
  blockedBy: string[];
  blocks: string[];
  childrenIssues: string[];
  parentIssue: string | undefined;
}>({
  relatedTo: [],
  duplicateOf: [],
  blockedBy: [],
  blocks: [],
  childrenIssues: [],
  parentIssue: undefined,
});

/* Fetch issue from API and map to UI type */
const fetchIssue = async () => {
  loadingFetch.value = true;
  try {
    const issue: IssueJson = await issueService.getIssue(props.issueId);
    // Map API response to UI-friendly format
    issueDetailsData.value = {
      issueId: issue.id ?? '',
      title: issue.title ?? '',
      status: issue.status ?? 'OPEN',
      assigneeId: issue.assigneeId ?? '',
      reportedBy: issue.reportedBy ?? '',
      project: props.projectId,
      issueType: issue.type,
      tenancy: issue.agreementId ?? '',
      category: issue.category,
      priority: issue.priority,
      modifiedAt: issue.modifiedAt,
    };
    description.value = issue.description ?? '';
    attachments.value = issue.attachments ?? [];
    relations.value = {
      relatedTo: issue.relatedTo ?? [],
      duplicateOf: issue.duplicateOf ?? [],
      blockedBy: issue.blockedBy ?? [],
      blocks: issue.blocks ?? [],
      childrenIssues: issue.childrenIssues ?? [],
      parentIssue: issue.parentIssue,
    };
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

const handleAttachmentsSaved = () => {
  fetchIssue(); // refresh after attachment changes
};

const handleRelationshipsSaved = () => {
  fetchIssue(); // refresh after relationship changes
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

  <!-- Issue Details Card -->
  <IssueDetailsCard
    v-if="issueDetailsData"
    :initialData="issueDetailsData"
    :issueId="issueId"
    :projectId="projectId"
    @saved="handleDetailsSaved"
  />

  <!-- Issue Description Card -->
  <IssueDescriptionCard
    :initialDescription="description"
    :issueId="issueId"
    :projectId="projectId"
    @saved="handleDescriptionSaved"
  />

  <!-- Issue Attachment Card -->
  <IssueAttachmentCard
    :attachments="attachments"
    :issueId="issueId"
    @saved="handleAttachmentsSaved"
  />

  <!-- Issue Relationships Card -->
  <IssueRelationshipsCard
    :issueId="issueId"
    :projectId="projectId"
    :relatedTo="relations.relatedTo"
    :duplicateOf="relations.duplicateOf"
    :blockedBy="relations.blockedBy"
    :blocks="relations.blocks"
    :childrenIssues="relations.childrenIssues"
    :parentIssue="relations.parentIssue"
    @saved="handleRelationshipsSaved"
  />

  <!-- Quotation Request Card -->
  <QuotationRequestCard
    :issueId="issueId"
    :projectId="projectId"
  />
</template>
