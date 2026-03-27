<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';

import { Form } from '@primevue/forms';
import type { FormSubmitEvent, FormProps } from '@primevue/forms';

import BaseCard from '@/components/common/BaseCard.vue';

defineProps<{
  cardTitle: string;
  formKey: number;
  initialValues: Record<string, unknown>;
  resolver: NonNullable<FormProps['resolver']>;
  isDirty: boolean;
  titleMatchesLocation: boolean;
  titleLabel: string;
  locationLabel: string;
  descriptionLabel: string;
}>();

const emit = defineEmits<{
  submit: [event: FormSubmitEvent];
  'update:titleMatchesLocation': [value: boolean];
  'update:title': [value: string];
  'update:location': [value: string];
  'update:description': [value: string];
}>();

const { t } = useI18n();
</script>

<template>
  <BaseCard>
    <template #title>
      {{ cardTitle }}
    </template>

    <template #content>
      <Form
        :key="formKey"
        v-slot="$form"
        :initialValues
        :resolver
        @submit="emit('submit', $event)"
      >
        <div class="flex flex-col gap-6">
          <!-- Titel -->
          <div class="flex flex-col gap-1">
            <label for="title" class="font-medium">{{ titleLabel }}*</label>
            <InputText
              id="title"
              name="title"
              fluid
              @update:modelValue="(v) => emit('update:title', v as string)"
            />
            <Message
              v-if="$form.title?.invalid && $form.title?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.title.error?.message }}
            </Message>
          </div>

          <!-- Lage/Standort -->
          <div class="flex flex-col gap-1">
            <label for="location" class="font-medium">{{ locationLabel }}</label>
            <InputText
              id="location"
              name="location"
              fluid
              :disabled="titleMatchesLocation"
              @update:modelValue="(v) => emit('update:location', v as string)"
            />
            <div class="flex items-center gap-2 mt-1">
              <Checkbox
                :modelValue="titleMatchesLocation"
                inputId="titleMatchesLocation"
                binary
                @update:modelValue="(v) => emit('update:titleMatchesLocation', v as boolean)"
              />
              <label for="titleMatchesLocation" class="text-sm text-surface-600">
                {{ t('rentableUnits.form.locationMatchesTitle') }}
              </label>
            </div>
            <Message
              v-if="$form.location?.invalid && $form.location?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.location.error?.message }}
            </Message>
          </div>

          <!-- Beschreibung -->
          <div class="flex flex-col gap-1">
            <label for="description" class="font-medium">{{ descriptionLabel }}</label>
            <Textarea
              id="description"
              name="description"
              :rows="3"
              autoResize
              fluid
              @update:modelValue="(v) => emit('update:description', v as string)"
            />
            <Message
              v-if="$form.description?.invalid && $form.description?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.description.error?.message }}
            </Message>
          </div>

          <!-- Komponentenspezifische Felder -->
          <slot name="fields" :form="$form" />

          <Message size="small" severity="secondary" variant="simple">
            {{ t('accountSettings.userProfile.requiredFields') }}
          </Message>

          <!-- Speichern -->
          <div class="flex justify-end">
            <Button
              type="submit"
              :label="t('button.save')"
              icon="pi pi-save"
              :disabled="!isDirty"
            />
          </div>
        </div>
      </Form>
    </template>
  </BaseCard>
</template>
