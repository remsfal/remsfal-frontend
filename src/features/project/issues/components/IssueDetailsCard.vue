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
import RentalAgreementSelect from '@/features/project/rentalAgreements/components/RentalAgreementSelect.vue';
import IssueAcceptButton from './IssueAcceptButton.vue';
import IssueRejectButton from './IssueRejectButton.vue';
import { issueService, type IssueJson, type IssueStatus, type IssueType, type IssuePriority }
  from '@/services/IssueService';
import { type RentalAgreementItemJson }
  from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { getIssueStatusLabel, getIssueTypeLabel, getIssuePriorityLabel } from '@/features/common/issues/issueLabels';
import {getDefectCategories,
  getInquiryCategories,
  getMaintenanceCategories,
  getGeneralCategory,
  findCategoryOption,
  type CategoryOption,} from '@/features/common/issues/issueCategories';

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
    issueType: IssueJson["type"];
    location: string;
    agreementId: string;
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
const { t, locale } = useI18n();

/* =========================
     Category & Priority Options
  ========================= */
const DEFECT_CATEGORIES = computed<CategoryOption[]>(() => getDefectCategories(t));
const INQUIRY_CATEGORIES = computed<CategoryOption[]>(() => getInquiryCategories(t));
const MAINTENANCE_CATEGORIES = computed<CategoryOption[]>(() => getMaintenanceCategories(t));

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
      return [getGeneralCategory(t)];
  }
});

/* =========================
     Local State
  ========================= */
const issueId = ref(props.initialData.issueId);
const title = ref(props.initialData.title);
const status = ref(props.initialData.status);
const assigneeId = ref(props.initialData.assigneeId);
const reportedBy = ref(props.initialData.reportedBy);
const issueType = ref(props.initialData.issueType);
const location = ref(props.initialData.location);
const category = ref<CategoryOption | null>(findCategoryOption(props.initialData.category, t));
const priority = ref(props.initialData.priority);
const modifiedAt = ref(props.initialData.modifiedAt);

const selectedAgreement = ref<RentalAgreementItemJson | null>(null);

/* =========================
     Original Values (change detection)
  ========================= */
const originalTitle = ref(title.value);
const originalStatus = ref(status.value);
const originalAssigneeId = ref(assigneeId.value);
const originalIssueType = ref(issueType.value);
const originalLocation = ref(location.value);
const originalCategory = ref(category.value);
const originalPriority = ref(priority.value);
const originalSelectedAgreement = ref<RentalAgreementItemJson | null>(null);

/* =========================
     Rental Agreement Resolution
  ========================= */
// RentalAgreementSelect needs the full RentalAgreementItemJson as its v-model,
// but the card only receives the raw agreementId. RentalAgreementSelect already
// loads the full list for its own dropdown, so it resolves the id itself and
// reports the result back here instead of the card fetching a second time.
function onAgreementResolved(agreement: RentalAgreementItemJson | null) {
  selectedAgreement.value = agreement;
  originalSelectedAgreement.value = agreement;
}

/* =========================
     Change Detection
  ========================= */

const canSave = computed(() =>
  title.value !== originalTitle.value ||
  status.value !== originalStatus.value ||
  assigneeId.value !== originalAssigneeId.value ||
  issueType.value !== originalIssueType.value ||
  location.value !== originalLocation.value ||
  selectedAgreement.value?.id !== originalSelectedAgreement.value?.id ||
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
const STATUS_ORDER: IssueStatus[] = ['PENDING', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'REJECTED'];
const statusOptions = computed(() =>
  STATUS_ORDER.map((value) => ({ label: getIssueStatusLabel(value, t), value })));

const TYPE_ORDER: IssueType[] = ['TASK', 'APPLICATION', 'DEFECT', 'MAINTENANCE', 'INQUIRY', 'TERMINATION'];
const typeOptions = computed(() =>
  TYPE_ORDER.map((value) => ({ label: getIssueTypeLabel(value, t), value })));

const PRIORITY_ORDER: IssuePriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'UNCLASSIFIED'];
const priorityOptions = computed(() =>
  PRIORITY_ORDER.map((value) => ({ label: getIssuePriorityLabel(value, t), value })));

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
    issueType.value = newData.issueType;
    location.value = newData.location;
    category.value = findCategoryOption(newData.category, t);
    priority.value = newData.priority;
    modifiedAt.value = newData.modifiedAt;

    originalTitle.value = newData.title;
    originalStatus.value = newData.status;
    originalAssigneeId.value = newData.assigneeId;
    originalIssueType.value = newData.issueType;
    originalLocation.value = newData.location;
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
    if (location.value !== originalLocation.value) payload.location = location.value;
    if (selectedAgreement.value?.id !== originalSelectedAgreement.value?.id)
      payload.agreementId = selectedAgreement.value?.id;
    if (category.value?.value !== originalCategory.value?.value)
      payload.category = category.value?.value as IssueJson["category"];
    if (priority.value !== originalPriority.value)
      payload.priority = priority.value as IssueJson["priority"];

    await issueService.updateIssue(props.issueId, payload);

    originalTitle.value = title.value;
    originalStatus.value = status.value;
    originalAssigneeId.value = assigneeId.value;
    originalIssueType.value = issueType.value;
    originalLocation.value = location.value;
    originalSelectedAgreement.value = selectedAgreement.value;
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
  if (updated.location !== undefined) location.value = updated.location;
  if (updated.category !== undefined) category.value = findCategoryOption(updated.category, t);
  if (updated.priority !== undefined) priority.value = updated.priority;
  if (updated.modifiedAt !== undefined) modifiedAt.value = updated.modifiedAt;

  originalTitle.value = title.value;
  originalStatus.value = status.value;
  originalAssigneeId.value = assigneeId.value;
  originalIssueType.value = issueType.value;
  originalLocation.value = location.value;
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

        <!-- Location & Tenancy -->
        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-location" class="text-sm text-gray-600">{{ t('issueDetails.fields.location') }}</label>
            <InputText
              id="issue-location"
              v-model="location"
              :placeholder="t('issueDetails.fields.locationPlaceholder')"
            />
          </div>

          <div class="flex flex-col gap-1 flex-1">
            <label for="issue-tenancy" class="text-sm text-gray-600">{{ t('issueDetails.fields.tenancy') }}</label>
            <RentalAgreementSelect
              v-model="selectedAgreement"
              inputId="issue-tenancy"
              :projectId="projectId"
              :initialAgreementId="initialData.agreementId"
              @resolved="onAgreementResolved"
            />
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
