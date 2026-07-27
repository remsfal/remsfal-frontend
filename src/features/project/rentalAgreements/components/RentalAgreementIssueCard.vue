<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';
import IssueTable, { type IssueColumn } from '../../issues/components/IssueTable.vue';
import { issueService, type IssueItemJson, type IssueStatus, type IssueType } from '@/services/IssueService';

const props = defineProps<{
  projectId: string; agreementId?: string; assigneeId?: string; status?: IssueStatus; type?: IssueType;
}>();
const router = useRouter();
const { t } = useI18n();

// Reactive state
const issues = ref<IssueItemJson[]>([]);

// --- Filters (status, type, assigneeId, agreementId) are applied server-side ---
const loadIssues = async () => {
  try {
    const issueList = await issueService.getIssues(
      props.projectId, props.status, props.type, props.assigneeId, props.agreementId,
    );
    issues.value = issueList?.issues ?? [];
  } catch (err) {
    console.error(err);
  }
};

const columns = computed<IssueColumn[]>(() =>
  props.type === 'DEFECT' ? ['title', 'status', 'priority'] : ['title', 'assignee', 'status'],
);

// --- Handle row selection ---
const onIssueSelect = (issue: IssueItemJson) => {
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: issue.id ?? '' } });
};

// --- Initialize on mount ---
onMounted(loadIssues);

// --- Re-fetch when the backend-relevant filters change ---
watch(() => [props.projectId, props.agreementId, props.status, props.type, props.assigneeId], loadIssues);
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
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
      </div>
    </div>
  </main>
</template>