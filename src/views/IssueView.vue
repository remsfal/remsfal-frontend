<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { IssueService, ISSUE_TYPE_TASK, ISSUE_STATUS_OPEN, type Status, type IssueItem } from '@/services/IssueService.ts';
import TaskTable from '@/components/TaskTable.vue';

const props = defineProps<{
  projectId: string;
  owner?: string;
  status?: Status;
}>();
const issueService = new IssueService();
const title = ref<string>('');
const description = ref<string>('');
const visible = ref<boolean>(false);
const issues = ref<IssueItem[]>([]);
const issuesByStatusOpen = ref<IssueItem[]>([]);
const myIssues = ref<IssueItem[]>([]);

const createIssue = () => {
  const projectId = props.projectId;

  issueService.createIssue(projectId, {
    title: title.value,
    description: description.value,
    ownerId: props.owner,
    type: ISSUE_TYPE_TASK,
    status: ISSUE_STATUS_OPEN,
  })
  .then((newIssue) => {
    console.log('New issue created:', newIssue);
    visible.value = false;

    if (props.owner) {
      loadMyIssues();
    } else if (props.status === ISSUE_STATUS_OPEN) {
      loadIssuesWithOpenStatus();
    } else {
      loadIssues();
    }
  })
  .catch((error) => {
    console.error('Error creating issue:', error);
  });
};

const openCreateIssueDialog = () => {
  title.value = '';
  description.value = '';
  visible.value = true;
};

const loadIssues = () => {
  const projectId = props.projectId;
  issueService.getIssues(projectId)
    .then((issueList) => {
      issues.value = issueList.issues || [];
    })
    .catch(console.error);
};

const loadIssuesWithOpenStatus = () => {
  const projectId = props.projectId;
  issueService.getIssues(projectId, ISSUE_STATUS_OPEN)
    .then((issueList) => {
      issuesByStatusOpen.value = issueList.issues || [];
    })
    .catch(console.error);
};

const loadMyIssues = () => {
  const projectId = props.projectId;
  issueService.getIssues(projectId, undefined, props.owner)
    .then((issueList) => {
      myIssues.value = issueList.issues || [];
    })
    .catch(console.error);
};

onMounted(() => {
  loadIssues();
  loadIssuesWithOpenStatus();
  loadMyIssues();
});

watch(
  () => props,
  () => {
    loadIssues();
    loadIssuesWithOpenStatus();
    loadMyIssues();
  },
);
</script>

<template>
  <main>
    <div class="header">
      <div v-if="owner">
        <h2>Meine Issues</h2>
      </div>
      <div v-else-if="status">
        <h2>Offene Issues</h2>
      </div>
      <div v-else>
        <h2>Alle Issues</h2>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
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

      <div class="issue-list-wrapper">
        <div v-if="owner">
          <TaskTable :tasks="myIssues">
            <Button label="Issue erstellen" class="my-btn" @click="openCreateIssueDialog" />
          </TaskTable>
        </div>
        <div v-else-if="status">
          <TaskTable :tasks="issuesByStatusOpen"> </TaskTable>
        </div>
        <div v-else>
          <TaskTable :tasks="issues">
            <Button label="Issue erstellen" class="my-btn" @click="openCreateIssueDialog" />
          </TaskTable>
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
