<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Button from 'primevue/button';
import IssueDescription from '@/views/IssueDescription.vue';
import { issueService, type Issue } from '@/services/IssueService';

const props = defineProps<{
  projectId: string;
  issueId: string;
  initialDescription: string;
}>();

const emit = defineEmits<{
  saved: []
}>();

const toast = useToast();
const { t } = useI18n();

/* Local reactive state */
const description = ref(props.initialDescription);
const originalDescription = ref(props.initialDescription);

/* Change detection */
const canSave = computed(() =>
  description.value !== originalDescription.value
);

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
    const payload: Partial<Issue> = { description: description.value };
    
    // Call backend API
    await issueService.modifyIssue(props.projectId, props.issueId, payload);
    
    // Update reference state after successful save
    originalDescription.value = description.value;

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.descriptionSaveSuccess'),
      life: 3000,
    });

    // Emit saved event to parent
    emit('saved');
  } catch (error) {
    console.error('Error saving description:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.descriptionSaveError'),
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
      <div class="font-semibold text-xl">
        Description
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <IssueDescription v-model:description="description" />
        
        <!-- Save Description Button -->
        <div class="flex justify-end">
          <Button
            label="Save Description"
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
