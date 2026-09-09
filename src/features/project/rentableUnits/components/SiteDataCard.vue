<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppToast } from '@/composables/useAppToast';

import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';

import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import RentableUnitBaseDataCard from '@/features/project/rentableUnits/components/RentableUnitBaseDataCard.vue';
import {useRentableUnitForm,
  createBaseRentableUnitSchema,} from '@/features/project/rentableUnits/composables/useRentableUnitForm';
import { siteService } from '@/features/project/rentableUnits/services/SiteService';
import type { SiteJson } from '@/features/project/rentableUnits/services/SiteService';
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const { t } = useI18n();
const appToast = useAppToast();
const rentableUnitsStore = useRentableUnitsStore();

const schema = z.object({
  ...createBaseRentableUnitSchema(t),
  outdoorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  title: '',
  description: '',
  location: '',
  outdoorArea: null as number | null,
});

const currentValues = reactive({ ...serverValues });
const { titleMatchesLocation, formKey, initialValues, syncState } = useRentableUnitForm(currentValues);

const isDirty = computed(() =>
  currentValues.title !== serverValues.title ||
  currentValues.description !== serverValues.description ||
  currentValues.location !== serverValues.location ||
  currentValues.outdoorArea !== serverValues.outdoorArea,
);

onMounted(async () => {
  if (!props.unitId) {
    appToast.warn(t('site.noId'));
    return;
  }
  try {
    const data = await siteService.getSite(props.projectId, props.unitId);
    syncState(serverValues, currentValues, {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      outdoorArea: data.outdoorArea ?? null,
    });
  } catch (err) {
    console.error('Fehler beim Laden der Außenanlage:', err);
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
  };
  try {
    await siteService.updateSite(props.projectId, props.unitId, payload);
    syncState(serverValues, currentValues, {
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      outdoorArea: payload.outdoorArea ?? null,
    });
    rentableUnitsStore.invalidate();
    appToast.success(t('site.saveSuccess'), { summary: t('success.saved') });
  } catch (err) {
    console.error('Fehler beim Speichern der Außenanlage:', err);
  }
}
</script>

<template>
  <RentableUnitBaseDataCard
    :cardTitle="t('site.cardTitle')"
    :formKey
    :initialValues
    :resolver
    :isDirty
    :titleMatchesLocation
    :titleLabel="t('site.title')"
    :locationLabel="t('site.location')"
    :descriptionLabel="t('site.description')"
    @submit="onSubmit"
    @update:titleMatchesLocation="(v) => (titleMatchesLocation = v)"
    @update:title="(v) => (currentValues.title = v)"
    @update:location="(v) => (currentValues.location = v)"
    @update:description="(v) => (currentValues.description = v)"
  >
    <template #fields="{ form }">
      <div class="grid grid-cols-1 gap-x-6 gap-y-4">
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
            v-if="form.outdoorArea?.invalid && form.outdoorArea?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ form.outdoorArea.error?.message }}
          </Message>
        </div>
      </div>
    </template>
  </RentableUnitBaseDataCard>
</template>
