<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/BaseCard.vue';
import IssueTable, { type IssueColumn } from '../components/IssueTable.vue';
import NewIssueButton from '../components/NewIssueButton.vue';
import NewTenantIssueButton from '../components/NewTenantIssueButton.vue';
import { issueService, type IssueItemJson, type IssueStatus, type IssueType } from '@/services/IssueService';

const props = defineProps<{
  projectId: string;
  assigneeId?: string;
  status?: IssueStatus | IssueStatus[];
  type?: IssueType | IssueType[];
}>();
const router = useRouter();
const { t } = useI18n();

const issues = ref<IssueItemJson[]>([]);

// --- Filters (status, type, assigneeId) are applied server-side ---
// Follows nextCursor until exhausted, since the backend caps a single page at 100 issues.
const loadIssues = async () => {
  try {
    const firstPage = await issueService.getIssues(props.projectId, props.status, props.type, props.assigneeId);
    const allIssues = [...(firstPage?.issues ?? [])];
    let cursor = firstPage?.nextCursor;

    while (cursor) {
      const nextPage = await issueService.getIssues(
        props.projectId, props.status, props.type, props.assigneeId,
        undefined, undefined, undefined, cursor,
      );
      allIssues.push(...(nextPage?.issues ?? []));
      cursor = nextPage?.nextCursor;
    }

    issues.value = allIssues;
  } catch (err) {
    console.error(err);
  }
};

function toArray<T>(value?: T | T[]): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function isExactSet<T>(values: T[], expected: T[]): boolean {
  if (values.length !== expected.length) return false;
  const sorted = [...values].sort();
  const expectedSorted = [...expected].sort();
  return sorted.every((value, index) => value === expectedSorted[index]);
}

const OPEN_STATUSES: IssueStatus[] = ['OPEN', 'IN_PROGRESS'];
const REQUEST_TYPES: IssueType[] = ['APPLICATION', 'INQUIRY', 'TASK', 'TERMINATION'];

// Ordered filter-signature lookup, reusing the sidebar's own i18n keys instead
// of re-deriving a label from the raw filter props (which share status/type
// combinations across several distinct menu items). Each preset also carries
// the column set for its menu item, since the two are defined by the same
// filter signature.
const VIEW_PRESETS: {
  key: string;
  columns: IssueColumn[];
  matches: (statusArr: IssueStatus[], typeArr: IssueType[]) => boolean;
}[] = [
  {
    key: 'projectMenu.issueManagement.mine',
    columns: ['title', 'type', 'status', 'priority', 'modifiedAt'],
    matches: (statusArr, typeArr) => !!props.assigneeId && statusArr.length === 0 && typeArr.length === 0,
  },
  {
    key: 'projectMenu.tenantCommunication.open',
    columns: ['issueNumber', 'title', 'type', 'assignee', 'priority'],
    matches: (statusArr, typeArr) => isExactSet(statusArr, OPEN_STATUSES) && isExactSet(typeArr, ['DEFECT']),
  },
  {
    key: 'projectMenu.tenantCommunication.requests',
    columns: ['issueNumber', 'title', 'type', 'assignee', 'priority'],
    matches: (statusArr, typeArr) => isExactSet(statusArr, OPEN_STATUSES) && isExactSet(typeArr, REQUEST_TYPES),
  },
  {
    key: 'projectMenu.issueManagement.open',
    columns: ['issueNumber', 'title', 'type', 'assignee', 'priority'],
    matches: (statusArr, typeArr) => isExactSet(statusArr, OPEN_STATUSES) && typeArr.length === 0,
  },
  {
    key: 'projectMenu.tenantCommunication.new',
    columns: ['issueNumber', 'title', 'type', 'modifiedAt'],
    matches: (statusArr, typeArr) => isExactSet(statusArr, ['PENDING']) && typeArr.length === 0,
  },
  {
    key: 'projectMenu.issueManagement.all',
    columns: ['issueNumber', 'title', 'type', 'status', 'modifiedAt'],
    matches: () => true,
  },
];

const activePreset = computed(() => {
  const statusArr = toArray(props.status);
  const typeArr = toArray(props.type);
  return VIEW_PRESETS.find((candidate) => candidate.matches(statusArr, typeArr)) ?? VIEW_PRESETS[VIEW_PRESETS.length - 1];
});

const heading = computed(() => t(activePreset.value.key));
const columns = computed<IssueColumn[]>(() => activePreset.value.columns);

const handleIssueCreated = async (newIssue: IssueItemJson) => {
  await loadIssues();
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: newIssue.id ?? '' } });
};

const onIssueSelect = (issue: IssueItemJson) => {
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: issue.id ?? '' } });
};

onMounted(loadIssues);

// --- Re-fetch when the backend-relevant filters change ---
watch(() => [props.projectId, props.status, props.type, props.assigneeId], loadIssues);
</script>

<template>
  <BaseCard>
    <template #title>
      {{ heading }}
    </template>
    <template #content>
      <!-- Issues Table -->
      <IssueTable
        :issues="issues"
        :projectId="props.projectId"
        :columns="columns"
        @rowSelect="onIssueSelect"
      />

      <!-- Create Buttons -->
      <div class="flex justify-end gap-2 mt-6">
        <NewTenantIssueButton :projectId="props.projectId" @issueCreated="handleIssueCreated" />
        <NewIssueButton :projectId="props.projectId" @issueCreated="handleIssueCreated" />
      </div>
    </template>
  </BaseCard>
</template>
