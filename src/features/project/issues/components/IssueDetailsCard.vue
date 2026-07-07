<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import MemberAutoComplete from '@/components/MemberAutoComplete.vue';
import { issueService, type IssueJson, type IssueType } from '@/services/IssueService';
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
    reportedBy: string;
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
const reportedBy = ref(props.initialData.reportedBy);
const project = ref(props.initialData.project);
const issueType = ref(props.initialData.issueType);
const tenancy = ref(props.initialData.tenancy);

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

// Display name for reporter, as provided by the backend
const reporterName = computed(() => reportedBy.value || t('issueDetails.fields.noReporter'));

/* =========================
     Dropdown Options
  ========================= */
const statusOptions = computed(() => [
  { label: t('inbox.filters.status.open'), value: 'OPEN' },
  { label: t('inbox.filters.status.pending'), value: 'PENDING' },
  { label: t('inbox.filters.status.inProgress'), value: 'IN_PROGRESS' },
  { label: t('inbox.filters.status.closed'), value: 'CLOSED' },
  { label: t('inbox.filters.status.rejected'), value: 'REJECTED' },
]);

const typeOptions = computed(() => [
  { label: t('issueType.task'), value: 'TASK' as IssueType },
  { label: t('issueType.application'), value: 'APPLICATION' as IssueType },
  { label: t('issueType.defect'), value: 'DEFECT' as IssueType },
  { label: t('issueType.maintenance'), value: 'MAINTENANCE' as IssueType },
]);

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
    reportedBy.value = newData.reportedBy;
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
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.saveSuccess'),
      life: 3000,
    });

    emit("saved");
  } catch (err) {
    console.error(err);
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
  <BaseCard>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <span class="text-xl font-semibold">{{ title || t('issueDetails.fields.untitled') }}</span>
          <p class="text-base text-gray-500 font-normal mt-1">
            {{ t('issueDetails.fields.issueId') }} {{ issueId || '—' }}
          </p>
        </div>
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-4 mt-4">
        <!-- Title -->
        <div class="flex flex-col gap-1">
          <label for="issue-title" class="text-sm text-gray-600">{{ t('issueDetails.fields.title') }}</label>
          <InputText id="issue-title" v-model="title" :placeholder="t('issueDetails.fields.titlePlaceholder')" />
        </div>

        <!-- Status & Type -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-status" class="text-sm text-gray-600">{{ t('issueDetails.fields.status') }}</label>
            <Select
              v-model="status"
              inputId="issue-status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('issueDetails.fields.statusPlaceholder')"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-type" class="text-sm text-gray-600">{{ t('issueDetails.fields.type') }}</label>
            <Select
              v-model="issueType"
              inputId="issue-type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('issueDetails.fields.typePlaceholder')"
            />
          </div>
        </div>

        <!-- Reporter & Owner -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-reporter" class="text-sm text-gray-600">{{ t('issueDetails.fields.reporter') }}</label>
            <InputText
              id="issue-reporter"
              :modelValue="reporterName"
              disabled
              :placeholder="t('issueDetails.fields.noReporter')"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-assignee" class="text-sm text-gray-600">{{ t('issueDetails.fields.assignee') }}</label>
            <MemberAutoComplete
              v-model="assigneeId"
              inputId="issue-assignee"
              :projectId="projectId"
            />
          </div>
        </div>

        <!-- Project & Tenancy -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-project" class="text-sm text-gray-600">{{ t('issueDetails.fields.project') }}</label>
            <InputText
              id="issue-project"
              :modelValue="projectStore.selectedProject?.name ?? ''"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-tenancy" class="text-sm text-gray-600">{{ t('issueDetails.fields.tenancy') }}</label>
            <InputText id="issue-tenancy" v-model="tenancy" />
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-2">
          <Button
            :label="t('button.save')"
            icon="pi pi-save"
            :disabled="!canSave || loadingSave"
            :loading="loadingSave"
            @click="handleSave"
          />
        </div>
      </div>
    </template>
  </BaseCard>
</template>

<style scoped>
:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-dropdown) {
  border-radius: 0.5rem;
}
</style>
