<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';

import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import RentableUnitBaseDataCard from '@/features/project/rentableUnits/components/RentableUnitBaseDataCard.vue';
import {useRentableUnitForm,
  createBaseRentableUnitSchema,} from '@/features/project/rentableUnits/composables/useRentableUnitForm.ts';
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
  ...createBaseRentableUnitSchema(t),
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
const { titleMatchesLocation, formKey, initialValues, syncState } = useRentableUnitForm(currentValues);

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
 severity: 'warn', summary: t('error.general'), detail: t('storage.noId'), life: 6000 
});
    return;
  }
  try {
    const data = await storageService.getStorage(props.projectId, props.unitId);
    syncState(serverValues, currentValues, {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      usableSpace: data.usableSpace ?? null,
      heatingSpace: data.heatingSpace ?? null,
      space: data.space ?? null,
    });
  } catch (err) {
    console.error('Fehler beim Laden des Lagers:', err);
    toast.add({
 severity: 'error', summary: t('error.general'), detail: t('storage.loadError'), life: 6000 
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
    syncState(serverValues, currentValues, {
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      usableSpace: payload.usableSpace ?? null,
      heatingSpace: payload.heatingSpace ?? null,
      space: payload.space ?? null,
    });
    toast.add({
 severity: 'success', summary: t('success.saved'), detail: t('storage.saveSuccess'), life: 3000 
});
  } catch (err) {
    console.error('Fehler beim Speichern des Lagers:', err);
    showSavingErrorToast(toast, t('storage.saveError'));
  }
}
</script>

<template>
  <RentableUnitBaseDataCard
    :cardTitle="t('storage.cardTitle')"
    :formKey
    :initialValues
    :resolver
    :isDirty
    :titleMatchesLocation
    :titleLabel="t('storage.title')"
    :locationLabel="t('storage.location')"
    :descriptionLabel="t('storage.description')"
    @submit="onSubmit"
    @update:titleMatchesLocation="(v) => (titleMatchesLocation = v)"
    @update:title="(v) => (currentValues.title = v)"
    @update:location="(v) => (currentValues.location = v)"
    @update:description="(v) => (currentValues.description = v)"
  >
    <template #fields="{ form }">
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
            v-if="form.space?.invalid && form.space?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ form.space.error?.message }}
          </Message>
        </div>
      </div>
    </template>
  </RentableUnitBaseDataCard>
</template>
