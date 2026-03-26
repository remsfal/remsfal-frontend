<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Fieldset from 'primevue/fieldset';
import Message from 'primevue/message';

import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import BaseCard from '@/components/common/BaseCard.vue';
import { buildingService } from '@/services/BuildingService.ts';
import type { BuildingJson } from '@/services/BuildingService.ts';
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
  grossFloorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  netFloorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  constructionFloorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  livingSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  usableSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  heatingSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  title: '',
  description: '',
  location: '',
  grossFloorArea: null as number | null,
  netFloorArea: null as number | null,
  constructionFloorArea: null as number | null,
  livingSpace: null as number | null,
  usableSpace: null as number | null,
  heatingSpace: null as number | null,
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
  currentValues.grossFloorArea !== serverValues.grossFloorArea ||
  currentValues.netFloorArea !== serverValues.netFloorArea ||
  currentValues.constructionFloorArea !== serverValues.constructionFloorArea ||
  currentValues.livingSpace !== serverValues.livingSpace ||
  currentValues.usableSpace !== serverValues.usableSpace ||
  currentValues.heatingSpace !== serverValues.heatingSpace,
);

onMounted(async () => {
  if (!props.unitId) {
    toast.add({
      severity: 'warn',
      summary: t('error.general'),
      detail: t('building.noId'),
      life: 6000,
    });
    return;
  }
  try {
    const data = await buildingService.getBuilding(props.projectId, props.unitId);
    const loaded = {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      grossFloorArea: data.grossFloorArea ?? null,
      netFloorArea: data.netFloorArea ?? null,
      constructionFloorArea: data.constructionFloorArea ?? null,
      livingSpace: data.livingSpace ?? null,
      usableSpace: data.usableSpace ?? null,
      heatingSpace: data.heatingSpace ?? null,
    };
    Object.assign(serverValues, loaded);
    Object.assign(currentValues, loaded);
    initialValues.value = { ...loaded };
    titleMatchesLocation.value = !!(loaded.title && loaded.location && loaded.title === loaded.location);
    formKey.value++;
  } catch (err) {
    console.error('Fehler beim Laden der Gebäudedaten:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('building.loadError'),
      life: 6000,
    });
  }
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  const payload: Partial<BuildingJson> = {
    title: s.title?.value || undefined,
    description: s.description?.value || undefined,
    location: titleMatchesLocation.value ? (s.title?.value || undefined) : (s.location?.value || undefined),
    grossFloorArea: s.grossFloorArea?.value ?? undefined,
    netFloorArea: s.netFloorArea?.value ?? undefined,
    constructionFloorArea: s.constructionFloorArea?.value ?? undefined,
    livingSpace: s.livingSpace?.value ?? undefined,
    usableSpace: s.usableSpace?.value ?? undefined,
    heatingSpace: s.heatingSpace?.value ?? undefined,
  };
  try {
    await buildingService.updateBuilding(props.projectId, props.unitId, payload);
    const saved = {
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      grossFloorArea: payload.grossFloorArea ?? null,
      netFloorArea: payload.netFloorArea ?? null,
      constructionFloorArea: payload.constructionFloorArea ?? null,
      livingSpace: payload.livingSpace ?? null,
      usableSpace: payload.usableSpace ?? null,
      heatingSpace: payload.heatingSpace ?? null,
    };
    Object.assign(serverValues, saved);
    Object.assign(currentValues, saved);
    initialValues.value = { ...saved };
    formKey.value++;
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('building.saveSuccess'),
      life: 3000,
    });
  } catch (err) {
    console.error('Fehler beim Speichern der Gebäudedaten:', err);
    showSavingErrorToast(toast, t('building.saveError'));
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('building.cardTitle') }}
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
            <label for="title" class="font-medium">{{ t('building.title') }}*</label>
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
            <label for="location" class="font-medium">{{ t('building.location') }}</label>
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
          </div>

          <!-- Beschreibung -->
          <div class="flex flex-col gap-1">
            <label for="description" class="font-medium">{{ t('building.description') }}</label>
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

          <!-- DIN 277 -->
          <Fieldset :legend="t('building.din277.legend')">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
              <!-- Brutto-Grundfläche BGF -->
              <div class="flex flex-col gap-1">
                <label for="grossFloorArea" class="font-medium">{{ t('building.grossFloorArea') }}</label>
                <InputNumber
                  id="grossFloorArea"
                  name="grossFloorArea"
                  :min="0"
                  :maxFractionDigits="2"
                  suffix=" m²"
                  fluid
                  @update:modelValue="(v) => (currentValues.grossFloorArea = v as number | null)"
                />
                <Message
                  v-if="$form.grossFloorArea?.invalid && $form.grossFloorArea?.touched"
                  severity="error"
                  size="small"
                  variant="simple"
                >
                  {{ $form.grossFloorArea.error?.message }}
                </Message>
              </div>

              <!-- Netto-Raumfläche NRF -->
              <div class="flex flex-col gap-1">
                <label for="netFloorArea" class="font-medium">{{ t('building.netFloorArea') }}</label>
                <InputNumber
                  id="netFloorArea"
                  name="netFloorArea"
                  :min="0"
                  :maxFractionDigits="2"
                  suffix=" m²"
                  fluid
                  @update:modelValue="(v) => (currentValues.netFloorArea = v as number | null)"
                />
                <Message
                  v-if="$form.netFloorArea?.invalid && $form.netFloorArea?.touched"
                  severity="error"
                  size="small"
                  variant="simple"
                >
                  {{ $form.netFloorArea.error?.message }}
                </Message>
              </div>

              <!-- Konstruktions-Grundfläche KGF -->
              <div class="flex flex-col gap-1">
                <label for="constructionFloorArea" class="font-medium">{{ t('building.constructionFloorArea') }}</label>
                <InputNumber
                  id="constructionFloorArea"
                  name="constructionFloorArea"
                  :min="0"
                  :maxFractionDigits="2"
                  suffix=" m²"
                  fluid
                  @update:modelValue="(v) => (currentValues.constructionFloorArea = v as number | null)"
                />
                <Message
                  v-if="$form.constructionFloorArea?.invalid && $form.constructionFloorArea?.touched"
                  severity="error"
                  size="small"
                  variant="simple"
                >
                  {{ $form.constructionFloorArea.error?.message }}
                </Message>
              </div>
            </div>
          </Fieldset>

          <!-- WoFlV -->
          <Fieldset :legend="t('building.woflv.legend')">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
              <!-- Wohnfläche -->
              <div class="flex flex-col gap-1">
                <label for="livingSpace" class="font-medium">{{ t('building.livingSpace') }}</label>
                <InputNumber
                  id="livingSpace"
                  name="livingSpace"
                  :min="0"
                  :maxFractionDigits="2"
                  suffix=" m²"
                  fluid
                  @update:modelValue="(v) => (currentValues.livingSpace = v as number | null)"
                />
                <Message
                  v-if="$form.livingSpace?.invalid && $form.livingSpace?.touched"
                  severity="error"
                  size="small"
                  variant="simple"
                >
                  {{ $form.livingSpace.error?.message }}
                </Message>
              </div>

              <!-- Nutzfläche -->
              <div class="flex flex-col gap-1">
                <label for="usableSpace" class="font-medium">{{ t('building.usableSpace') }}</label>
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
                <label for="heatingSpace" class="font-medium">{{ t('building.heatingSpace') }}</label>
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
            </div>
          </Fieldset>

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
