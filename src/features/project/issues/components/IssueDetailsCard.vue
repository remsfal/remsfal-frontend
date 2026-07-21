<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import MemberAutoComplete from '@/components/MemberAutoComplete.vue';
import IssueAcceptButton from './IssueAcceptButton.vue';
import IssueRejectButton from './IssueRejectButton.vue';
import { issueService, type IssueJson, type IssueType, type IssueCategory, type IssuePriority } from '@/services/IssueService';
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
    category: IssueJson["category"];
    priority: IssueJson["priority"];
    modifiedAt?: IssueJson["modifiedAt"];
  };
}>();

const emit = defineEmits<{ saved: [] }>();

/* =========================
     Services & Store
  ========================= */
const toast = useToast();
const projectStore = useProjectStore();
const { t, locale } = useI18n();

/* =========================
     Category & Priority Options
  ========================= */
interface CategoryOption {
  value: IssueCategory;
  label: string;
}

const GENERAL_CATEGORY = computed<CategoryOption>(() => ({
  value: 'GENERAL',
  label: t('tenantIssue.categories.GENERAL'),
}));

const DEFECT_CATEGORIES = computed<CategoryOption[]>(() => [
  { value: 'BLOCKED_DRAIN', label: t('tenantIssue.categories.BLOCKED_DRAIN') },
  { value: 'ELECTRICAL_FAULT', label: t('tenantIssue.categories.ELECTRICAL_FAULT') },
  { value: 'FIRE_DAMAGE', label: t('tenantIssue.categories.FIRE_DAMAGE') },
  { value: 'HEATING_SYSTEM_MALFUNCTION', label: t('tenantIssue.categories.HEATING_SYSTEM_MALFUNCTION') },
  { value: 'PEST_INFESTATION', label: t('tenantIssue.categories.PEST_INFESTATION') },
  { value: 'POLLUTION_INSIDE_BUILDING', label: t('tenantIssue.categories.POLLUTION_INSIDE_BUILDING') },
  { value: 'POLLUTION_OUTSIDE_BUILDING', label: t('tenantIssue.categories.POLLUTION_OUTSIDE_BUILDING') },
  { value: 'SANITARY_SYSTEM_DAMAGE', label: t('tenantIssue.categories.SANITARY_SYSTEM_DAMAGE') },
  { value: 'ROLLER_SHUTTER_DAMAGE', label: t('tenantIssue.categories.ROLLER_SHUTTER_DAMAGE') },
  { value: 'WATER_DAMAGE', label: t('tenantIssue.categories.WATER_DAMAGE') },
  GENERAL_CATEGORY.value,
]);

const INQUIRY_CATEGORIES = computed<CategoryOption[]>(() => [
  { value: 'CERTIFICATE_OF_NO_RENT_ARREARS', label: t('tenantIssue.categories.CERTIFICATE_OF_NO_RENT_ARREARS') },
  { value: 'CONFIRMATION_OF_RESIDENCE', label: t('tenantIssue.categories.CONFIRMATION_OF_RESIDENCE') },
  GENERAL_CATEGORY.value,
]);

const MAINTENANCE_CATEGORIES = computed<CategoryOption[]>(() => [
  { value: 'ALARM_SYSTEM_MAINTENANCE', label: t('tenantIssue.categories.ALARM_SYSTEM_MAINTENANCE') },
  { value: 'CHIMNEY_SWEEP_MAINTENANCE', label: t('tenantIssue.categories.CHIMNEY_SWEEP_MAINTENANCE') },
  { value: 'CLEANING_MAINTENANCE', label: t('tenantIssue.categories.CLEANING_MAINTENANCE') },
  { value: 'FIRE_ALARM_MAINTENANCE', label: t('tenantIssue.categories.FIRE_ALARM_MAINTENANCE') },
  { value: 'FIRE_EXTINGUISHER_MAINTENANCE', label: t('tenantIssue.categories.FIRE_EXTINGUISHER_MAINTENANCE') },
  { value: 'GARDEN_MAINTENANCE', label: t('tenantIssue.categories.GARDEN_MAINTENANCE') },
  { value: 'HEATING_MAINTENANCE', label: t('tenantIssue.categories.HEATING_MAINTENANCE') },
  { value: 'PUMP_MAINTENANCE', label: t('tenantIssue.categories.PUMP_MAINTENANCE') },
  { value: 'SNOW_REMOVAL_MAINTENANCE', label: t('tenantIssue.categories.SNOW_REMOVAL_MAINTENANCE') },
  { value: 'TREE_CARE_MAINTENANCE', label: t('tenantIssue.categories.TREE_CARE_MAINTENANCE') },
  GENERAL_CATEGORY.value,
]);

