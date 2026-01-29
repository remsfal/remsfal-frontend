<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import IssueTable from '@/components/IssueTable.vue';
import NewIssueDialog from '@/components/NewIssueDialog.vue';
import { type IssueItem, IssueService, type Status } from '@/services/IssueService';

const props = defineProps<{ projectId: string; assigneeId?: string; status?: Status; category?: string; }>();

const issueService = new IssueService();
const router = useRouter();

// Reactive state
const showNewIssueDialog = ref(false);
const issues = ref<IssueItem[]>([]);
const issuesByStatusOpen = ref<IssueItem[]>([]);
const myIssues = ref<IssueItem[]>([]);

// --- Handle issue created from dialog ---
const handleIssueCreated = (newIssue: IssueItem) => {
  // Update local state reactively
  issues.value = [...issues.value, newIssue];

  if (newIssue.status === 'OPEN') {
    issuesByStatusOpen.value = [...issuesByStatusOpen.value, newIssue];
  }

  if (props.assigneeId) {
    myIssues.value = [
      ...myIssues.value,
      {
        ...newIssue,
        assigneeId: props.assigneeId,
      },
    ];
  }
};

// --- Load all issues ---
const loadIssues = async () => {
  try {
    // Signature: (projectId, status, category)
    const issueList = await issueService.getIssues(
        props.projectId,
        undefined,
        props.category
    );
    issues.value = issueList?.issues ?? [];
  } catch (err) {
    console.error(err);
  }
};

// --- Load only open issues ---
const loadIssuesWithOpenStatus = async () => {
  try {
    const issueList = await issueService.getIssues(
        props.projectId,
        'OPEN' as Status,
        props.category
    );
    issuesByStatusOpen.value = issueList?.issues ?? [];
  } catch (err) {
    console.error(err);
  }
};

// --- Load issues for current assigneeId ---
const loadMyIssues = async () => {
  try {
    const issueList = await issueService.getIssues(
        props.projectId,
        undefined,
        props.category
    );

    myIssues.value =
        issueList?.issues?.map(issue => ({
          ...issue,
          assigneeId: props.assigneeId,
        })) ?? [];
  } catch (err) {
    console.error(err);
  }
};

// --- Handle row selection ---
const onIssueSelect = (issue: IssueItem) => {
  router.push({ name: 'IssueDetails', params: { issueId: issue.id } });
};

// --- Initialize on mount ---
onMounted(() => {
  loadIssues();
  loadIssuesWithOpenStatus();
  if (props.assigneeId) loadMyIssues();
});

// --- Watch for prop changes ---
watch(
    () => props,
    () => {
      loadIssues();
      loadIssuesWithOpenStatus();
      if (props.assigneeId) loadMyIssues();
    },
    { deep: true }
);
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <h1 class="w-full">
          <span v-if="props.category === 'DEFECT'">
            <span v-if="props.assigneeId">Meine Mängel</span>
            <span v-else-if="props.status">Offene Mängel</span>
            <span v-else>Alle Mängel</span>
          </span>
          <span v-else>
            <span v-if="props.assigneeId">Meine Aufgaben</span>
            <span v-else-if="props.status">Offene Aufgaben</span>
            <span v-else>Alle Aufgaben</span>
          </span>
        </h1>
      </div>

      <div class="col-span-12">
        <div class="card">
          <!-- Create Issue Dialog -->
          <NewIssueDialog
            v-model:visible="showNewIssueDialog"
            :projectId="props.projectId"
            :category="props.category"
            @issueCreated="handleIssueCreated"
          />

          <!-- Issues Table -->
          <div v-if="props.assigneeId">
            <IssueTable :issues="myIssues" @rowSelect="onIssueSelect" />
          </div>

          <div v-else-if="props.status">
            <IssueTable :issues="issuesByStatusOpen" @rowSelect="onIssueSelect" />
          </div>

          <div v-else>
            <IssueTable :issues="issues" @rowSelect="onIssueSelect" />
          </div>

          <!-- Create Button -->
          <div class="flex justify-end mt-6">
            <Button
              :label="props.category === 'DEFECT' ? 'Mangel melden' : 'Aufgabe erstellen'"
              icon="pi pi-plus"
              @click="showNewIssueDialog = true"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
    