<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import InputNumber from 'primevue/inputnumber';
import Fieldset from 'primevue/fieldset';
import Message from 'primevue/message';
import SelectButton from 'primevue/selectbutton';
import Checkbox from 'primevue/checkbox';

import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import RentableUnitBaseDataCard from '@/features/project/rentableUnits/components/RentableUnitBaseDataCard.vue';
import {useRentableUnitForm,
  createBaseRentableUnitSchema,} from '@/features/project/rentableUnits/composables/useRentableUnitForm';
import { commercialService } from '@/features/project/rentableUnits/services/CommercialService';
import type { CommercialJson } from '@/features/project/rentableUnits/services/CommercialService';
import { showSavingErrorToast } from '@/helper/viewHelper';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const schema = z.object({
  ...createBaseRentableUnitSchema(t),
  netFloorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  usableFloorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  technicalServicesArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  trafficArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  heatingSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
});

const resolver = zodResolver(schema);

// ─── DIN 277 mode toggle ──────────────────────────────────────────────────────
type Din277Mode = 'total' | 'detail';
const din277Mode = ref<Din277Mode>('total');
const din277ModeOptions = [
  { label: 'NRF gesamt', value: 'total' },
  { label: 'Aufgeschlüsselt', value: 'detail' },
];

// ─── State ────────────────────────────────────────────────────────────────────
const serverValues = reactive({
  title: '',
  description: '',
  location: '',
  netFloorArea: null as number | null,
  usableFloorArea: null as number | null,
  technicalServicesArea: null as number | null,
  trafficArea: null as number | null,
  heatingSpace: null as number | null,
});

const currentValues = reactive({ ...serverValues });
const { titleMatchesLocation, formKey, initialValues, syncState } = useRentableUnitForm(currentValues);

const isDirty = computed(() =>
  currentValues.title !== serverValues.title ||
  currentValues.description !== serverValues.description ||
  currentValues.location !== serverValues.location ||
  currentValues.netFloorArea !== serverValues.netFloorArea ||
  currentValues.usableFloorArea !== serverValues.usableFloorArea ||
  currentValues.technicalServicesArea !== serverValues.technicalServicesArea ||
  currentValues.trafficArea !== serverValues.trafficArea ||
  currentValues.heatingSpace !== serverValues.heatingSpace,
);

// ─── DIN 277 sum (NF + TF + VF) ─────────────────────────────────────────────────
const din277Sum = computed(() => {
  const { usableFloorArea, technicalServicesArea, trafficArea } = currentValues;
  if (usableFloorArea === null && technicalServicesArea === null && trafficArea === null) {
    return null;
  }
  return (usableFloorArea ?? 0) + (technicalServicesArea ?? 0) + (trafficArea ?? 0);
});

// InputNumber renders its displayed text from an uncontrolled `defaultValue` that
// is only applied once at mount, so a `:key` change is needed to force it to
// re-render the live sum while the user types into NF/TF/VF.
const netFloorAreaKey = computed(() =>
  din277Mode.value === 'detail' ? `netFloorArea-detail-${din277Sum.value}` : 'netFloorArea-total',
);

// ─── Heizfläche entspricht NRF/NF ──────────────────────────────────────────────
const heatingSpaceMatchesArea = ref(false);

// NRF im Gesamt-Modus, NF im Aufgeschlüsselt-Modus
const heatingSpaceReferenceArea = computed(() =>
  din277Mode.value === 'total' ? currentValues.netFloorArea : currentValues.usableFloorArea,
);

const heatingSpaceKey = computed(() =>
  heatingSpaceMatchesArea.value ? `heatingSpace-linked-${heatingSpaceReferenceArea.value}` : 'heatingSpace-free',
);

const heatingSpaceMatchLabel = computed(() =>
  din277Mode.value === 'total'
    ? 'commercial.heatingSpaceMatchesNetFloorArea'
    : 'commercial.heatingSpaceMatchesUsableFloorArea',
);

