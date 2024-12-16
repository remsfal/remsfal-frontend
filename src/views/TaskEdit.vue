<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TaskService from '@/services/TaskService';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  ownerId: string;
  createdAt: string;
  modifiedAt: string;
  blockedBy: string;
  duplicateOf: string;
  relatedTo: string;
}

const route = useRoute();
const router = useRouter();
const taskService = new TaskService();
const task = ref<Task | null>(null);
const loading = ref(false);
const statusOptions = ['PENDING', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'REJECTED'];

const startEditing = (row: any, field: string) => {
  row.editing = field;
  nextTick(() => {
    const inputElement = document.querySelector('.editable-input') as HTMLElement | null;
    inputElement?.focus();
  });
};

const stopEditing = (row: any) => {
  row.editing = null;
};

const fetchTask = async () => {
  loading.value = true;
  try {
    const projectId = route.params.projectId as string;
    const taskId = route.params.taskId as string;
    task.value = await taskService.getTask(projectId, taskId);
  } catch (error) {
    console.error('Error fetching task:', error);
  } finally {
    loading.value = false;
  }
};

const saveTask = async () => {
  if (!task.value) return;

  try {
    const projectId = route.params.projectId as string;
    const taskId = route.params.taskId as string;

    await taskService.modifyTask(
      projectId,
      taskId,
      task.value.title,
      task.value.description,
      task.value.status,
    );

    alert('Die Aufgabe wurde erfolgreich gespeichert!');

    location.reload();
  } catch (error) {
    console.error('Error saving task:', error);
    alert('Failed to save task!');
  }
};

onMounted(fetchTask);
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="task">
    <div class="header-buttons">
      <Button label="Zurück" icon="pi pi-arrow-left" @click="router.go(-1)" />
      <Button
        label="Speichern"
        icon="pi pi-check"
        class="save-button"
        style="float: right; margin-bottom: 10px"
        @click="saveTask"
      />
    </div>
    <h1>Aufgabe bearbeiten</h1>

    <div class="table-wrapper">
      <DataTable :value="[task]" responsiveLayout="scroll">
        <Column field="title" header="Name">
          <template #body="slotProps">
            <div
              v-if="slotProps.data.editing !== 'title'"
              class="editable-cell"
              @click="startEditing(slotProps.data, 'title')"
            >
              {{ slotProps.data.title || 'Click to edit' }}
            </div>
            <input
              v-else
              v-model="slotProps.data.title"
              type="text"
              class="editable-input"
              required
              @blur="stopEditing(slotProps.data)"
            />
          </template>
        </Column>
        <Column field="description" header="Beschreibung">
          <template #body="slotProps">
            <div
              v-if="slotProps.data.editing !== 'description'"
              class="editable-cell"
              @click="startEditing(slotProps.data, 'description')"
            >
              {{ slotProps.data.description || 'Click to edit' }}
            </div>
            <textarea
              v-else
              v-model="slotProps.data.description"
              class="editable-input"
              required
              @blur="stopEditing(slotProps.data)"
            ></textarea>
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="slotProps">
            <div
              v-if="slotProps.data.editing !== 'status'"
              class="editable-cell"
              @click="startEditing(slotProps.data, 'status')"
            >
              {{ slotProps.data.status || 'Click to edit' }}
            </div>
            <select
              v-else
              v-model="slotProps.data.status"
              class="editable-input"
              @blur="stopEditing(slotProps.data)"
            >
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </template>
        </Column>
        <Column field="ownerId" header="Owner" />
        <Column field="createdAt" header="Erstellt am" />
        <Column field="modifiedAt" header="Geändert am" />
        <Column field="blockedBy" header="Blockiert von" />
        <Column field="duplicateOf" header="Duplikat von" />
        <Column field="relatedTo" header="Verwandt mit" />
      </DataTable>
    </div>
  </div>
  <div v-else>
    <p>Task not found.</p>
  </div>
</template>

<style>
.header-buttons {
  margin-bottom: 20px;
}

.table-wrapper {
  overflow-x: auto;
  white-space: nowrap;
}
</style>