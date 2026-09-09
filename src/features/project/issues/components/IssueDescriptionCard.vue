<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAppToast } from '@/composables/useAppToast';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/BaseCard.vue';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import { issueService, type IssueWritableJson } from '@/features/project/issues/services/IssueService';

const props = defineProps<{
  projectId: string;
  issueId: string;
  initialDescription: string;
}>();

const emit = defineEmits<{ saved: [] }>();

const appToast = useAppToast();
const { t } = useI18n();

/* Local reactive state */
const description = ref(props.initialDescription);
const originalDescription = ref(props.initialDescription);

/* Change detection */
const canSave = computed(() => description.value !== originalDescription.value);

/* Loading state */
const loadingSave = ref(false);

/* Watch for prop changes */
watch(() => props.initialDescription, (newDescription) => {
  description.value = newDescription;
  originalDescription.value = newDescription;
});

/* Save handler */
const handleSave = async () => {
  if (!canSave.value || loadingSave.value) return;

  loadingSave.value = true;
  try {
    const payload: IssueWritableJson = { description: description.value };

    // Call backend API
    await issueService.updateIssue(props.issueId, payload);

    // Update reference state after successful save
    originalDescription.value = description.value;

    appToast.success(t('issueDetails.descriptionSaveSuccess'), { summary: t('success.saved') });

    // Emit saved event to parent
    emit('saved');
  } catch (error) {
    console.error('Error saving description:', error);
  } finally {
    loadingSave.value = false;
  }
};
</script>

<template>
  <BaseCard>
    <template #title>
      <label for="issue-description">{{ t('issueDetails.description.title') }}</label>
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <Textarea
          id="issue-description"
          v-model="description"
          autoResize
          :rows="8"
          class="w-full"
          :placeholder="t('issueDetails.description.placeholder')"
        />

        <div class="flex justify-end">
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
