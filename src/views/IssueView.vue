<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import IssueTable from '@/components/IssueTable.vue';
import { IssueService, ISSUE_TYPE_TASK, ISSUE_STATUS_OPEN, type Status, type IssueItem } from '@/services/IssueService.ts';

const props = defineProps<{
  projectId: string;
  owner?: string;
  status?: Status;
}>();
const issueService = new IssueService();

// Reactive state
const title = ref('');
const description = ref('');
const visible = ref(false);
const issues = ref<IssueItem[]>([]);
const issuesByStatusOpen = ref<IssueItem[]>([]);
const myIssues = ref<IssueItem[]>([]);

// Open dialog
const openCreateIssueDialog = () => {
  title.value = '';
  description.value = '';
  visible.value = true;
};

// Create a new issue
const createIssue = async () => {
  try {
    const newIssue = await issueService.createIssue(props.projectId, {
      title: title.value,
      description: description.value,
      ownerId: props.owner,
      type: ISSUE_TYPE_TASK,
      status: ISSUE_STATUS_OPEN,
    });
    console.log('New issue created:', newIssue);
    visible.value = false;

    // Reload issues based on context
    if (props.owner) {
      loadMyIssues();
    } else if (props.status === ISSUE_STATUS_OPEN) {
      loadIssuesWithOpenStatus();
    } else {
      loadIssues();
    }
  } catch (error) {
    console.error('Error creating issue:', error);
  }
};

// Load all issues
const loadIssues = async () => {
  try {
    const issueList = await issueService.getIssues(props.projectId);
    issues.value = issueList.issues || [];
  } catch (err) {
    console.error(err);
  }
};

// Load only open issues
const loadIssuesWithOpenStatus = async () => {
  try {
    const issueList = await issueService.getIssues(props.projectId, ISSUE_STATUS_OPEN);
    issuesByStatusOpen.value = issueList.issues || [];
  } catch (err) {
    console.error(err);
  }
};

// Load issues assigned to current owner
const loadMyIssues = async () => {
  try {
    const issueList = await issueService.getIssues(props.projectId, undefined, props.owner);
    myIssues.value = issueList.issues || [];
  } catch (err) {
    console.error(err);
  }
};

// Load data on mount
onMounted(() => {
  loadIssues();
  loadIssuesWithOpenStatus();
  loadMyIssues();
});

// Reload when props change
watch(
  () => props,
  () => {
    loadIssues();
    loadIssuesWithOpenStatus();
    loadMyIssues();
  },
  { deep: true }
);
</script>

<template>
  <main>
    <div class="header">
      <div v-if="props.owner">
        <h2>Meine Issues</h2>
      </div>
      <div v-else-if="props.status">
        <h2>Offene Issues</h2>
      </div>
      <div v-else>
        <h2>Alle Issues</h2>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <!-- Create Issue Dialog -->
      <Dialog
        v-model:visible="visible"
        modal
        header="Issue erstellen"
        :style="{ width: '50rem' }"
      >
        <div class="flex items-center gap-6 mb-6">
          <label for="title" class="font-semibold w-24">Titel</label>
          <InputText id="title" v-model="title" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-6 mb-20">
          <label for="description" class="font-semibold w-24">Beschreibung</label>
          <InputText id="description" v-model="description" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" label="Abbrechen" severity="secondary" @click="visible = false" />
          <Button type="button" label="Erstellen" @click="createIssue" />
        </div>
      </Dialog>

      <!-- Issues Table -->
      <div class="issue-list-wrapper">
        <div v-if="props.owner">
          <IssueTable :issues="myIssues">
            <Button label="Issue erstellen" class="my-btn" @click="openCreateIssueDialog" />
          </IssueTable>
        </div>
        <div v-else-if="props.status">
          <IssueTable :issues="issuesByStatusOpen" />
        </div>
        <div v-else>
          <IssueTable :issues="issues">
            <Button label="Issue erstellen" class="my-btn" @click="openCreateIssueDialog" />
          </IssueTable>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.header {
  text-align: left;
  margin: 20px 0;
}

.grid {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.issue-list-wrapper {
  margin-top: 50px;
  width: 100%;
}

.card {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin: 20px 0;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.button-wrapper button {
  width: 300px;
}

.my-btn {
  padding: 10px 50px;
}
</style>
