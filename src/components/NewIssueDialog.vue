<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Message from 'primevue/message';

// PrimeVue Forms
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

// Services & Types
import { issueService, type IssueJson, type IssueType, type IssuePriority } from '@/services/IssueService';

// Props & Emits
const props = defineProps<{
  visible: boolean;
  projectId: string;
  category?: string;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  issueCreated: [issue: IssueJson];
}>();

const { t } = useI18n();
const toast = useToast();

// Zod Validation Schema
const validationSchema = z.object({
  issueTitle: z
    .string()
    .trim()
    .min(3, { message: t('newIssueDialog.title.required') })
    .max(200, { message: t('newIssueDialog.title.error', { maxLength: 200 }) }),

  issueDescription: z
    .string()
    .trim()
    .max(2000, { message: t('newIssueDialog.description.error', { maxLength: 2000 }) })
    .optional()
    .or(z.literal('')),

  issueType: z.enum(['APPLICATION', 'TASK', 'DEFECT', 'MAINTENANCE']),

  issuePriority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'UNCLASSIFIED']),
});

const resolver = zodResolver(validationSchema);

// Initial Form Values
const initialValues = ref({
  issueTitle: '',
  issueDescription: '',
  issueType: (props.category === 'DEFECT' ? 'DEFECT' : 'TASK') as IssueType,
  issuePriority: 'UNCLASSIFIED' as IssuePriority,
});

// Watch category changes to update default type
watch(
  () => props.category,
  (newCategory) => {
    initialValues.value.issueType = (newCategory === 'DEFECT' ? 'DEFECT' : 'TASK') as IssueType;
  },
  { immediate: true },
);

// Dropdown Options (computed for i18n reactivity)
const typeOptions = computed(() => [
  { label: t('inbox.filters.type.application'), value: 'APPLICATION' as IssueType },
  { label: t('inbox.filters.type.task'), value: 'TASK' as IssueType },
  { label: t('inbox.filters.type.defect'), value: 'DEFECT' as IssueType },
  { label: t('inbox.filters.type.maintenance'), value: 'MAINTENANCE' as IssueType },
]);

const priorityOptions = computed(() => [
  { label: t('issuePriority.urgent'), value: 'URGENT' as IssuePriority },
  { label: t('issuePriority.high'), value: 'HIGH' as IssuePriority },
  { label: t('issuePriority.medium'), value: 'MEDIUM' as IssuePriority },
  { label: t('issuePriority.low'), value: 'LOW' as IssuePriority },
  { label: t('issuePriority.unclassified'), value: 'UNCLASSIFIED' as IssuePriority },
]);

// Dialog Header (dynamic based on category)
const dialogHeader = computed(() =>
  props.category === 'DEFECT' ? t('newIssueDialog.titleDefect') : t('newIssueDialog.title'),
);

// Form Submit Handler
const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;

  // Extract values from form state (workaround for PrimeVue Forms issue #6789)
  const title = formState.issueTitle?.value?.trim() || '';
  const description = formState.issueDescription?.value?.trim() || '';
  const type = formState.issueType?.value;
  const priority = formState.issuePriority?.value;

  if (!event.valid || !title || !type || !priority) {
    return;
  }

  createIssue({
    title, description, type, priority,
  });
};

// Create Issue Function
async function createIssue(data: {
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
}) {
  try {
    // Check offline status
    if (!navigator.onLine) {
      toast.add({
        severity: 'warn',
        summary: t('warning'),
        detail: t('newIssueDialog.offlineSaved'),
        life: 4000,
      });
      emit('update:visible', false);
      return;
    }

    // Call API
    const newIssue = await issueService.createProjectIssue({
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      projectId: props.projectId,
    });

    // Success feedback
    toast.add({
      severity: 'success',
      summary: t('success.created'),
      detail: t('newIssueDialog.successCreated'),
      life: 4000,
    });

    // Emit events
    emit('issueCreated', newIssue);
    emit('update:visible', false);
  } catch (error) {
    console.error('Failed to create issue:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('newIssueDialog.errorCreated'),
      life: 4000,
    });
  }
}

// Cancel Handler
function abort() {
  emit('update:visible', false);
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="dialogHeader"
    class="w-full max-w-md sm:max-w-lg md:max-w-xl"
    closable
    @update:visible="emit('update:visible', $event)"
    @hide="abort"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <!-- Title Field -->
        <div class="flex flex-col gap-2">
          <label for="issueTitle" class="font-semibold">
            {{ t('newIssueDialog.title.label') }}
          </label>
          <InputText
            id="issueTitle"
            name="issueTitle"
            type="text"
            :placeholder="t('newIssueDialog.title.placeholder')"
            :class="{ 'p-invalid': $form.issueTitle?.invalid && $form.issueTitle?.touched }"
            autofocus
            fluid
          />
          <Message
            v-if="$form.issueTitle?.invalid && $form.issueTitle?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.issueTitle.error.message }}
          </Message>
        </div>

        <!-- Description Field (Textarea) -->
        <div class="flex flex-col gap-2">
          <label for="issueDescription" class="font-semibold">
            {{ t('newIssueDialog.description.label') }}
          </label>
          <Textarea
            id="issueDescription"
            name="issueDescription"
            rows="5"
            :placeholder="t('newIssueDialog.description.placeholder')"
            :class="{ 'p-invalid': $form.issueDescription?.invalid && $form.issueDescription?.touched }"
            fluid
          />
          <Message
            v-if="$form.issueDescription?.invalid && $form.issueDescription?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.issueDescription.error.message }}
          </Message>
        </div>

        <!-- Type Select -->
        <div class="flex flex-col gap-2">
          <label for="issueType" class="font-semibold">
            {{ t('newIssueDialog.type.label') }}
          </label>
          <Select
            id="issueType"
            name="issueType"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('newIssueDialog.type.placeholder')"
            :class="{ 'p-invalid': $form.issueType?.invalid && $form.issueType?.touched }"
            fluid
          />
          <Message
            v-if="$form.issueType?.invalid && $form.issueType?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.issueType.error.message }}
          </Message>
        </div>

        <!-- Priority Select -->
        <div class="flex flex-col gap-2">
          <label for="issuePriority" class="font-semibold">
            {{ t('newIssueDialog.priority.label') }}
          </label>
          <Select
            id="issuePriority"
            name="issuePriority"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('newIssueDialog.priority.placeholder')"
            :class="{ 'p-invalid': $form.issuePriority?.invalid && $form.issuePriority?.touched }"
            fluid
          />
          <Message
            v-if="$form.issuePriority?.invalid && $form.issuePriority?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.issuePriority.error.message }}
          </Message>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          :label="t('button.cancel')"
          severity="secondary"
          @click="abort"
        />
        <Button
          type="submit"
          :label="t('button.create')"
          icon="pi pi-plus"
          :disabled="!$form.issueTitle?.valid || !$form.issueTitle?.dirty"
        />
      </div>
    </Form>
  </Dialog>
</template>
