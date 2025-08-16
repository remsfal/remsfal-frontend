<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { TaskService } from '@/services/TaskService';
import type { Status, TaskItem } from '@/services/TaskService';
import TaskTable from '@/components/TaskTable.vue';

const props = defineProps<{
  projectId: string;
  owner?: string;
  status?: Status;
}>();
const taskService = new TaskService();
const title = ref<string>('');
const description = ref<string>('');
const visible = ref<boolean>(false);
const tasks = ref<TaskItem[]>([]);
const taskbyStatusOpen = ref<TaskItem[]>([]);
const myTasks = ref<TaskItem[]>([]);

const createTask = () => {
  const projectId = props.projectId;

  taskService
    .createTask(projectId, {
      title: title.value,
      description: description.value,
      ownerId: props.owner,
    })
    .then((newTask) => {
      console.log('New task created:', newTask);
      visible.value = false;
      loadTasks();
    })
    .catch((error) => {
      console.error('Error creating task:', error);
    });
};

const loadTasks = () => {
  const projectId = props.projectId;
  taskService
    .getTasks(projectId)
    .then((tasklist) => {
      tasks.value = (tasklist as { tasks: TaskItem[] }).tasks;
    })
    .catch((error) => {
      console.error('Error loading tasks:', error);
    });
};

const loadTaskswithOpenStatus = () => {
  const projectId = props.projectId;
  taskService
    .getTasks(projectId, 'OPEN')
    .then((tasklist) => {
      taskbyStatusOpen.value = (tasklist as { tasks: TaskItem[] }).tasks;
    })
    .catch((error) => {
      console.error('Error loading tasks:', error);
    });
};

const loadMyTasks = () => {
  const projectId = props.projectId;
  taskService
    .getTasks(projectId, null, props.owner)
    .then((tasklist) => {
      myTasks.value = (tasklist as { tasks: TaskItem[] }).tasks;
    })
    .catch((error) => {
      console.error('Error loading tasks:', error);
    });
};

onMounted(() => {
  loadTasks();
  loadTaskswithOpenStatus();
  loadMyTasks();
});

watch(
  () => props,
  () => {
    loadTasks();
    loadTaskswithOpenStatus();
    loadMyTasks();
  },
);
</script>

<template>
  <main>
    <div class="header">
      <div v-if="owner">
        <h2>Meine Aufgaben</h2>
      </div>
      <div v-else-if="status">
        <h2>Offene Aufgaben</h2>
      </div>
      <div v-else>
        <h2>Alle Aufgaben</h2>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <Dialog
        v-model:visible="visible"
        modal
        header="Aufgabe erstellen"
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
          <Button type="button" label="Erstellen" @click="createTask" />
        </div>
      </Dialog>

      <div class="task-list-wrapper">
        <div v-if="owner">
          <TaskTable :tasks="myTasks">
            <Button label="Aufgabe erstellen" class="my-btn" @click="visible = true" />
          </TaskTable>
        </div>
        <div v-else-if="status">
          <TaskTable :tasks="taskbyStatusOpen"> </TaskTable>
        </div>
        <div v-else>
          <TaskTable :tasks="tasks">
            <Button label="Aufgabe erstellen" class="my-btn" @click="visible = true" />
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

.task-list-wrapper {
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
