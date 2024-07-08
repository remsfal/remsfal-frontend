<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue';
import {useRoute} from 'vue-router';
import TaskService, {Status, type TaskItem} from '@/services/TaskService';

const taskService = new TaskService();
const title = ref("");
const description = ref("");
const blockedBy = ref("");
const relatedTo = ref("");
const visible = ref(false);
const tasks = ref<TaskItem[]>([]);


const route = useRoute();

defineProps<{
  projectId: string;
  owner?: string;
  status?: Status;
}>();

const createTask = () => {
  const projectId = String(route.params.projectId);
  const ownerId = String(route.query.owner);
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
  const projectId = String(route.params.projectId);
  taskService.getTasks(projectId)
      .then((tasklist) => {
        tasks.value = tasklist.tasks;
      })
      .catch((error) => {
        console.error("Error creating task:", error);
      });
};

onMounted(() => {
  loadTasks();
});

watch(route, () => {
  loadTasks();
});

// Computed Property zum Filtern der Aufgaben nach ownerId
const ownerTasks = computed(() => {
  const ownerId = String(route.query.owner);
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
            <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
            <Button type="button" label="createTask" @click="createTask"></Button>
          </div>
        </Dialog>
      </div>

      <div class="individual-content">
        <div v-if="owner">
          <p>Dies sind meine Aufgaben. Meine Id: {{ owner }}</p>
          <ul v-if="ownerTasks.length > 0">
            <li v-for="task in ownerTasks" :key="task.id">
              {{ task.title }} - {{ task.status }}
            </li>
          </ul>
          <p v-else>Keine Aufgaben gefunden.</p>
        </div>
        <div v-else-if="status === Status.OPEN">
          <p>Das sind alle offenen Aufgaben. Status: {{ status }}</p>
          <ul v-if="openTasks.length > 0">
            <li v-for="task in openTasks" :key="task.id">
              {{ task.title }} - {{ task.status }}
            </li>
          </ul>
          <p v-else>Keine offenen Aufgaben gefunden.</p>
        </div>
        <div v-else>
          <p>Dies sind alle Aufgaben für das Projekt {{ projectId }}.</p>
          <ul v-if="tasks.length > 0">
            <li v-for="task in tasks" :key="task.id">
              {{ task.title }} - {{ task.status }}
            </li>
          </ul>
          <p v-else>Keine Aufgaben gefunden.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.individual-content {
  margin-top: 50px;
}
</style>