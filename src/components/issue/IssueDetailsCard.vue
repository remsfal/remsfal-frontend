<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { issueService, type Issue } from '@/services/IssueService';

const props = defineProps<{
  projectId: string;
  issueId: string;
  initialData: {
    issueId: string;
    title: string;
    status: string;
    ownerId: string;
    reporter: string;
    project: string;
    issueType: string;
    tenancy: string;
  };
}>();

const emit = defineEmits<{
  saved: []
}>();

const toast = useToast();
const { t } = useI18n();

/* Local reactive state */
const issueId = ref(props.initialData.issueId);
const title = ref(props.initialData.title);
const status = ref(props.initialData.status);
const ownerId = ref(props.initialData.ownerId);
const reporter = ref(props.initialData.reporter);
const project = ref(props.initialData.project);
const issueType = ref(props.initialData.issueType);
const tenancy = ref(props.initialData.tenancy);

/* Track original values for change detection */
const originalTitle = ref(props.initialData.title);
const originalStatus = ref(props.initialData.status);
const originalOwnerId = ref(props.initialData.ownerId);
const originalProject = ref(props.initialData.project);
const originalIssueType = ref(props.initialData.issueType);
const originalTenancy = ref(props.initialData.tenancy);

/* Select options */
const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const typeOptions = [
  { label: 'Application', value: 'APPLICATION' },
  { label: 'Task', value: 'TASK' },
  { label: 'Defect', value: 'DEFECT' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
];

/* Change detection */
const canSave = computed(() =>
  title.value !== originalTitle.value ||
  status.value !== originalStatus.value ||
  ownerId.value !== originalOwnerId.value ||
  project.value !== originalProject.value ||
  issueType.value !== originalIssueType.value ||
  tenancy.value !== originalTenancy.value
);

/* Loading state */
const loadingSave = ref(false);

/* Watch for prop changes and update local state */
watch(() => props.initialData, (newData) => {
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
  originalProject.value = newData.project;
  originalIssueType.value = newData.issueType;
  originalTenancy.value = newData.tenancy;
}, { deep: true });

/* Save handler */
const handleSave = async () => {
  if (!canSave.value || loadingSave.value) return;

  loadingSave.value = true;
  try {
    // Detect which fields changed
    const changedFields: string[] = [];
    if (title.value !== originalTitle.value) changedFields.push(t('issueDetails.fields.title'));
    if (status.value !== originalStatus.value) changedFields.push(t('issueDetails.fields.status'));
    if (ownerId.value !== originalOwnerId.value) changedFields.push(t('issueDetails.fields.owner'));
    if (project.value !== originalProject.value) changedFields.push(t('issueDetails.fields.project'));
    if (issueType.value !== originalIssueType.value) changedFields.push(t('issueDetails.fields.type'));
    if (tenancy.value !== originalTenancy.value) changedFields.push(t('issueDetails.fields.tenancy'));

    // Build payload with only changed fields
    const payload: Partial<Issue> = {};
    if (title.value !== originalTitle.value) payload.title = title.value;
    if (status.value !== originalStatus.value) payload.status = status.value as Issue['status'];
    if (ownerId.value !== originalOwnerId.value) payload.ownerId = ownerId.value;
    if (issueType.value !== originalIssueType.value) payload.type = issueType.value as Issue['type'];
  
    console.log('Saving issue details:', payload);
    
    // Call backend API
    await issueService.modifyIssue(props.projectId, props.issueId, payload);
    
    // Update reference state after successful save
    originalTitle.value = title.value;
    originalStatus.value = status.value;
    originalOwnerId.value = ownerId.value;
    originalProject.value = project.value;
    originalIssueType.value = issueType.value;
    originalTenancy.value = tenancy.value;

    // Create toast message with changed fields
    const fieldsList = changedFields.join(', ');
    const detailMessage = t('issueDetails.fieldsUpdated', { fields: fieldsList });

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: detailMessage,
      life: 3000,
    });

    // Emit saved event to parent
    emit('saved');
  } catch (error) {
    console.error('Error saving issue details:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.saveError'),
      life: 3000,
    });
  } finally {
    loadingSave.value = false;
  }
};
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <div class="font-semibold text-xl">Issue Details</div>
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
            <InputText v-model="project" />
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