// Full flat list, deduplicated by value, used to resolve a category string back to its option object
const ALL_CATEGORIES = computed<CategoryOption[]>(() => {
  const combined = [
    ...DEFECT_CATEGORIES.value,
    ...INQUIRY_CATEGORIES.value,
    ...MAINTENANCE_CATEGORIES.value,
  ];
  return combined.filter(
    (option, index) => combined.findIndex((other) => other.value === option.value) === index
  );
});

// Categories available for the currently selected Typ
const availableCategories = computed<CategoryOption[]>(() => {
  switch (issueType.value) {
    case 'DEFECT':
      return DEFECT_CATEGORIES.value;
    case 'INQUIRY':
      return INQUIRY_CATEGORIES.value;
    case 'MAINTENANCE':
      return MAINTENANCE_CATEGORIES.value;
    default:
      return [GENERAL_CATEGORY.value];
  }
});

function findCategoryOption(value: IssueCategory | undefined): CategoryOption | null {
  if (!value) return null;
  return ALL_CATEGORIES.value.find((option) => option.value === value) ?? null;
}

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
const category = ref<CategoryOption | null>(findCategoryOption(props.initialData.category));
const priority = ref(props.initialData.priority);
const modifiedAt = ref(props.initialData.modifiedAt);

/* =========================
     Original Values (change detection)
  ========================= */
const originalTitle = ref(title.value);
const originalStatus = ref(status.value);
const originalAssigneeId = ref(assigneeId.value);
const originalIssueType = ref(issueType.value);
const originalTenancy = ref(tenancy.value);
const originalCategory = ref(category.value);
const originalPriority = ref(priority.value);

/* =========================
     Change Detection
  ========================= */

const canSave = computed(() =>
  title.value !== originalTitle.value ||
  status.value !== originalStatus.value ||
  assigneeId.value !== originalAssigneeId.value ||
  issueType.value !== originalIssueType.value ||
  tenancy.value !== originalTenancy.value ||
  category.value?.value !== originalCategory.value?.value ||
  priority.value !== originalPriority.value
);

// Show Accept/Reject actions based on the persisted status, not an unsaved Select edit
const isPending = computed(() => originalStatus.value === 'PENDING');

// Display name for reporter, as provided by the backend
const reporterName = computed(() => reportedBy.value || t('issueDetails.fields.noReporter'));

// Short, human-facing issue number derived from the full issue id
const issueNumber = computed(() => issueId.value?.split('-').pop() || issueId.value || '—');

// Formatted "assigned on" date + time, derived from the read-only modifiedAt field
const modifiedAtLabel = computed(() => {
  if (!modifiedAt.value) return '—';
  const date = new Date(modifiedAt.value);
  if (Number.isNaN(date.getTime())) return modifiedAt.value;
  return date.toLocaleString(locale.value);
});

/* =========================
     Dropdown Options
  ========================= */
const statusOptions = computed(() => [
  { label: t('inbox.filters.status.pending'), value: 'PENDING' },
  { label: t('inbox.filters.status.open'), value: 'OPEN' },
  { label: t('inbox.filters.status.inProgress'), value: 'IN_PROGRESS' },
  { label: t('inbox.filters.status.closed'), value: 'CLOSED' },
  { label: t('inbox.filters.status.rejected'), value: 'REJECTED' },
]);

const typeOptions = computed(() => [
  { label: t('issueType.task'), value: 'TASK' as IssueType },
  { label: t('issueType.application'), value: 'APPLICATION' as IssueType },
  { label: t('issueType.defect'), value: 'DEFECT' as IssueType },
  { label: t('issueType.maintenance'), value: 'MAINTENANCE' as IssueType },
  { label: t('issueType.inquiry'), value: 'INQUIRY' as IssueType },
  { label: t('issueType.termination'), value: 'TERMINATION' as IssueType },
]);

const priorityOptions = computed(() => [
  { label: t('issuePriority.urgent'), value: 'URGENT' as IssuePriority },
  { label: t('issuePriority.high'), value: 'HIGH' as IssuePriority },
  { label: t('issuePriority.medium'), value: 'MEDIUM' as IssuePriority },
  { label: t('issuePriority.low'), value: 'LOW' as IssuePriority },
  { label: t('issuePriority.unclassified'), value: 'UNCLASSIFIED' as IssuePriority },
]);

/* =========================
     AutoComplete Search
  ========================= */
const filteredCategories = ref<CategoryOption[]>([]);