watch(heatingSpaceMatchesArea, (checked) => {
  if (checked) {
    currentValues.heatingSpace = heatingSpaceReferenceArea.value;
  }
});

watch(heatingSpaceReferenceArea, (newValue) => {
  if (heatingSpaceMatchesArea.value) {
    currentValues.heatingSpace = newValue;
  }
});

// ─── Load ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!props.unitId) {
    toast.add({
      severity: 'warn', summary: t('error.general'), detail: t('commercial.noId'), life: 6000 
    });
    return;
  }
  try {
    const data = await commercialService.getCommercial(props.projectId, props.unitId);
    syncState(serverValues, currentValues, {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      netFloorArea: data.netFloorArea ?? null,
      usableFloorArea: data.usableFloorArea ?? null,
      technicalServicesArea: data.technicalServicesArea ?? null,
      trafficArea: data.trafficArea ?? null,
      heatingSpace: data.heatingSpace ?? null,
    });
    if ((data.usableFloorArea ?? 0) > 0 || (data.technicalServicesArea ?? 0) > 0 || (data.trafficArea ?? 0) > 0) {
      din277Mode.value = 'detail';
    }
    const referenceValue = din277Mode.value === 'detail' ? (data.usableFloorArea ?? null) : (data.netFloorArea ?? null);
    heatingSpaceMatchesArea.value =
      !data.heatingSpace || (referenceValue != null && data.heatingSpace === referenceValue);
  } catch (err) {
    console.error('Fehler beim Laden der Gewerbeeinheit:', err);
    toast.add({
      severity: 'error', summary: t('error.general'), detail: t('commercial.loadError'), life: 6000 
    });
  }
});

// ─── Save ─────────────────────────────────────────────────────────────────────
async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;

  const payload: Partial<CommercialJson> = {
    title: s.title?.value || undefined,
    description: s.description?.value || undefined,
    location: titleMatchesLocation.value ? (s.title?.value || undefined) : (s.location?.value || undefined),
    heatingSpace: heatingSpaceMatchesArea.value
      ? (heatingSpaceReferenceArea.value ?? undefined)
      : (s.heatingSpace?.value ?? undefined),
  };

  if (din277Mode.value === 'total') {
    payload.netFloorArea = s.netFloorArea?.value ?? undefined;
    payload.usableFloorArea = 0;
    payload.technicalServicesArea = 0;
    payload.trafficArea = 0;
  } else {
    payload.netFloorArea = din277Sum.value ?? undefined;
    payload.usableFloorArea = s.usableFloorArea?.value ?? undefined;
    payload.technicalServicesArea = s.technicalServicesArea?.value ?? undefined;
    payload.trafficArea = s.trafficArea?.value ?? undefined;
  }

  try {
    await commercialService.updateCommercial(props.projectId, props.unitId, payload as CommercialJson);
    syncState(serverValues, currentValues, {
      title: payload.title,
      description: payload.description || '',
      location: payload.location || '',
      netFloorArea: payload.netFloorArea ?? null,
      usableFloorArea: payload.usableFloorArea ?? null,
      technicalServicesArea: payload.technicalServicesArea ?? null,
      trafficArea: payload.trafficArea ?? null,
      heatingSpace: payload.heatingSpace ?? null,
    });
    toast.add({
      severity: 'success', summary: t('success.saved'), detail: t('commercial.saveSuccess'), life: 3000 
    });
  } catch (err) {
    console.error('Fehler beim Speichern der Gewerbeeinheit:', err);
    showSavingErrorToast(toast, t('commercial.saveError'));
  }
}
</script>

