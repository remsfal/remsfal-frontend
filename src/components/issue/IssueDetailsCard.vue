<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import MemberAutoComplete from '@/components/MemberAutoComplete.vue';
import { issueService, type IssueJson, type IssueType } from '@/services/IssueService';
import { projectMemberService, type ProjectMemberJson } from '@/services/ProjectMemberService';
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
    status: IssueJson["status"];
    assigneeId: string;
    reporter: string;
    project: string;
    issueType: IssueJson["type"];
    tenancy: string;
  };
}>();

const emit = defineEmits<{ saved: [] }>();

/* =========================
     Services & Store
  ========================= */
const toast = useToast();
const projectStore = useProjectStore();
const { t } = useI18n();

/* =========================
     Local State
  ========================= */
const issueId = ref(props.initialData.issueId);
const title = ref(props.initialData.title);
const status = ref(props.initialData.status);
const assigneeId = ref(props.initialData.assigneeId);
const reporter = ref(props.initialData.reporter);
const project = ref(props.initialData.project);
const issueType = ref(props.initialData.issueType);
const tenancy = ref(props.initialData.tenancy);

// Member data for name resolution
const members = ref<ProjectMemberJson[]>([]);
const loadingMembers = ref(false);

/* =========================
     Original Values (change detection)
  ========================= */
const originalTitle = ref(title.value);
const originalStatus = ref(status.value);
const originalAssigneeId = ref(assigneeId.value);
const originalIssueType = ref(issueType.value);
const originalTenancy = ref(tenancy.value);

/* =========================
     Change Detection
  ========================= */

const canSave = computed(() =>
  title.value !== originalTitle.value ||
  status.value !== originalStatus.value ||
  assigneeId.value !== originalAssigneeId.value ||
  issueType.value !== originalIssueType.value ||
  tenancy.value !== originalTenancy.value
);

// Resolve reporter name from ID
const reporterName = computed(() => {
  if (!reporter.value) return t('issueDetails.fields.noReporter');
  const member = members.value.find(m => m.id === reporter.value);
  return member ? member.name : reporter.value; // Fallback to ID if not found
});
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
  { label: 'Task', value: 'TASK' as IssueType },
  { label: 'Application', value: 'APPLICATION' as IssueType },
  { label: 'Defect', value: 'DEFECT' as IssueType },
  { label: 'Maintenance', value: 'MAINTENANCE' as IssueType },
];

/* =========================
     Fetch Members
  ========================= */
// Fetch project members for name resolution
const fetchMembers = async () => {
  loadingMembers.value = true;
  try {
    const memberList = await projectMemberService.getMembers(props.projectId);
    // TEMP FIX: Handle nested response structure
    members.value = (memberList as { members: ProjectMemberJson[] }).members || [];
  } catch (error) {
    console.error('Failed to fetch members:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.membersFetchError'),
      life: 3000,
    });
  } finally {
    loadingMembers.value = false;
  }
};

// Load members on mount
onMounted(() => {
  fetchMembers();
});

/* =========================
     Watch props updates
  ========================= */
watch(
  () => props.initialData,
  (newData) => {
    issueId.value = newData.issueId;
    title.value = newData.title;
    status.value = newData.status;
    assigneeId.value = newData.assigneeId;
    reporter.value = newData.reporter;
    project.value = newData.project;
    issueType.value = newData.issueType;
    tenancy.value = newData.tenancy;

    originalTitle.value = newData.title;
    originalStatus.value = newData.status;
    originalAssigneeId.value = newData.assigneeId;
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
    const payload: Partial<IssueJson> = {};
    if (title.value !== originalTitle.value) payload.title = title.value;
    if (status.value !== originalStatus.value)
      payload.status = status.value as IssueJson["status"];
    if (assigneeId.value !== originalAssigneeId.value)
      payload.assigneeId = assigneeId.value;
    if (issueType.value !== originalIssueType.value)
      payload.type = issueType.value as IssueJson["type"];

    await issueService.updateIssue(props.issueId, payload);

    originalTitle.value = title.value;
    originalStatus.value = status.value;
    originalAssigneeId.value = assigneeId.value;
    originalIssueType.value = issueType.value;
    originalTenancy.value = tenancy.value;
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
            <label class="text-sm text-gray-600">{{ t('issueDetails.fields.reporter') }}</label>
            <InputText
              :modelValue="reporterName"
              disabled
              :placeholder="t('issueDetails.fields.noReporter')"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label class="text-sm text-gray-600">{{ t('issueDetails.fields.assignee') }}</label>
            <MemberAutoComplete
              v-model="assigneeId"
              :projectId="projectId"
              :placeholder="t('issueDetails.fields.selectAssignee')"
              :disabled="loadingMembers"
            />
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
