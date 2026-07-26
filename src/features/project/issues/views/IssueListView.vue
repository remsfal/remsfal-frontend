<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import IssueTable, { type IssueColumn } from '../components/IssueTable.vue';
import NewIssueDialog from '../components/NewIssueDialog.vue';
import { issueService, type IssueItemJson, type IssueStatus, type IssueType } from '@/services/IssueService';

const props = defineProps<{
  projectId: string;
  assigneeId?: string;
  status?: IssueStatus | IssueStatus[];
  type?: IssueType | IssueType[];
}>();
const router = useRouter();
const { t } = useI18n();

// Reactive state
const showNewIssueDialog = ref(false);
const issues = ref<IssueItemJson[]>([]);

// --- Filters (status, type, assigneeId) are applied server-side ---
const loadIssues = async () => {
  try {
    const issueList = await issueService.getIssues(props.projectId, props.status, props.type, props.assigneeId);
    issues.value = issueList?.issues ?? [];
  } catch (err) {
    console.error(err);
  }
};

function toArray<T>(value?: T | T[]): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function isExactSet<T>(values: T[], expected: T[]): boolean {
  if (values.length !== expected.length) return false;
  const sorted = [...values].sort();
  const expectedSorted = [...expected].sort();
  return sorted.every((value, index) => value === expectedSorted[index]);
}

const OPEN_STATUSES: IssueStatus[] = ['OPEN', 'IN_PROGRESS'];
const REQUEST_TYPES: IssueType[] = ['APPLICATION', 'INQUIRY', 'TASK', 'TERMINATION'];

const isDefectOnly = computed(() => isExactSet(toArray(props.type), ['DEFECT']));

const columns = computed<IssueColumn[]>(() =>
  isDefectOnly.value ? ['title', 'status', 'priority'] : ['title', 'assignee', 'status'],
);

// Ordered filter-signature lookup, reusing the sidebar's own i18n keys instead
// of re-deriving a label from the raw filter props (which share status/type
// combinations across several distinct menu items).
const HEADING_PRESETS: { key: string; matches: (statusArr: IssueStatus[], typeArr: IssueType[]) => boolean }[] = [
  {
    key: 'projectMenu.issueManagement.mine',
    matches: (statusArr, typeArr) => !!props.assigneeId && statusArr.length === 0 && typeArr.length === 0,
  },
  {
    key: 'projectMenu.tenantCommunication.open',
    matches: (statusArr, typeArr) => isExactSet(statusArr, OPEN_STATUSES) && isExactSet(typeArr, ['DEFECT']),
  },
  {
    key: 'projectMenu.tenantCommunication.requests',
    matches: (statusArr, typeArr) => isExactSet(statusArr, OPEN_STATUSES) && isExactSet(typeArr, REQUEST_TYPES),
  },
  {
    key: 'projectMenu.issueManagement.open',
    matches: (statusArr, typeArr) => isExactSet(statusArr, OPEN_STATUSES) && typeArr.length === 0,
  },
  {
    key: 'projectMenu.tenantCommunication.new',
    matches: (statusArr, typeArr) => isExactSet(statusArr, ['PENDING']) && typeArr.length === 0,
  },
  {
    key: 'projectMenu.issueManagement.all',
    matches: () => true,
  },
];

const heading = computed(() => {
  const statusArr = toArray(props.status);
  const typeArr = toArray(props.type);
  const preset = HEADING_PRESETS.find((candidate) => candidate.matches(statusArr, typeArr));
  return t(preset?.key ?? 'projectMenu.issueManagement.all');
});

// --- Handle issue created from dialog ---
const handleIssueCreated = async (newIssue: IssueItemJson) => {
  await loadIssues();
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: newIssue.id ?? '' } });
};

// --- Handle row selection ---
const onIssueSelect = (issue: IssueItemJson) => {
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: issue.id ?? '' } });
};

// --- Initialize on mount ---
onMounted(loadIssues);

// --- Re-fetch when the backend-relevant filters change ---
watch(() => [props.projectId, props.status, props.type, props.assigneeId], loadIssues);
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <h1 class="w-full">
          {{ heading }}
        </h1>
      </div>

      <div class="col-span-12">
        <div class="card">
          <!-- Create Issue Dialog -->
          <NewIssueDialog
            v-model:visible="showNewIssueDialog"
            :projectId="props.projectId"
            @issueCreated="handleIssueCreated"
          />

          <!-- Issues Table -->
          <IssueTable
            :issues="issues"
            :projectId="props.projectId"
            :columns="columns"
            @rowSelect="onIssueSelect"
          />

          <!-- Create Button -->
          <div class="flex justify-end mt-6">
            <Button
              :label="t('newIssueDialog.title')"
              icon="pi pi-plus"
              @click="showNewIssueDialog = true"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