function searchCategories(event: { query: string }) {
  const query = event.query.toLowerCase();
  filteredCategories.value = query
    ? availableCategories.value.filter((option) => option.label.toLowerCase().includes(query))
    : availableCategories.value;
}

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
    category.value = findCategoryOption(newData.category);
    priority.value = newData.priority;
    modifiedAt.value = newData.modifiedAt;

    originalTitle.value = newData.title;
    originalStatus.value = newData.status;
    originalAssigneeId.value = newData.assigneeId;
    originalIssueType.value = newData.issueType;
    originalTenancy.value = newData.tenancy;
    originalCategory.value = category.value;
    originalPriority.value = priority.value;
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
    if (category.value?.value !== originalCategory.value?.value)
      payload.category = category.value?.value as IssueJson["category"];
    if (priority.value !== originalPriority.value)
      payload.priority = priority.value as IssueJson["priority"];

    await issueService.updateIssue(props.issueId, payload);

    originalTitle.value = title.value;
    originalStatus.value = status.value;
    originalAssigneeId.value = assigneeId.value;
    originalIssueType.value = issueType.value;
    originalTenancy.value = tenancy.value;
    originalCategory.value = category.value;
    originalPriority.value = priority.value;
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

/* =========================
     Accept/Reject Sync
  ========================= */
// Applies the IssueJson returned by IssueAcceptButton/IssueRejectButton to local
// and original state, overwriting any unsaved edits in other fields since those
// buttons act immediately on the backend, independent of the Save diff flow.
function applyIssueUpdate(updated: IssueJson) {
  if (updated.title !== undefined) title.value = updated.title;
  if (updated.status !== undefined) status.value = updated.status;
  if (updated.assigneeId !== undefined) assigneeId.value = updated.assigneeId;
  if (updated.type !== undefined) issueType.value = updated.type;
  if (updated.category !== undefined) category.value = findCategoryOption(updated.category);
  if (updated.priority !== undefined) priority.value = updated.priority;
  if (updated.modifiedAt !== undefined) modifiedAt.value = updated.modifiedAt;

  originalTitle.value = title.value;
  originalStatus.value = status.value;
  originalAssigneeId.value = assigneeId.value;
  originalIssueType.value = issueType.value;
  originalCategory.value = category.value;
  originalPriority.value = priority.value;

  emit('saved');
}
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <span class="text-xl font-semibold">{{ title || t('issueDetails.fields.untitled') }}</span>
          <p class="text-base text-gray-500 font-normal mt-1">
            {{ t('issueDetails.fields.ticketNumber') }} {{ issueId || '—' }}
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

        <!-- Issue Number & Reporter -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-number" class="text-sm text-gray-600">{{ t('issueDetails.fields.issueNumber') }}</label>
            <InputText id="issue-number" :modelValue="issueNumber" disabled />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-reporter" class="text-sm text-gray-600">{{ t('issueDetails.fields.reporter') }}</label>
            <InputText
              id="issue-reporter"
              :modelValue="reporterName"
              disabled
              :placeholder="t('issueDetails.fields.noReporter')"
            />
          </div>
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
              @change="category = null"
            />
          </div>
        </div>

        <!-- Category & Priority -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-category" class="text-sm text-gray-600">{{ t('issueDetails.fields.category') }}</label>
            <AutoComplete
              id="issue-category"
              v-model="category"
              :suggestions="filteredCategories"
              optionLabel="label"
              :placeholder="t('issueDetails.fields.categoryPlaceholder')"
              fluid
              dropdown
              forceSelection
              @complete="searchCategories"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-priority" class="text-sm text-gray-600">{{ t('issueDetails.fields.priority') }}</label>
            <Select
              v-model="priority"
              inputId="issue-priority"
              :options="priorityOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('issueDetails.fields.priorityPlaceholder')"
            />
          </div>
        </div>

        <!-- Assignee & Assigned At -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-assignee" class="text-sm text-gray-600">{{ t('issueDetails.fields.assignee') }}</label>
            <MemberAutoComplete
              v-model="assigneeId"
              inputId="issue-assignee"
              :projectId="projectId"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-assigned-at" class="text-sm text-gray-600">{{ t('issueDetails.fields.assignedAt') }}</label>
            <InputText id="issue-assigned-at" :modelValue="modifiedAtLabel" disabled />
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

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-2">
          <IssueAcceptButton v-if="isPending" :issueId="issueId" @accepted="applyIssueUpdate" />
          <IssueRejectButton v-if="isPending" :issueId="issueId" @rejected="applyIssueUpdate" />
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
:deep(.p-dropdown),
:deep(.p-autocomplete-input) {
  border-radius: 0.5rem;
}
</style>
