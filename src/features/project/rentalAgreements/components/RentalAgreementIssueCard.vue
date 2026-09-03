<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';
import IssueTable, { type IssueColumn } from '../../issues/components/IssueTable.vue';
import { issueService, type IssueItemJson } from '@/services/IssueService';

const props = defineProps<{
  projectId: string; agreementId: string;
}>();
const router = useRouter();
const { t } = useI18n();

const issues = ref<IssueItemJson[]>([]);

// --- Filters (status, type, assigneeId, agreementId) are applied server-side ---
const loadIssues = async () => {
  try {
    const issueList = await issueService.getIssues(
      props.projectId, undefined, undefined, undefined, props.agreementId,
    );
    issues.value = issueList?.issues ?? [];
  } catch (err) {
    console.error(err);
  }
};

const columns = computed<IssueColumn[]>(() =>
  ['issueNumber', 'title', 'type', 'status', 'assignee', 'modifiedAt']
);

const onIssueSelect = (issue: IssueItemJson) => {
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: issue.id ?? '' } });
};

onMounted(loadIssues);
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('rentalAgreement.issue.heading.tasks') }}
    </template>
    <template #content>
      <!-- Issues Table -->
      <IssueTable
        :issues="issues"
        :projectId="props.projectId"
        :columns="columns"
        @rowSelect="onIssueSelect"
      />
    </template>
  </BaseCard>
</template>