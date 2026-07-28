<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import BaseDialog from '@/components/common/BaseDialog.vue';

// PrimeVue Forms
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

// Services & Types
import { issueService, type IssueJson, type IssueType } from '@/services/IssueService';
import RentalAgreementSelect from '@/features/project/rentalAgreements/components/RentalAgreementSelect.vue';
import type { RentalAgreementItemJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

// Props & Emits
const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits<{
  issueCreated: [issue: IssueJson];
}>();

const { t } = useI18n();
const toast = useToast();

const visible = ref(false);

// --- Rental agreement selection (kept outside the zod-managed Form: the
// AutoComplete-backed RentalAgreementSelect binds a full object, not a
// scalar id, so it can't be registered as a normal name="..." form field) ---
const selectedAgreement = ref<RentalAgreementItemJson | null>(null);
const agreementTouched = ref(false);
const submitAttempted = ref(false);

const agreementInvalid = computed(
  () => (agreementTouched.value || submitAttempted.value) && !selectedAgreement.value,
);

// Reset to a clean state every time the dialog opens
watch(visible, (isVisible) => {
  if (!isVisible) return;
  selectedAgreement.value = null;
  agreementTouched.value = false;
  submitAttempted.value = false;
});

// Zod Validation Schema (no priority field, unlike NewIssueButton)
const validationSchema = z.object({
  issueTitle: z
    .string()
    .trim()
    .min(3, { message: t('newTenantIssueDialog.title.required') })
    .max(200, { message: t('newTenantIssueDialog.title.error', { maxLength: 200 }) }),

  issueDescription: z
    .string()
    .trim()
    .max(2000, { message: t('newTenantIssueDialog.description.error', { maxLength: 2000 }) })
    .optional()
    .or(z.literal('')),

  issueType: z.enum(['APPLICATION', 'TASK', 'DEFECT', 'MAINTENANCE', 'TERMINATION', 'INQUIRY']),
});

const resolver = zodResolver(validationSchema);

const initialValues = ref({
  issueTitle: '',
  issueDescription: '',
  issueType: 'INQUIRY' as IssueType,
});

// Reuse NewIssueButton's issueType.* i18n keys for the option labels
const typeOptions = computed(() => [
  { label: t('issueType.application'), value: 'APPLICATION' as IssueType },
  { label: t('issueType.task'),        value: 'TASK'        as IssueType },
  { label: t('issueType.defect'),      value: 'DEFECT'      as IssueType },
  { label: t('issueType.maintenance'), value: 'MAINTENANCE' as IssueType },
  { label: t('issueType.termination'), value: 'TERMINATION' as IssueType },
  { label: t('issueType.inquiry'),     value: 'INQUIRY'     as IssueType },
]);

// Form Submit Handler
const onSubmit = (event: FormSubmitEvent) => {
  submitAttempted.value = true;
  const formState = event.states;

  const title = formState.issueTitle?.value?.trim() || '';
  const description = formState.issueDescription?.value?.trim() || '';
  const type = formState.issueType?.value;
  const agreementId = selectedAgreement.value?.id;

  if (!event.valid || !title || !type || !agreementId) {
    return;
  }

  createIssue({
    title, description, type, agreementId,
  });
};

// Create Issue Function
async function createIssue(data: {
  title: string;
  description: string;
  type: IssueType;
  agreementId: string;
}) {
  try {
    // Check offline status
    if (!navigator.onLine) {
      toast.add({
        severity: 'warn',
        summary: t('warning'),
        detail: t('newTenantIssueDialog.offlineSaved'),
        life: 4000,
      });
      visible.value = false;
      return;
    }

    // Call API
    const newIssue = await issueService.createProjectIssue({
      title: data.title,
      description: data.description,
      type: data.type,
      projectId: props.projectId,
      agreementId: data.agreementId,
      visibleToTenants: true,
    });

    // Success feedback
    toast.add({
      severity: 'success',
      summary: t('success.created'),
      detail: t('newTenantIssueDialog.successCreated'),
      life: 4000,
    });

    // Emit event and close dialog
    visible.value = false;
    emit('issueCreated', newIssue);
  } catch (error) {
    console.error('Failed to create tenant issue:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('newTenantIssueDialog.errorCreated'),
      life: 4000,
    });
  }
}
</script>

<template>
  <Button
    :label="t('newTenantIssueDialog.title')"
    icon="pi pi-comment"
    @click="visible = true"
  />

  <BaseDialog
    v-model:visible="visible"
    :header="t('newTenantIssueDialog.title')"
    closable
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <label for="issueTitle" class="font-semibold">
            {{ t('newTenantIssueDialog.title.label') }}<span aria-hidden="true"> *</span>
          </label>
          <InputText
            id="issueTitle"
            name="issueTitle"
            type="text"
            :placeholder="t('newTenantIssueDialog.title.placeholder')"
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
            {{ $form.issueTitle?.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="tenantIssueAgreement" class="font-semibold">
            {{ t('newTenantIssueDialog.agreement.label') }}<span aria-hidden="true"> *</span>
          </label>
          <RentalAgreementSelect
            inputId="tenantIssueAgreement"
            :projectId="props.projectId"
            :modelValue="selectedAgreement"
            :invalid="agreementInvalid"
            @update:modelValue="selectedAgreement = $event"
            @blur="agreementTouched = true"
          />
          <Message
            v-if="agreementInvalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ t('newTenantIssueDialog.agreement.required') }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="issueDescription" class="font-semibold">
            {{ t('newTenantIssueDialog.description.label') }}
          </label>
          <Textarea
            id="issueDescription"
            name="issueDescription"
            rows="5"
            :placeholder="t('newTenantIssueDialog.description.placeholder')"
            :class="{ 'p-invalid': $form.issueDescription?.invalid && $form.issueDescription?.touched }"
            fluid
          />
          <Message
            v-if="$form.issueDescription?.invalid && $form.issueDescription?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.issueDescription?.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="issueType" class="font-semibold">{{ t('newIssueDialog.type.label') }}</label>
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
            {{ $form.issueType?.error?.message }}
          </Message>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          :label="t('button.cancel')"
          severity="secondary"
          @click="visible = false"
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
