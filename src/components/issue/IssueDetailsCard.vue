<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { issueService, type Issue, type Type } from '@/services/IssueService';
import { useProjectStore } from '@/stores/ProjectStore';


/* =========================
     Props & Emits
  ========================= */
const props = defineProps<{
  projectId: string;
  issueId: string;
  initialData: {
    issueId: string;
    title: string;
    status: Issue["status"];
    ownerId: string;
    reporter: string;
    project: string;
    issueType: Issue["type"];
    tenancy: string;
  };
}>();

const emit = defineEmits<{ saved: [] }>();

/* =========================
     Services & Store
  ========================= */
const toast = useToast();
const projectStore = useProjectStore();

/* =========================
     Local State
  ========================= */
const issueId = ref(props.initialData.issueId);
const title = ref(props.initialData.title);
const status = ref(props.initialData.status);
const ownerId = ref(props.initialData.ownerId);
const reporter = ref(props.initialData.reporter);
const project = ref(props.initialData.project);
const issueType = ref(props.initialData.issueType);
const tenancy = ref(props.initialData.tenancy);

/* =========================
     Original Values (change detection)
  ========================= */
const originalTitle = ref(title.value);
const originalStatus = ref(status.value);
const originalOwnerId = ref(ownerId.value);
const originalIssueType = ref(issueType.value);
const originalTenancy = ref(tenancy.value);

/* =========================
     Change Detection
  ========================= */

const canSave = computed(() =>
  title.value !== originalTitle.value ||
  status.value !== originalStatus.value ||
  ownerId.value !== originalOwnerId.value ||
  issueType.value !== originalIssueType.value ||
    tenancy.value !== originalTenancy.value
);
console.log("Initial ownerId:", props.initialData.ownerId);
/* =========================
     Dropdown Options
  ========================= */
const statusOptions = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const typeOptions = [
  { label: 'Task', value: 'TASK' as Type },
  { label: 'Application', value: 'APPLICATION' as Type },
  { label: 'Defect', value: 'DEFECT' as Type },
  { label: 'Maintenance', value: 'MAINTENANCE' as Type },
];


/* =========================
     Watch props updates
  ========================= */
watch(
  () => props.initialData,
  (newData) => {
    issueId.value = newData.issueId;
    title.value = newData.title;
    status.value = newData.status;
    ownerId.value = newData.ownerId;
    reporter.value = newData.reporter;
    project.value = newData.project;
    issueType.value = newData.issueType;
    tenancy.value = newData.tenancy;

    originalTitle.value = newData.title;
    originalStatus.value = newData.status;
    originalOwnerId.value = newData.ownerId;
    originalIssueType.value = newData.issueType;
    originalTenancy.value = newData.tenancy;
  },
  { deep: true }
);

/* =========================
     Save Handler
  ========================= */
const loadingSave = ref(false);

const handleSave = async () => {
  if (!canSave.value || loadingSave.value) return;

  loadingSave.value = true;

  try {
    const payload: Partial<Issue> = {};
    if (title.value !== originalTitle.value) payload.title = title.value;
    if (status.value !== originalStatus.value)
      payload.status = status.value as Issue["status"];
    if (ownerId.value !== originalOwnerId.value)
      payload.ownerId = ownerId.value;
    if (issueType.value !== originalIssueType.value)
      payload.type = issueType.value as Issue["type"];

console.log("#######",issueType.value,originalIssueType.value)

    await issueService.modifyIssue(props.projectId, props.issueId, payload);

    originalTitle.value = title.value;
    originalStatus.value = status.value;
    originalOwnerId.value = ownerId.value;
    originalIssueType.value = issueType.value;
    originalTenancy.value = tenancy.value;

console.log("#######",issueType.value)
    toast.add({
      severity: "success",
      summary: "Saved",
      detail: "Issue details updated successfully",
      life: 3000,
    });

    emit("saved");
  } catch (err) {
    console.error(err);
    toast.add({
 severity: 'error', summary: 'Error', detail: 'Failed to save issue details', life: 3000 
});
  } finally {
    loadingSave.value = false;
  }
};
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <div class="font-semibold text-xl">
        Issue Details
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <!-- Issue ID -->
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-600">Issue ID</label>
          <InputText v-model="issueId" disabled />
        </div>

        <!-- Title -->
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-600">Title</label>
          <InputText v-model="title" placeholder="Enter issue title" />
        </div>

        <!-- Status & Type -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm text-gray-600">Status</label>
            <Select
              v-model="status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select status"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm text-gray-600">Type</label>
            <Select
              v-model="issueType"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select type"
            />
          </div>
        </div>

        <!-- Reporter & Owner -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm text-gray-600">Reporter</label>
            <InputText v-model="reporter" disabled />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm text-gray-600">Owner / Assignee</label>
            <InputText v-model="ownerId" placeholder="Enter owner ID" />
          </div>
        </div>

        <!-- Project & Tenancy -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm text-gray-600">Project</label>
            <InputText
              :modelValue="projectStore.selectedProject?.name ?? ''"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm text-gray-600">Tenancy</label>
            <InputText v-model="tenancy" />
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-2">
          <Button
            label="Save"
            icon="pi pi-save"
            :disabled="!canSave || loadingSave"
            :loading="loadingSave"
            @click="handleSave"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-dropdown) {
  border-radius: 0.5rem;
}
</style>