<template>
  <RentableUnitBaseDataCard
    :cardTitle="t('commercial.cardTitle')"
    :formKey
    :initialValues
    :resolver
    :isDirty
    :titleMatchesLocation
    :titleLabel="t('commercial.title')"
    :locationLabel="t('commercial.location')"
    :descriptionLabel="t('commercial.description')"
    @submit="onSubmit"
    @update:titleMatchesLocation="(v) => (titleMatchesLocation = v)"
    @update:title="(v) => (currentValues.title = v)"
    @update:location="(v) => (currentValues.location = v)"
    @update:description="(v) => (currentValues.description = v)"
  >
    <template #fields="{ form }">
      <!-- DIN 277 -->
      <Fieldset :legend="t('commercial.din277.legend')">
        <div class="flex flex-col gap-4">
          <!-- Detail fields (NUF / TF / VF) -->
          <div
            v-if="din277Mode === 'detail'"
            class="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4"
          >
            <!-- Nutzfläche NF -->
            <div class="flex flex-col gap-1">
              <label for="usableFloorArea" class="font-medium">{{ t('commercial.usableFloorArea') }}</label>
              <InputNumber
                id="usableFloorArea"
                name="usableFloorArea"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.usableFloorArea = v as number | null)"
              />
              <Message
                v-if="form.usableFloorArea?.invalid && form.usableFloorArea?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ form.usableFloorArea.error?.message }}
              </Message>
            </div>

            <!-- Technische Funktionsfläche TF -->
            <div class="flex flex-col gap-1">
              <label for="technicalServicesArea" class="font-medium">{{ t('commercial.technicalServicesArea') }}</label>
              <InputNumber
                id="technicalServicesArea"
                name="technicalServicesArea"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.technicalServicesArea = v as number | null)"
              />
              <Message
                v-if="form.technicalServicesArea?.invalid && form.technicalServicesArea?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ form.technicalServicesArea.error?.message }}
              </Message>
            </div>

            <!-- Verkehrsfläche VF -->
            <div class="flex flex-col gap-1">
              <label for="trafficArea" class="font-medium">{{ t('commercial.trafficArea') }}</label>
              <InputNumber
                id="trafficArea"
                name="trafficArea"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.trafficArea = v as number | null)"
              />
              <Message
                v-if="form.trafficArea?.invalid && form.trafficArea?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ form.trafficArea.error?.message }}
              </Message>
            </div>
          </div>

          <!-- NRF / Mode toggle -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4 items-start">
            <!-- Netto-Raumfläche -->
            <div class="flex flex-col gap-1">
              <label for="netFloorArea" class="font-medium">{{ t('commercial.netFloorArea') }}</label>
              <InputNumber
                id="netFloorArea"
                :key="netFloorAreaKey"
                name="netFloorArea"
                :modelValue="din277Mode === 'detail' ? din277Sum : currentValues.netFloorArea"
                :disabled="din277Mode === 'detail'"
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

            <!-- Mode toggle -->
            <div class="flex flex-col gap-1">
              <span class="hidden md:block font-medium invisible" aria-hidden="true">&nbsp;</span>
              <SelectButton
                v-model="din277Mode"
                :options="din277ModeOptions"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            <!-- Heizfläche -->
            <div class="flex flex-col gap-1">
              <label for="heatingSpace" class="font-medium">{{ t('commercial.heatingSpace') }}</label>
              <InputNumber
                id="heatingSpace"
                :key="heatingSpaceKey"
                name="heatingSpace"
                :modelValue="heatingSpaceMatchesArea ? heatingSpaceReferenceArea : currentValues.heatingSpace"
                :disabled="heatingSpaceMatchesArea"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.heatingSpace = v as number | null)"
              />
              <div class="flex items-center gap-2 mt-1">
                <Checkbox v-model="heatingSpaceMatchesArea" inputId="heatingSpaceMatchesArea" binary />
                <label for="heatingSpaceMatchesArea" class="text-sm text-surface-600">
                  {{ t(heatingSpaceMatchLabel) }}
                </label>
              </div>
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
        </div>
      </Fieldset>
    </template>
  </RentableUnitBaseDataCard>
</template>
