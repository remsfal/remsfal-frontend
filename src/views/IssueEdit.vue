<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IssueService, type Issue } from '@/services/IssueService.ts';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const issue = ref<Issue | null>(null);
const originalIssue = ref<Issue | null>(null);
const errors = ref<{ [key: string]: string }>({});
const loading = ref(false);
const isExpanded = ref(false);

const statusOptions = ['PENDING', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'REJECTED'] as const;

const toggleExpansion = () => {
  isExpanded.value = !isExpanded.value;
};

const validateIssue = (): boolean => {
  errors.value = {};
  if (!issue.value?.title?.trim()) errors.value.title = '\n\n- Name muss gegeben sein.';
  if (!issue.value?.description?.trim())
    errors.value.description = '\n\n- Beschreibung muss gegeben sein.';
  if (!issue.value?.status?.trim()) errors.value.status = '\n\n- Status muss gegeben sein.';
  return Object.keys(errors.value).length === 0;
};

const startEditing = (row: Issue & { editing?: keyof Issue }, field: keyof Issue) => {
  row.editing = field;
  nextTick(() => {
    const inputElement = document.querySelector('.editable-input') as HTMLElement | null;
    inputElement?.focus();
  });
};

const stopEditing = (row: Issue) => {
  (row as any).editing = null;
};
const issueService = new IssueService();

onMounted(async () => {
  loading.value = true;
  try {
    const projectId = route.params.projectId as string;
    const issueId = route.params.issueId as string;
    issue.value = await issueService.getIssue(projectId, issueId);
    if (issue.value) originalIssue.value = JSON.parse(JSON.stringify(issue.value));
  } catch (error) {
    alert(`Issue konnte nicht geladen werden: ${error}`);
  } finally {
    loading.value = false;
  }
});

const saveIssue = async () => {
  if (!issue.value) return;

  if (originalIssue.value && JSON.stringify(issue.value) === JSON.stringify(originalIssue.value)) {
    alert('Keine Änderungen zum Speichern vorhanden.');
    return;
  }

  if (!validateIssue()) {
    const errorMessages = Object.values(errors.value).join('');
    alert(`Fehler beim Speichern, weil folgende Daten fehlen:${errorMessages}`);
    return;
  }

  try {
    const projectId = route.params.projectId as string;
    const issueId = route.params.issueId as string;
    const body: Partial<Issue> = {
      title: issue.value.title,
      description: issue.value.description,
      status: issue.value.status,
      ownerId: issue.value.ownerId,
    };

    await issueService.modifyIssue(projectId, issueId, body);
    originalIssue.value = JSON.parse(JSON.stringify(issue.value));
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      alert('Das Issue wurde erfolgreich gespeichert!');
    }, 3000);
  } catch (error) {
    alert(`Issue konnte nicht gespeichert werden: ${error}`);
  }
};
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="issue">
    <div class="header-buttons">
      <Button label="Zurück" icon="pi pi-arrow-left" @click="router.go(-1)" />
      <Button
        label="Speichern"
        icon="pi pi-check"
        class="save-button"
        style="float: right; margin-bottom: 10px"
        @click="saveIssue"
      />
    </div>

    <h1>Issue bearbeiten</h1>

    <div class="table-wrapper">
      <DataTable :value="[issue]" responsiveLayout="scroll">
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

        <template v-if="isExpanded">
          <Column field="createdAt" header="Erstellt am" />
          <Column field="modifiedAt" header="Geändert am" />
          <Column field="blockedBy" header="Blockiert von" />
          <Column field="duplicateOf" header="Duplikat von" />
          <Column field="relatedTo" header="Verwandt mit" />
        </template>
      </DataTable>

      <div style="display: flex; justify-content: flex-end; margin-top: 10px">
        <Button class="toggle-button" @click="toggleExpansion">
          {{ isExpanded ? 'Weniger Details' : 'Mehr Details' }}
        </Button>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Kein Issue gefunden.</p>
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
