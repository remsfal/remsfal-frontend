<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';

import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import BaseCard from '@/components/common/BaseCard.vue';
import { storageService } from '@/services/StorageService.ts';
import type { StorageJson } from '@/services/StorageService.ts';
import { showSavingErrorToast } from '@/helper/viewHelper.ts';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const schema = z.object({
  title: z.string().trim().min(3, { message: t('validation.minLength', { min: 3 }) }),
  description: z.string().trim().max(500, { message: t('validation.maxLength', { max: 500 }) }).optional().or(z.literal('')),
  location: z.string().trim().optional().or(z.literal('')),
  usableSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  heatingSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  space: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  title: '',
  description: '',
  location: '',
  usableSpace: null as number | null,
  heatingSpace: null as number | null,
  space: null as number | null,
});

const currentValues = reactive({ ...serverValues });
const initialValues = ref({ ...currentValues });
const formKey = ref(0);

const titleMatchesLocation = ref(false);

watch(titleMatchesLocation, (checked) => {
  if (checked) {
    currentValues.location = currentValues.title;
    initialValues.value = { ...currentValues };
    formKey.value++;
  }
});

watch(() => currentValues.title, (newTitle) => {
  if (titleMatchesLocation.value) {
    currentValues.location = newTitle;
  }
});

const isDirty = computed(() =>
  currentValues.title !== serverValues.title ||
  currentValues.description !== serverValues.description ||
  currentValues.location !== serverValues.location ||
  currentValues.usableSpace !== serverValues.usableSpace ||
  currentValues.heatingSpace !== serverValues.heatingSpace ||
  currentValues.space !== serverValues.space,
);

onMounted(async () => {
  if (!props.unitId) {
    toast.add({
      severity: 'warn',
      summary: t('error.general'),
      detail: t('storage.noId'),
      life: 6000,
    });
    return;
  }
  try {
    const data = await storageService.getStorage(props.projectId, props.unitId);
    const loaded = {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      usableSpace: data.usableSpace ?? null,
      heatingSpace: data.heatingSpace ?? null,
      space: data.space ?? null,
    };
    Object.assign(serverValues, loaded);
    Object.assign(currentValues, loaded);
    initialValues.value = { ...loaded };
    titleMatchesLocation.value = !!(loaded.title && loaded.location && loaded.title === loaded.location);
    formKey.value++;
  } catch (err) {
    console.error('Fehler beim Laden des Lagers:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('storage.loadError'),
      life: 6000,
    });
  }
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  const payload: Partial<StorageJson> = {
    title: s.title?.value || undefined,
    description: s.description?.value || undefined,
    location: titleMatchesLocation.value ? (s.title?.value || undefined) : (s.location?.value || undefined),
    usableSpace: s.usableSpace?.value ?? undefined,
    heatingSpace: s.heatingSpace?.value ?? undefined,
    space: s.space?.value ?? undefined,
  };
  try {
    await storageService.updateStorage(props.projectId, props.unitId, payload as StorageJson);
    const saved = {
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      usableSpace: payload.usableSpace ?? null,
      heatingSpace: payload.heatingSpace ?? null,
      space: payload.space ?? null,
    };
    Object.assign(serverValues, saved);
    Object.assign(currentValues, saved);
    initialValues.value = { ...saved };
    formKey.value++;
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('storage.saveSuccess'),
      life: 3000,
    });
  } catch (err) {
    console.error('Fehler beim Speichern des Lagers:', err);
    showSavingErrorToast(toast, t('storage.saveError'));
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('storage.cardTitle') }}
    </template>

    <template #content>
      <Form
        :key="formKey"
        v-slot="$form"
        :initialValues
        :resolver
        @submit="onSubmit"
      >
        <div class="flex flex-col gap-6">
          <!-- Titel -->
          <div class="flex flex-col gap-1">
            <label for="title" class="font-medium">{{ t('storage.title') }}*</label>
            <InputText
              id="title"
              name="title"
              fluid
              @update:modelValue="(v) => (currentValues.title = v as string)"
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
            <label for="location" class="font-medium">{{ t('storage.location') }}</label>
            <InputText
              id="location"
              name="location"
              fluid
              :disabled="titleMatchesLocation"
              @update:modelValue="(v) => (currentValues.location = v as string)"
            />
            <div class="flex items-center gap-2 mt-1">
              <Checkbox v-model="titleMatchesLocation" inputId="titleMatchesLocation" :binary="true" />
              <label for="titleMatchesLocation" class="text-sm text-surface-600">{{ t('rentableUnits.form.locationMatchesTitle') }}</label>
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
            <label for="description" class="font-medium">{{ t('storage.description') }}</label>
            <Textarea
              id="description"
              name="description"
              :rows="3"
              autoResize
              fluid
              @update:modelValue="(v) => (currentValues.description = v as string)"
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

          <!-- Flächen -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
            <!-- Nutzfläche -->
            <div class="flex flex-col gap-1">
              <label for="usableSpace" class="font-medium">{{ t('storage.usableSpace') }}</label>
              <InputNumber
                id="usableSpace"
                name="usableSpace"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.usableSpace = v as number | null)"
              />
              <Message
                v-if="$form.usableSpace?.invalid && $form.usableSpace?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.usableSpace.error?.message }}
              </Message>
            </div>

            <!-- Heizfläche -->
            <div class="flex flex-col gap-1">
              <label for="heatingSpace" class="font-medium">{{ t('storage.heatingSpace') }}</label>
              <InputNumber
                id="heatingSpace"
                name="heatingSpace"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.heatingSpace = v as number | null)"
              />
              <Message
                v-if="$form.heatingSpace?.invalid && $form.heatingSpace?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.heatingSpace.error?.message }}
              </Message>
            </div>

            <!-- Fläche -->
            <div class="flex flex-col gap-1">
              <label for="space" class="font-medium">{{ t('storage.space') }}</label>
              <InputNumber
                id="space"
                name="space"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.space = v as number | null)"
              />
              <Message
                v-if="$form.space?.invalid && $form.space?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.space.error?.message }}
              </Message>
            </div>
          </div>

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
