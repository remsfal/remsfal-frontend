<script setup lang="ts">
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import TaskService from '@/services/TaskService';

const visible = ref(false);
const taskService = new TaskService();
const taskTitle = ref("");

const router = useRouter();
const route = useRoute();

const createTask = () => {
  const projectId = route.params.projectId; // Get project-id from router
  taskService.createTask(projectId, taskTitle.value)
      .then((newTask) => {
        console.log("New task created:", newTask);
        visible.value = false;
      })
      .catch((error) => {
        console.error("Error creating task:", error);
      });
};
</script>

<template>
  <main>
    <div class="grid">
      <div class="card flex justify-center">
        <Button label="Aufgabe erstellen" @click="visible = true"/>
        <Dialog v-model:visible="visible" modal header="Aufgabe erstellen" :style="{ width: '50rem' }">
          <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your information.</span>
          <div class="flex items-center gap-4 mb-4">
            <label for="title" class="font-semibold w-24">Titel</label>
            <InputText id="title" class="flex-auto" v-model="taskTitle" autocomplete="off"/>
          </div>
          <div class="flex items-center gap-4 mb-8">
            <label for="description" class="font-semibold w-24">Beschreibung</label>
            <InputText id="description" class="flex-auto" autocomplete="off"/>
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
            <Button type="button" label="createTask" @click="createTask"></Button>
          </div>
        </Dialog>
      </div>

      <div class="individual-content">
        <p v-if="$route.name === 'MyTasksOverview'">Dies sind meine Aufgaben. meine Id: {{ $route.query.owner }}</p>
        <p v-else-if="$route.name === 'OpenTasksOverview'">Das sind alle offenen Aufgaben. ProjektId: {{ route.params.projectId }}</p>
        <p v-else>Dies sind alle Aufgaben.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.individual-content {
  margin-top: 50px;
}
</style>