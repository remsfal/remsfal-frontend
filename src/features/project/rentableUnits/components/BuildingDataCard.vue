<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import InputNumber from 'primevue/inputnumber';
import Fieldset from 'primevue/fieldset';
import Message from 'primevue/message';

import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import RentableUnitBaseDataCard from '@/features/project/rentableUnits/components/RentableUnitBaseDataCard.vue';
import {useRentableUnitForm,
  createBaseRentableUnitSchema,} from '@/features/project/rentableUnits/composables/useRentableUnitForm.ts';
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
  ...createBaseRentableUnitSchema(t),
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
const { titleMatchesLocation, formKey, initialValues, syncState } = useRentableUnitForm(currentValues);

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
 severity: 'warn', summary: t('error.general'), detail: t('building.noId'), life: 6000 
});
    return;
  }
  try {
    const data = await buildingService.getBuilding(props.projectId, props.unitId);
    syncState(serverValues, currentValues, {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      grossFloorArea: data.grossFloorArea ?? null,
      netFloorArea: data.netFloorArea ?? null,
      constructionFloorArea: data.constructionFloorArea ?? null,
      livingSpace: data.livingSpace ?? null,
      usableSpace: data.usableSpace ?? null,
      heatingSpace: data.heatingSpace ?? null,
    });
  } catch (err) {
    console.error('Fehler beim Laden der Gebäudedaten:', err);
    toast.add({
 severity: 'error', summary: t('error.general'), detail: t('building.loadError'), life: 6000 
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
    syncState(serverValues, currentValues, {
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      grossFloorArea: payload.grossFloorArea ?? null,
      netFloorArea: payload.netFloorArea ?? null,
      constructionFloorArea: payload.constructionFloorArea ?? null,
      livingSpace: payload.livingSpace ?? null,
      usableSpace: payload.usableSpace ?? null,
      heatingSpace: payload.heatingSpace ?? null,
    });
    toast.add({
 severity: 'success', summary: t('success.saved'), detail: t('building.saveSuccess'), life: 3000 
});
  } catch (err) {
    console.error('Fehler beim Speichern der Gebäudedaten:', err);
    showSavingErrorToast(toast, t('building.saveError'));
  }
}
</script>

<template>
  <RentableUnitBaseDataCard
    :cardTitle="t('building.cardTitle')"
    :formKey
    :initialValues
    :resolver
    :isDirty
    :titleMatchesLocation
    :titleLabel="t('building.title')"
    :locationLabel="t('building.location')"
    :descriptionLabel="t('building.description')"
    @submit="onSubmit"
    @update:titleMatchesLocation="(v) => (titleMatchesLocation = v)"
    @update:title="(v) => (currentValues.title = v)"
    @update:location="(v) => (currentValues.location = v)"
    @update:description="(v) => (currentValues.description = v)"
  >
    <template #fields="{ form }">
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
              v-if="form.grossFloorArea?.invalid && form.grossFloorArea?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ form.grossFloorArea.error?.message }}
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
              v-if="form.netFloorArea?.invalid && form.netFloorArea?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ form.netFloorArea.error?.message }}
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
              v-if="form.constructionFloorArea?.invalid && form.constructionFloorArea?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ form.constructionFloorArea.error?.message }}
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
              v-if="form.livingSpace?.invalid && form.livingSpace?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ form.livingSpace.error?.message }}
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
              v-if="form.usableSpace?.invalid && form.usableSpace?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ form.usableSpace.error?.message }}
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
              v-if="form.heatingSpace?.invalid && form.heatingSpace?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ form.heatingSpace.error?.message }}
            </Message>
          </div>
        </div>
      </Fieldset>
    </template>
  </RentableUnitBaseDataCard>
</template>
