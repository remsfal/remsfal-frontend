<script setup lang="ts">
import { ref, onMounted, computed, watch, defineEmits, defineProps } from 'vue';
import TaskService, { Status, type TaskItem } from '@/services/TaskService';

const taskService = new TaskService();
const title = ref<string>("");
const description = ref<string>("");
const blockedBy = ref<string>("");
const relatedTo = ref<string>("");
const visible = ref<boolean>(false);
const tasks = ref<TaskItem[]>([]);

const props = defineProps<{
  projectId: string;
  owner?: string;
  status?: Status;
}>();

const createTask = () => {
  const projectId = props.projectId;
  const ownerId = props.owner || "";

  taskService.createTask(projectId, title.value, description.value, ownerId, blockedBy.value, relatedTo.value)
      .then((newTask) => {
        console.log("New task created:", newTask);
        visible.value = false;
        loadTasks();
      })
      .catch((error) => {
        console.error("Error creating task:", error);
      });
};

const loadTasks = () => {
  const projectId = props.projectId;

  taskService.getTasks(projectId)
      .then((tasklist) => {
        tasks.value = tasklist.tasks;
      })
      .catch((error) => {
        console.error("Error loading tasks:", error);
      });
};

onMounted(() => {
  loadTasks();
});

watch(() => props, () => {
  loadTasks();
});

// Computed Property zum Filtern der Aufgaben nach ownerId
const ownerTasks = computed(() => {
  const ownerId = props.owner || "";
  return tasks.value.filter(task => task.owner === ownerId);
});

// Computed Property zum Filtern der Aufgaben nach Status.OPEN
const openTasks = computed(() => {
  return tasks.value.filter(task => task.status === Status.OPEN);
});
</script>

<template>
  <main>
    <div class="grid">
      <div class="card flex justify-center">
        <Button label="Aufgabe erstellen" @click="visible = true"/>
        <Dialog v-model:visible="visible" modal header="Aufgabe erstellen" :style="{ width: '50rem' }">
          <div class="flex items-center gap-4 mb-4">
            <label for="title" class="font-semibold w-24">Titel</label>
            <InputText id="title" class="flex-auto" v-model="title" autocomplete="off"/>
          </div>
          <div class="flex items-center gap-4 mb-8">
            <label for="description" class="font-semibold w-24">Beschreibung</label>
            <InputText id="description" class="flex-auto" v-model="description" autocomplete="off"/>
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" label="Abbrechen" severity="secondary" @click="visible = false"/>
            <Button type="button" label="Erstellen" @click="createTask"/>
          </div>
        </Dialog>
      </div>

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
.task-list-wrapper {
  margin-top: 50px;
}
</style>