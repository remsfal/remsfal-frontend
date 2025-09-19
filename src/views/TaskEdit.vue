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
  editing?: string | null;
}
const route = useRoute();
const router = useRouter();
const taskService = new TaskService();
const task = ref<Task | null>(null);
const originalTask = ref<Task | null>(null);
const errors = ref<{ [key: string]: string }>({});
const loading = ref(false);
const statusOptions = ['PENDING', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'REJECTED'];
const isExpanded = ref(false);
const toggleExpansion = () => {
  isExpanded.value = !isExpanded.value;
};

const validateTask = (): boolean => {
  errors.value = {};
  if (!task.value?.title || task.value.title.trim() === '') {
    errors.value.title = '\n\n- Name muss gegeben  sein.';
  }
  if (!task.value?.description || task.value.description.trim() === '') {
    errors.value.description = '\n\n- Beschreibung muss gegeben sein.';
  }
  if (!task.value?.status || task.value.status.trim() === '') {
    errors.value.status = '\n\n- Status muss gegeben sein.';
  }

  return Object.keys(errors.value).length === 0;
};

const startEditing = (row: Task, field: string) => {
  row.editing = field;
  nextTick(() => {
    const inputElement = document.querySelector('.editable-input') as HTMLElement | null;
    inputElement?.focus();
  });
};

const stopEditing = (row: Task) => {
  row.editing = null;
};

onMounted(async () => {
  loading.value = true;
  try {
    const projectId = route.params.projectId as string;
    const taskid = route.params.taskid as string;
    task.value = await taskService.getTask(projectId, taskid);

    if (task.value) {
      task.value.ownerId = task.value.ownerId || 'Nicht angegeben';
      task.value.blockedBy = task.value.blockedBy || 'Nicht angegeben';
      task.value.duplicateOf = task.value.duplicateOf || 'Nicht angegeben';
      task.value.relatedTo = task.value.relatedTo || 'Nicht angegeben';

      // Originalwerte speichern
      originalTask.value = JSON.parse(JSON.stringify(task.value));
    }
  } catch (error) {
    alert(
      'Aufgabe konnte nicht geladen werden: ' +
        error +
        '\n\nBitte überprüfen Sie, ob Sie eingeloggt sind.',
    );
  } finally {
    loading.value = false;
  }
});

const saveTask = async () => {
  if (!task.value) return;

  // Prüfen, ob Änderungen vorgenommen wurden
  if (
    originalTask.value &&
    task.value.title === originalTask.value.title &&
    task.value.description === originalTask.value.description &&
    task.value.status === originalTask.value.status &&
    task.value.ownerId === originalTask.value.ownerId
  ) {
    alert('Keine Änderungen zum Speichern vorhanden.');
    return;
  }

  // Validierung der Eingabedaten
  if (!validateTask()) {
    const errorMessages = Object.keys(errors.value).map((key) => ` ${errors.value[key]}`);
    alert(`Fehler beim Speichern, weil folgende Daten fehlen:${errorMessages}`);
    return;
  }

  try {
    const projectId = route.params.projectId as string;
    const taskid = route.params.taskid as string;

    await taskService.modifyTask(
      projectId,
      taskid,
      task.value.title,
      task.value.description,
      task.value.status,
      task.value.ownerId,
    );
    originalTask.value = JSON.parse(JSON.stringify(task.value));

    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      alert('Die Aufgabe wurde erfolgreich gespeichert!');
    }, 3000);
  } catch (error) {
    alert('Aufgabe konnte nicht gespeichert werden !: ' + error);
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
          <Column field="blockedBy" header="Blockiert von">
            <template #body="slotProps">
              <div class="static-cell">
                {{ slotProps.data.blockedBy || 'Nicht angegeben' }}
              </div>
            </template>
          </Column>
          <Column field="duplicateOf" header="Duplikat von">
            <template #body="slotProps">
              <div class="static-cell">
                {{ slotProps.data.duplicateOf || 'Nicht angegeben' }}
              </div>
            </template>
          </Column>
          <Column field="relatedTo" header="Verwandt mit">
            <template #body="slotProps">
              <div class="static-cell">
                {{ slotProps.data.relatedTo || 'Nicht angegeben' }}
              </div>
            </template>
          </Column>
        </template>
      </DataTable>
      <!-- Umschalt-Button -->
      <div style="display: flex; justify-content: flex-end; margin-top: 10px">
        <Button class="toggle-button" @click="toggleExpansion">
          {{ isExpanded ? 'Weniger Details' : 'Mehr Details' }}
        </Button>
      </div>
      <!-- Lade-Kringel -->
      <div v-if="loading" style="text-align: center; margin-top: 20px">
        <p>Loading...</p>
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
