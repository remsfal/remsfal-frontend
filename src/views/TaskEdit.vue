<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { taskService, type TaskDetail } from '@/services/TaskService';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const task = ref<TaskDetail | null>(null);
const originalTask = ref<TaskDetail | null>(null);
const errors = ref<{ [key: string]: string }>({});
const loading = ref(false);
const isExpanded = ref(false);

const statusOptions = ['PENDING', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'REJECTED'] as const;
type Status = (typeof statusOptions)[number];

const toggleExpansion = () => {
  isExpanded.value = !isExpanded.value;
};

const validateTask = (): boolean => {
  errors.value = {};
  if (!task.value?.title?.trim()) errors.value.title = '\n\n- Name muss gegeben sein.';
  if (!task.value?.description?.trim())
    errors.value.description = '\n\n- Beschreibung muss gegeben sein.';
  if (!task.value?.status?.trim()) errors.value.status = '\n\n- Status muss gegeben sein.';
  return Object.keys(errors.value).length === 0;
};

const startEditing = (row: TaskDetail, field: keyof TaskDetail) => {
  (row as any).editing = field;
  nextTick(() => {
    const inputElement = document.querySelector('.editable-input') as HTMLElement | null;
    inputElement?.focus();
  });
};

const stopEditing = (row: TaskDetail) => {
  (row as any).editing = null;
};

onMounted(async () => {
  loading.value = true;
  try {
    const projectId = route.params.projectId as string;
    const taskId = route.params.taskid as string;
    task.value = await taskService.getTask(projectId, taskId);
    if (task.value) originalTask.value = JSON.parse(JSON.stringify(task.value));
  } catch (error) {
    alert(`Aufgabe konnte nicht geladen werden: ${error}`);
  } finally {
    loading.value = false;
  }
});

const saveTask = async () => {
  if (!task.value) return;

  if (originalTask.value && JSON.stringify(task.value) === JSON.stringify(originalTask.value)) {
    alert('Keine Änderungen zum Speichern vorhanden.');
    return;
  }

  if (!validateTask()) {
    const errorMessages = Object.values(errors.value).join('');
    alert(`Fehler beim Speichern, weil folgende Daten fehlen:${errorMessages}`);
    return;
  }

  try {
    const projectId = route.params.projectId as string;
    const taskId = route.params.taskid as string;
    const body: Partial<TaskDetail> = {
      title: task.value.title,
      description: task.value.description,
      status: task.value.status,
      ownerId: task.value.ownerId,
    };

    await taskService.modifyTask(projectId, taskId, body);
    originalTask.value = JSON.parse(JSON.stringify(task.value));
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      alert('Die Aufgabe wurde erfolgreich gespeichert!');
    }, 3000);
  } catch (error) {
    alert(`Aufgabe konnte nicht gespeichert werden: ${error}`);
  }
};
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

        <!-- Erweiterbare Felder -->
        <template v-if="isExpanded">
          <Column field="createdAt" header="Erstellt am" />
          <Column field="modifiedAt" header="Geändert am" />
          <Column field="blockedBy" header="Blockiert von" />
          <Column field="duplicateOf" header="Duplikat von" />
          <Column field="relatedTo" header="Verwandt mit" />
        </template>
      </DataTable>

      <!-- Umschalt-Button -->
      <div style="display: flex; justify-content: flex-end; margin-top: 10px">
        <Button class="toggle-button" @click="toggleExpansion">
          {{ isExpanded ? 'Weniger Details' : 'Mehr Details' }}
        </Button>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Keine Aufgabe gefunden.</p>
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
