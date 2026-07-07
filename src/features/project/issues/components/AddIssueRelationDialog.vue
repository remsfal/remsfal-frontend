<script setup lang="ts">
import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Listbox from 'primevue/listbox';
import Button from 'primevue/button';
import BaseDialog from '@/components/common/BaseDialog.vue';
import { issueService, type IssueItemJson, type IssueRelationGroup } from '@/services/IssueService';

const props = defineProps<{
  visible: boolean;
  issueId: string;
  projectIssues: IssueItemJson[];
  excludedIds: Set<string>;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  created: [];
}>();

const toast = useToast();
const { t } = useI18n();

const query = ref('');
const selectedRelationType = ref<IssueRelationGroup | null>(null);
const selectedIssue = ref<IssueItemJson | null>(null);
const submitting = ref(false);

const relationTypeOptions = computed(() => [
  { label: t('issueDetails.relationshipsRelatedTo'), value: 'related-to' as IssueRelationGroup },
  { label: t('issueDetails.relationshipsBlocks'), value: 'blocks' as IssueRelationGroup },
  { label: t('issueDetails.relationshipsBlockedBy'), value: 'blocked-by' as IssueRelationGroup },
  { label: t('issueDetails.relationshipsDuplicateOf'), value: 'duplicate-of' as IssueRelationGroup },
  { label: t('issueDetails.relationshipsChildren'), value: 'children' as IssueRelationGroup },
  { label: t('issueDetails.relationshipsParent'), value: 'parent' as IssueRelationGroup },
]);

const filteredIssues = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.projectIssues.filter((issue) => {
    if (!issue.id || props.excludedIds.has(issue.id)) return false;
    if (!q) return true;
    const titleMatch = issue.title?.toLowerCase().includes(q);
    const idMatch = issue.id.toLowerCase().includes(q);
    return Boolean(titleMatch || idMatch);
  });
});

const canSubmit = computed(() => !!selectedRelationType.value && !!selectedIssue.value?.id && !submitting.value);

function resetForm() {
  query.value = '';
  selectedRelationType.value = null;
  selectedIssue.value = null;
}

async function handleSubmit() {
  if (!canSubmit.value || !selectedIssue.value?.id || !selectedRelationType.value) return;

  submitting.value = true;
  try {
    if (selectedRelationType.value === 'parent') {
      await issueService.setParentIssue(props.issueId, selectedIssue.value.id);
    } else {
      await issueService.createIssueRelation(props.issueId, selectedRelationType.value, selectedIssue.value.id);
    }
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.relationshipsAddSuccess'),
      life: 3000,
    });
    resetForm();
    emit('created');
  } catch (error) {
    console.error('Failed to add issue relation:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.relationshipsAddError'),
      life: 3000,
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <BaseDialog
    :visible="visible"
    :header="t('issueDetails.relationshipsAddDialogTitle')"
    dialogClass="w-full max-w-lg"
    @update:visible="emit('update:visible', $event)"
    @hide="resetForm"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="relation-type" class="text-sm text-gray-600">
          {{ t('issueDetails.relationshipsRelationTypeLabel') }}
        </label>
        <Select
          v-model="selectedRelationType"
          inputId="relation-type"
          :options="relationTypeOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="relation-search" class="text-sm text-gray-600">
          {{ t('issueDetails.relationshipsSearchLabel') }}
        </label>
        <InputText
          id="relation-search"
          v-model="query"
          :placeholder="t('issueDetails.relationshipsSearchPlaceholder')"
        />
        <Listbox
          v-model="selectedIssue"
          :options="filteredIssues"
          optionLabel="title"
          dataKey="id"
          listStyle="max-height: 200px"
        >
          <template #option="slotProps">
            <div class="flex flex-col">
              <span class="font-semibold">{{ slotProps.option.title }}</span>
              <span class="text-xs text-gray-500">
                #{{ slotProps.option.id }}
                <template v-if="slotProps.option.type">
                  — {{ t('issueType.' + slotProps.option.type.toLowerCase()) }}
                </template>
              </span>
            </div>
          </template>
          <template #empty>
            {{ t('issueDetails.relationshipsSearchNoResults') }}
          </template>
        </Listbox>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-6">
      <Button
        type="button"
        :label="t('button.cancel')"
        severity="secondary"
        @click="emit('update:visible', false)"
      />
      <Button
        type="button"
        :label="t('button.add')"
        icon="pi pi-plus"
        :disabled="!canSubmit"
        :loading="submitting"
        @click="handleSubmit"
      />
    </div>
  </BaseDialog>
</template>
