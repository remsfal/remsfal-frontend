<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useToast } from 'primevue/usetoast';
import { issueService, type Issue, type Type } from '@/services/IssueService.ts';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Message from 'primevue/message';

const props = defineProps<{
  visible: boolean;
  projectId?: string;
  agreementId?: string;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  issueCreated: [issue: Issue];
}>();

const { t } = useI18n();
const toast = useToast();

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: t('newIssueDialog.title.required') })
    .max(200, { message: t('newIssueDialog.title.error', { maxLength: 200 }) }),
  type: z.enum(['APPLICATION', 'TASK', 'DEFECT', 'MAINTENANCE'], { message: t('newIssueDialog.type.required') }),
});

const resolver = zodResolver(schema);
const initialValues = ref({
  title: '',
  type: 'DEFECT' as Type,
});

const typeOptions = computed(() => [
  { label: t('inbox.filters.type.application'), value: 'APPLICATION' },
  { label: t('inbox.filters.type.task'), value: 'TASK' },
  { label: t('inbox.filters.type.defect'), value: 'DEFECT' },
  { label: t('inbox.filters.type.maintenance'), value: 'MAINTENANCE' },
]);

const isSubmitting = ref(false);

const onSubmit = async (event: FormSubmitEvent) => {
  if (!event.valid) {
    return;
  }

  const formState = event.states;
  const title = formState.title?.value?.trim() || '';
  const type = formState.type?.value as Type;

  if (!title || !type || !props.projectId || !props.agreementId) {
    return;
  }

  isSubmitting.value = true;

  try {
    const newIssue = await issueService.createIssue({
      title,
      type,
      projectId: props.projectId,
      agreementId: props.agreementId,
    });

    toast.add({
      severity: 'success',
      summary: t('success.created'),
      detail: t('newIssueDialog.successCreated'),
      life: 3000,
    });

    emit('issueCreated', newIssue);
    emit('update:visible', false);

    // Reset form
    initialValues.value = {
      title: '',
      type: 'DEFECT' as Type,
    };
  } catch (error) {
    console.error('Error creating issue:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('newIssueDialog.errorCreated'),
      life: 5000,
    });
  } finally {
    isSubmitting.value = false;
  }
};

const onCancel = () => {
  emit('update:visible', false);
};

const hasNoContracts = computed(() => !props.projectId || !props.agreementId);
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="t('tenantNewIssueDialog.title')"
    :style="{ width: '32rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <Message v-if="hasNoContracts" severity="warn" :closable="false" class="mb-4">
      {{ t('tenantNewIssueDialog.noActiveContracts') }}
    </Message>

    <Form
      v-if="!hasNoContracts"
      v-slot="$form"
      :initialValues
      :resolver
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <label for="title" class="font-semibold">
            {{ t('newIssueDialog.title.label') }}
          </label>

          <InputText
            name="title"
            type="text"
            :placeholder="t('newIssueDialog.title.placeholder')"
            :class="{ 'p-invalid': $form.title?.invalid && $form.title?.touched }"
            autofocus
            fluid
          />

          <Message
            v-if="$form.title?.invalid && $form.title?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.title.error.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="type" class="font-semibold">
            {{ t('newIssueDialog.type.label') }}
          </label>

          <Select
            name="type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('newIssueDialog.type.placeholder')"
            :class="{ 'p-invalid': $form.type?.invalid && $form.type?.touched }"
            fluid
          />

          <Message
            v-if="$form.type?.invalid && $form.type?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.type.error.message }}
          </Message>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          :label="t('button.cancel')"
          severity="secondary"
          @click="onCancel"
        />
        <Button
          type="submit"
          :label="t('tenantNewIssueDialog.createButton')"
          icon="pi pi-check"
          severity="success"
          :disabled="!$form.title?.valid || !$form.type?.valid || !$form.title?.dirty || isSubmitting"
          :loading="isSubmitting"
        />
      </div>
    </Form>

    <div v-if="hasNoContracts" class="flex justify-end mt-4">
      <Button
        type="button"
        :label="t('button.cancel')"
        severity="secondary"
        @click="onCancel"
      />
    </div>
  </Dialog>
</template>
