<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import BaseDialog from '@/components/common/BaseDialog.vue';
import DialogFormField from '@/components/common/DialogFormField.vue';

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

  issueType: z.enum(['APPLICATION', 'TASK', 'DEFECT', 'MAINTENANCE', 'TERMINATION', 'INQUIRY']),

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
  { label: t('issueType.application'), value: 'APPLICATION' as IssueType },
  { label: t('issueType.task'),        value: 'TASK'        as IssueType },
  { label: t('issueType.defect'),      value: 'DEFECT'      as IssueType },
  { label: t('issueType.maintenance'), value: 'MAINTENANCE' as IssueType },
  { label: t('issueType.termination'), value: 'TERMINATION' as IssueType },
  { label: t('issueType.inquiry'),     value: 'INQUIRY'     as IssueType },
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

function formError(field: { invalid?: boolean; touched?: boolean; error?: { message?: string } } | undefined) {
  return field?.invalid && field?.touched ? field.error?.message : undefined;
}

// Cancel Handler
function abort() {
  emit('update:visible', false);
}
</script>

<template>
  <BaseDialog
    :visible="visible"
    :header="dialogHeader"
    closable
    @update:visible="emit('update:visible', $event)"
    @hide="abort"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <DialogFormField
          inputId="issueTitle"
          :label="t('newIssueDialog.title.label')"
          required
          :errorMessage="formError($form.issueTitle)"
        >
          <InputText
            id="issueTitle"
            name="issueTitle"
            type="text"
            :placeholder="t('newIssueDialog.title.placeholder')"
            :class="{ 'p-invalid': $form.issueTitle?.invalid && $form.issueTitle?.touched }"
            autofocus
            fluid
          />
        </DialogFormField>

        <DialogFormField
          inputId="issueDescription"
          :label="t('newIssueDialog.description.label')"
          :errorMessage="formError($form.issueDescription)"
        >
          <Textarea
            id="issueDescription"
            name="issueDescription"
            rows="5"
            :placeholder="t('newIssueDialog.description.placeholder')"
            :class="{ 'p-invalid': $form.issueDescription?.invalid && $form.issueDescription?.touched }"
            fluid
          />
        </DialogFormField>

        <DialogFormField
          inputId="issueType"
          :label="t('newIssueDialog.type.label')"
          :errorMessage="formError($form.issueType)"
        >
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
        </DialogFormField>

        <DialogFormField
          inputId="issuePriority"
          :label="t('newIssueDialog.priority.label')"
          :errorMessage="formError($form.issuePriority)"
        >
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
        </DialogFormField>
      </div>

      <div class="flex justify-end gap-2 mt-6">
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
  </BaseDialog>
</template>
