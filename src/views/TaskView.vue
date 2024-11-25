<script setup lang="ts">
import { ref, onMounted, watch, defineProps } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import TaskService, { Status, type TaskItem } from '@/services/TaskService';

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

const createTask = () => {
  const projectId = props.projectId;

  taskService
    .createTask(projectId, title.value, description.value)
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
      tasks.value = tasklist.tasks;
    })
    .catch((error) => {
      console.error('Error loading tasks:', error);
    });
};

onMounted(() => {
  loadTasks();
});

watch(
  () => props,
  () => {
    loadTasks();
  },
);

/*const ownerTasks = computed(() => {
  const ownerId = props.owner || '';
  return tasks.value.filter((task) => task.owner === ownerId);
});*/

/*const openTasks = computed(() => {
  return tasks.value.filter((task) => task.status === Status.OPEN);
});*/
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

    <div class="grid">
      <div class="card button-wrapper">
        <Button label="Aufgabe erstellen" @click="visible = true" />
      </div>
      <Dialog
        v-model:visible="visible"
        modal
        header="Aufgabe erstellen"
        :style="{ width: '50rem' }"
      >
        <div class="flex items-center gap-4 mb-4">
          <label for="title" class="font-semibold w-24">Titel</label>
          <InputText id="title" v-model="title" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
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
          <p>Dies sind meine Aufgaben. Meine Id: {{ owner }}</p>
        </div>
        <div v-else-if="status">
          <p>Das sind alle offenen Aufgaben. Status: {{ status }}</p>
        </div>
        <div v-else>
          <p>Dies sind alle Aufgaben für das Projekt: {{ projectId }}.</p>
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
</style>
