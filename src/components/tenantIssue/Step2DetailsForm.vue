<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';

// PrimeVue Forms
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

// Types
import type { Type } from '@/services/IssueService';

// Props & Emits
const props = defineProps<{
  issueType: Type | null;
  causedBy: string | null;
  causedByUnknown: boolean;
  location: string | null;
  description: string | null;
}>();

const emit = defineEmits<{
  'update:causedBy': [value: string | null];
  'update:causedByUnknown': [value: boolean];
  'update:location': [value: string | null];
  'update:description': [value: string | null];
  next: [];
  back: [];
}>();

const { t } = useI18n();

// Local state for causedByUnknown checkbox (must be declared before schema)
const localCausedByUnknown = ref(props.causedByUnknown);

// Zod Validation Schema
const step2Schema = z
  .object({
    causedBy: z.string().trim().max(200).nullable(),
    causedByUnknown: z.boolean(),
    location: z.string().trim().max(200).nullable(),
    description: z.string().trim().max(5000).nullable(),
  })
  .refine(
    (data) => {
      // DEFECT: Description is required
      if (props.issueType === 'DEFECT') {
        return data.description && data.description.length > 0;
      }
      return true; // INQUIRY/TERMINATION: optional
    },
    {
      message: t('tenantIssue.validation.descriptionRequired'),
      path: ['description'],
    },
  )
  .refine(
    (data) => {
      // DEFECT: causedBy is required unless causedByUnknown is checked
      if (props.issueType === 'DEFECT') {
        return localCausedByUnknown.value || Boolean(data.causedBy?.trim());
      }
      return true;
    },
    {
      message: t('tenantIssue.validation.causedByRequired'),
      path: ['causedBy'],
    },
  );

const resolver = zodResolver(step2Schema);

const descriptionLabel = computed(() =>
  props.issueType === 'TERMINATION'
    ? t('tenantIssue.step2.messageLabel')
    : t('tenantIssue.step2.descriptionLabel'),
);

const descriptionPlaceholder = computed(() =>
  props.issueType === 'TERMINATION'
    ? t('tenantIssue.step2.messagePlaceholder')
    : t('tenantIssue.step2.descriptionPlaceholder'),
);

// Initial Values
const initialValues = ref({
  causedBy: props.causedBy || '',
  causedByUnknown: props.causedByUnknown,
  location: props.location || '',
  description: props.description || '',
});

// Form Submit Handler
const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;

  if (!event.valid) {
    return;
  }

  const causedBy = formState.causedBy?.value?.trim() || null;
  const location = formState.location?.value?.trim() || null;
  const description = formState.description?.value?.trim() || null;

  // If DEFECT and description is required
  if (props.issueType === 'DEFECT' && !description) {
    return;
  }

  // Update parent state
  emit('update:causedBy', causedBy);
  emit('update:causedByUnknown', localCausedByUnknown.value);
  emit('update:location', location);
  emit('update:description', description);
  emit('next');
};

// Handle Back Button
function handleBack() {
  emit('back');
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('tenantIssue.step2.title') }}
    </h3>

    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-6">
        <!-- DEFECT-specific fields -->
        <template v-if="issueType === 'DEFECT'">
          <!-- Caused By Field -->
          <div class="flex flex-col gap-2">
            <label for="causedBy" class="font-semibold">
              {{ t('tenantIssue.step2.causedByLabel') }}
            </label>
            <InputText
              id="causedBy"
              name="causedBy"
              type="text"
              :placeholder="t('tenantIssue.step2.causedByPlaceholder')"
              :disabled="localCausedByUnknown"
              :invalid="$form.causedBy?.invalid && $form.causedBy?.touched"
              fluid
              autofocus
            />
            <Message
              v-if="$form.causedBy?.invalid && $form.causedBy?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.causedBy.error.message }}
            </Message>
          </div>

          <!-- Caused By Unknown Checkbox -->
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="localCausedByUnknown"
              inputId="causedByUnknown"
              name="causedByUnknown"
              binary
            />
            <label for="causedByUnknown" class="cursor-pointer">
              {{ t('tenantIssue.step2.causedByUnknownLabel') }}
            </label>
          </div>

          <!-- Location Field -->
          <div class="flex flex-col gap-2">
            <label for="location" class="font-semibold">
              {{ t('tenantIssue.step2.locationLabel') }}
            </label>
            <InputText
              id="location"
              name="location"
              type="text"
              :placeholder="t('tenantIssue.step2.locationPlaceholder')"
              fluid
            />
          </div>
        </template>

        <!-- Description / Message (all issue types) -->
        <div class="flex flex-col gap-2">
          <label for="description" class="font-semibold">
            {{ descriptionLabel }} *
          </label>
          <Textarea
            id="description"
            name="description"
            :placeholder="descriptionPlaceholder"
            :invalid="$form.description?.invalid && $form.description?.touched"
            rows="6"
            fluid
          />
          <Message
            v-if="$form.description?.invalid && $form.description?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.description.error.message }}
          </Message>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          :label="t('tenantIssue.step2.backButton')"
          severity="secondary"
          icon="pi pi-arrow-left"
          @click="handleBack"
        />
        <Button
          type="submit"
          :label="t('tenantIssue.step2.nextButton')"
          icon="pi pi-arrow-right"
          iconPos="right"
          :disabled="
            (!$form.description?.valid || !$form.description?.dirty) ||
              (issueType === 'DEFECT' &&
                (!localCausedByUnknown && !$form.causedBy?.value?.trim()))
          "
        />
      </div>
    </Form>
  </div>
</template>
