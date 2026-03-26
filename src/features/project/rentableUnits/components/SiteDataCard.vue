<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';

import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import BaseCard from '@/components/common/BaseCard.vue';
import { siteService } from '@/services/SiteService.ts';
import type { SiteJson } from '@/services/SiteService.ts';
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
  outdoorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  space: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  title: '',
  description: '',
  location: '',
  outdoorArea: null as number | null,
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
  currentValues.outdoorArea !== serverValues.outdoorArea ||
  currentValues.space !== serverValues.space,
);

onMounted(async () => {
  if (!props.unitId) {
    toast.add({
      severity: 'warn',
      summary: t('error.general'),
      detail: t('site.noId'),
      life: 6000,
    });
    return;
  }
  try {
    const data = await siteService.getSite(props.projectId, props.unitId);
    const loaded = {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      outdoorArea: data.outdoorArea ?? null,
      space: data.space ?? null,
    };
    Object.assign(serverValues, loaded);
    Object.assign(currentValues, loaded);
    initialValues.value = { ...loaded };
    titleMatchesLocation.value = !!(loaded.title && loaded.location && loaded.title === loaded.location);
    formKey.value++;
  } catch (err) {
    console.error('Fehler beim Laden der Außenanlage:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('site.loadError'),
      life: 6000,
    });
  }
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  const payload: Partial<SiteJson> = {
    title: s.title?.value || undefined,
    description: s.description?.value || undefined,
    location: titleMatchesLocation.value ? (s.title?.value || undefined) : (s.location?.value || undefined),
    outdoorArea: s.outdoorArea?.value ?? undefined,
    space: s.space?.value ?? undefined,
  };
  try {
    await siteService.updateSite(props.projectId, props.unitId, payload);
    const saved = {
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      outdoorArea: payload.outdoorArea ?? null,
      space: payload.space ?? null,
    };
    Object.assign(serverValues, saved);
    Object.assign(currentValues, saved);
    initialValues.value = { ...saved };
    formKey.value++;
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('site.saveSuccess'),
      life: 3000,
    });
  } catch (err) {
    console.error('Fehler beim Speichern der Außenanlage:', err);
    showSavingErrorToast(toast, t('site.saveError'));
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('site.cardTitle') }}
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
            <label for="title" class="font-medium">{{ t('site.title') }}*</label>
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
            <label for="location" class="font-medium">{{ t('site.location') }}</label>
            <InputText
              id="location"
              name="location"
              fluid
              :disabled="titleMatchesLocation"
              @update:modelValue="(v) => (currentValues.location = v as string)"
            />
            <div class="flex items-center gap-2 mt-1">
              <Checkbox v-model="titleMatchesLocation" inputId="titleMatchesLocation" binary />
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
            <label for="description" class="font-medium">{{ t('site.description') }}</label>
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- Außenfläche -->
            <div class="flex flex-col gap-1">
              <label for="outdoorArea" class="font-medium">{{ t('site.outdoorArea') }}</label>
              <InputNumber
                id="outdoorArea"
                name="outdoorArea"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.outdoorArea = v as number | null)"
              />
              <Message
                v-if="$form.outdoorArea?.invalid && $form.outdoorArea?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.outdoorArea.error?.message }}
              </Message>
            </div>

            <!-- Nutzfläche -->
            <div class="flex flex-col gap-1">
              <label for="space" class="font-medium">{{ t('site.space') }}</label>
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
