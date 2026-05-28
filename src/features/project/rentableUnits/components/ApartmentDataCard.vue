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
import { apartmentService } from '@/services/ApartmentService.ts';
import type { ApartmentJson } from '@/services/ApartmentService.ts';
import { showSavingErrorToast } from '@/helper/viewHelper.ts';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const schema = z.object({
  ...createBaseRentableUnitSchema(t),
  livingSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  usableSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  heatingSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  space: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  title: '',
  description: '',
  location: '',
  livingSpace: null as number | null,
  usableSpace: null as number | null,
  heatingSpace: null as number | null,
  space: null as number | null,
});

const currentValues = reactive({ ...serverValues });
const { titleMatchesLocation, formKey, initialValues, syncState } = useRentableUnitForm(currentValues);

const isDirty = computed(() =>
  currentValues.title !== serverValues.title ||
  currentValues.description !== serverValues.description ||
  currentValues.location !== serverValues.location ||
  currentValues.livingSpace !== serverValues.livingSpace ||
  currentValues.usableSpace !== serverValues.usableSpace ||
  currentValues.heatingSpace !== serverValues.heatingSpace ||
  currentValues.space !== serverValues.space,
);

onMounted(async () => {
  if (!props.unitId) {
    toast.add({
 severity: 'warn', summary: t('error.general'), detail: t('apartment.noId'), life: 6000 
});
    return;
  }
  try {
    const data = await apartmentService.getApartment(props.projectId, props.unitId);
    syncState(serverValues, currentValues, {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      livingSpace: data.livingSpace ?? null,
      usableSpace: data.usableSpace ?? null,
      heatingSpace: data.heatingSpace ?? null,
      space: data.space ?? null,
    });
  } catch (err) {
    console.error('Fehler beim Laden der Wohnung:', err);
    toast.add({
 severity: 'error', summary: t('error.general'), detail: t('apartment.loadError'), life: 6000 
});
  }
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  const payload: Partial<ApartmentJson> = {
    title: s.title?.value || undefined,
    description: s.description?.value || undefined,
    location: titleMatchesLocation.value ? (s.title?.value || undefined) : (s.location?.value || undefined),
    livingSpace: s.livingSpace?.value ?? undefined,
    usableSpace: s.usableSpace?.value ?? undefined,
    heatingSpace: s.heatingSpace?.value ?? undefined,
    space: s.space?.value ?? undefined,
  };
  try {
    await apartmentService.updateApartment(props.projectId, props.unitId, payload as ApartmentJson);
    syncState(serverValues, currentValues, {
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      livingSpace: payload.livingSpace ?? null,
      usableSpace: payload.usableSpace ?? null,
      heatingSpace: payload.heatingSpace ?? null,
      space: payload.space ?? null,
    });
    toast.add({
 severity: 'success', summary: t('success.saved'), detail: t('apartment.saveSuccess'), life: 3000 
});
  } catch (err) {
    console.error('Fehler beim Speichern der Wohnung:', err);
    showSavingErrorToast(toast, t('apartment.saveError'));
  }
}
</script>

<template>
  <RentableUnitBaseDataCard
    :cardTitle="t('apartment.cardTitle')"
    :formKey
    :initialValues
    :resolver
    :isDirty
    :titleMatchesLocation
    :titleLabel="t('apartment.title')"
    :locationLabel="t('apartment.location')"
    :descriptionLabel="t('apartment.description')"
    @submit="onSubmit"
    @update:titleMatchesLocation="(v) => (titleMatchesLocation = v)"
    @update:title="(v) => (currentValues.title = v)"
    @update:location="(v) => (currentValues.location = v)"
    @update:description="(v) => (currentValues.description = v)"
  >
    <template #fields="{ form }">
      <Fieldset :legend="t('apartment.woflv.legend')">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-x-6 gap-y-4">
          <!-- Wohnfläche -->
          <div class="flex flex-col gap-1">
            <label for="livingSpace" class="font-medium">{{ t('apartment.livingSpace') }}</label>
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
            <label for="usableSpace" class="font-medium">{{ t('apartment.usableSpace') }}</label>
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
            <label for="heatingSpace" class="font-medium">{{ t('apartment.heatingSpace') }}</label>
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

          <!-- Fläche -->
          <div class="flex flex-col gap-1">
            <label for="space" class="font-medium">{{ t('apartment.space') }}</label>
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
              v-if="form.space?.invalid && form.space?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ form.space.error?.message }}
            </Message>
          </div>
        </div>
      </Fieldset>
    </template>
  </RentableUnitBaseDataCard>
</template>
