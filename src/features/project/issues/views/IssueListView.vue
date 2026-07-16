<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import IssueTable, { type IssueColumn } from '../components/IssueTable.vue';
import NewIssueDialog from '../components/NewIssueDialog.vue';
import { issueService, type IssueItemJson, type IssueStatus, type IssueType } from '@/services/IssueService';

const props = defineProps<{ projectId: string; assigneeId?: string; status?: IssueStatus; type?: IssueType; }>();
const router = useRouter();

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

const columns = computed<IssueColumn[]>(() =>
  props.type === 'DEFECT' ? ['title', 'status', 'priority'] : ['title', 'assignee', 'status'],
);

const heading = computed(() => {
  const subject = props.type === 'DEFECT' ? 'Mängel' : 'Aufgaben';
  if (props.assigneeId) return `Meine ${subject}`;
  if (props.status === 'OPEN') return `Offene ${subject}`;
  if (props.status === 'CLOSED') return `Geschlossene ${subject}`;
  if (props.status === 'PENDING') return `Neue ${subject}`;
  return `Alle ${subject}`;
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
            :category="props.type"
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
              :label="props.type === 'DEFECT' ? 'Mangel melden' : 'Aufgabe erstellen'"
              icon="pi pi-plus"
              @click="showNewIssueDialog = true"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
