<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import Select from 'primevue/select';
import Message from 'primevue/message';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import RentableUnitBaseDataCard from '@/features/project/rentableUnits/components/RentableUnitBaseDataCard.vue';
import {useRentableUnitForm,
  createBaseRentableUnitSchema,} from '@/features/project/rentableUnits/composables/useRentableUnitForm.ts';
import { propertyService } from '@/services/PropertyService.ts';
import type { PropertyJson } from '@/services/PropertyService.ts';
import { showSavingErrorToast } from '@/helper/viewHelper.ts';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const usageOptions = [
  { label: 'Keine Auswahl', value: null },
  { label: 'GF Wohnen', value: 'GF Wohnen' },
  { label: 'GF Handel und Dienstleistung', value: 'GF Handel und Dienstleistung' },
  { label: 'GF zu Versorgungsanlagen', value: 'GF zu Versorgungsanlagen' },
  { label: 'GF zu Entsorgungsanlagen', value: 'GF zu Entsorgungsanlagen' },
  { label: 'GF Gewerbe und Industrie', value: 'GF Gewerbe und Industrie' },
  { label: 'GF Land- und Forstwirtschaft', value: 'GF Land- und Forstwirtschaft' },
  { label: 'GF öffentliche Zwecke', value: 'GF öffentliche Zwecke' },
  { label: 'Bauplatz', value: 'Bauplatz' },
  { label: 'BF Abbauland Sand', value: 'BF Abbauland Sand' },
  { label: 'BF Abbauland Kies', value: 'BF Abbauland Kies' },
  { label: 'BF Abbauland Lehm, Ton, Mergel', value: 'BF Abbauland Lehm, Ton, Mergel' },
  { label: 'BF Abbauland Gestein', value: 'BF Abbauland Gestein' },
  { label: 'BF Abbauland Kohle, Torf', value: 'BF Abbauland Kohle, Torf' },
  { label: 'BF Halde', value: 'BF Halde' },
  { label: 'BF Lagerplatz', value: 'BF Lagerplatz' },
  { label: 'BF Versorgungsanlage', value: 'BF Versorgungsanlage' },
  { label: 'BF Entsorgungsanlage', value: 'BF Entsorgungsanlage' },
  { label: 'Abbauland, noch nicht aufgeschlüsselt', value: 'Abbauland, noch nicht aufgeschlüsselt' },
  { label: 'Sportfläche', value: 'Sportfläche' },
  { label: 'Kleingartenanlage', value: 'Kleingartenanlage' },
  { label: 'Wochenendgelände', value: 'Wochenendgelände' },
  { label: 'Andere Grünanlage', value: 'Andere Grünanlage' },
  { label: 'Campingplatz', value: 'Campingplatz' },
  { label: 'Erholungsfläche, noch nicht aufgeschlüsselt', value: 'Erholungsfläche, noch nicht aufgeschlüsselt' },
  { label: 'Straße', value: 'Straße' },
  { label: 'Weg', value: 'Weg' },
  { label: 'Platz', value: 'Platz' },
  { label: 'Bahngelände', value: 'Bahngelände' },
  { label: 'Flugplatz', value: 'Flugplatz' },
  { label: 'Verkehrsfläche Schiffsverkehr', value: 'Verkehrsfläche Schiffsverkehr' },
  { label: 'Verkehrsfläche, noch nicht aufgeschlüsselt', value: 'Verkehrsfläche, noch nicht aufgeschlüsselt' },
  { label: 'Grünland', value: 'Grünland' },
  { label: 'Ackerland', value: 'Ackerland' },
  { label: 'Gartenland', value: 'Gartenland' },
  { label: 'Moor', value: 'Moor' },
  { label: 'Heide', value: 'Heide' },
  { label: 'Weingarten', value: 'Weingarten' },
  { label: 'Obstanbaufläche', value: 'Obstanbaufläche' },
  { label: 'Brachland', value: 'Brachland' },
  { label: 'Laubwald', value: 'Laubwald' },
  { label: 'Nadelwald', value: 'Nadelwald' },
  { label: 'Mischwald', value: 'Mischwald' },
  { label: 'Gehölz', value: 'Gehölz' },
  { label: 'Waldfläche, noch nicht aufgeschlüsselt', value: 'Waldfläche, noch nicht aufgeschlüsselt' },
  { label: 'Fließgewässer', value: 'Fließgewässer' },
  { label: 'Kanal', value: 'Kanal' },
  { label: 'Hafen', value: 'Hafen' },
  { label: 'Bach, Graben', value: 'Bach, Graben' },
  { label: 'Stehendes Gewässer', value: 'Stehendes Gewässer' },
  { label: 'Sumpf', value: 'Sumpf' },
  { label: 'Wasserfläche, noch nicht aufgeschlüsselt', value: 'Wasserfläche, noch nicht aufgeschlüsselt' },
  { label: 'Militärisches Übungsgelände', value: 'Militärisches Übungsgelände' },
  { label: 'Anderes Übungsgelände', value: 'Anderes Übungsgelände' },
  { label: 'Schutzfläche', value: 'Schutzfläche' },
  { label: 'Historische Anlage', value: 'Historische Anlage' },
  { label: 'Friedhof', value: 'Friedhof' },
  { label: 'Unland', value: 'Unland' },
  { label: 'Nutzung noch nicht zugeordnet', value: 'Nutzung noch nicht zugeordnet' },
];

const schema = z.object({
  ...createBaseRentableUnitSchema(t),
  cadastralDistrict: z.string().trim().optional().or(z.literal('')),
  sheetNumber: z.string().trim().optional().or(z.literal('')),
  cadastralSection: z.string().trim().optional().or(z.literal('')),
  plot: z.string().trim().optional().or(z.literal('')),
  plotNumber: z.number().int().positive({ message: t('validation.minValue', { min: 1 }) }).nullable().optional(),
  landRegistry: z.string().trim().optional().or(z.literal('')),
  economyType: z.string().nullable().optional(),
  plotArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  space: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  title: '', description: '', cadastralDistrict: '', sheetNumber: '',
  cadastralSection: '', plot: '', plotNumber: null as number | null,
  landRegistry: '', economyType: null as string | null, location: '',
  plotArea: null as number | null, space: null as number | null,
});

const currentValues = reactive({ ...serverValues });
const { titleMatchesLocation, formKey, initialValues, syncState } = useRentableUnitForm(currentValues);

const isDirty = computed(() =>
  currentValues.title !== serverValues.title ||
  currentValues.description !== serverValues.description ||
  currentValues.cadastralDistrict !== serverValues.cadastralDistrict ||
  currentValues.sheetNumber !== serverValues.sheetNumber ||
  currentValues.cadastralSection !== serverValues.cadastralSection ||
  currentValues.plot !== serverValues.plot ||
  currentValues.plotNumber !== serverValues.plotNumber ||
  currentValues.landRegistry !== serverValues.landRegistry ||
  currentValues.economyType !== serverValues.economyType ||
  currentValues.location !== serverValues.location ||
  currentValues.plotArea !== serverValues.plotArea ||
  currentValues.space !== serverValues.space,
);

onMounted(async () => {
  if (!props.unitId) {
    toast.add({
 severity: 'warn', summary: t('error.general'), detail: t('property.noId'), life: 6000 
});
    return;
  }
  try {
    const data = await propertyService.getProperty(props.projectId, props.unitId);
    syncState(serverValues, currentValues, {
      title: data.title || '',
      description: data.description || '',
      cadastralDistrict: data.cadastralDistrict || '',
      sheetNumber: data.sheetNumber || '',
      cadastralSection: data.cadastralSection || '',
      plot: data.plot || '',
      plotNumber: data.plotNumber ?? null,
      landRegistry: data.landRegistry || '',
      economyType: data.economyType || null,
      location: data.location || '',
      plotArea: data.plotArea ?? null,
      space: data.space ?? null,
    });
  } catch (err) {
    console.error('Fehler beim Laden der Grundstücksdaten:', err);
    toast.add({
 severity: 'error', summary: t('error.general'), detail: t('property.loadError'), life: 6000 
});
  }
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  const payload: PropertyJson = {
    title: s.title?.value || undefined,
    description: s.description?.value || undefined,
    cadastralDistrict: s.cadastralDistrict?.value || undefined,
    sheetNumber: s.sheetNumber?.value || undefined,
    cadastralSection: s.cadastralSection?.value || undefined,
    plot: s.plot?.value || undefined,
    plotNumber: s.plotNumber?.value ?? undefined,
    landRegistry: s.landRegistry?.value || undefined,
    economyType: s.economyType?.value ?? undefined,
    location: titleMatchesLocation.value ? (s.title?.value || undefined) : (s.location?.value || undefined),
    plotArea: s.plotArea?.value ?? undefined,
    space: s.space?.value ?? undefined,
  };
  try {
    await propertyService.updateProperty(props.projectId, props.unitId, payload);
    syncState(serverValues, currentValues, {
      title: payload.title || '',
      description: payload.description || '',
      cadastralDistrict: payload.cadastralDistrict || '',
      sheetNumber: payload.sheetNumber || '',
      cadastralSection: payload.cadastralSection || '',
      plot: payload.plot || '',
      plotNumber: payload.plotNumber ?? null,
      landRegistry: payload.landRegistry || '',
      economyType: payload.economyType || null,
      location: payload.location || '',
      plotArea: payload.plotArea ?? null,
      space: payload.space ?? null,
    });
    toast.add({
 severity: 'success', summary: t('success.saved'), detail: t('property.saveSuccess'), life: 3000 
});
  } catch (err) {
    console.error('Fehler beim Speichern der Grundstücksdaten:', err);
    showSavingErrorToast(toast, t('property.saveError'));
  }
}
</script>

<template>
  <RentableUnitBaseDataCard
    :cardTitle="t('property.cardTitle')"
    :formKey
    :initialValues
    :resolver
    :isDirty
    :titleMatchesLocation
    :titleLabel="t('property.title')"
    :locationLabel="t('property.location')"
    :descriptionLabel="t('property.description')"
    @submit="onSubmit"
    @update:titleMatchesLocation="(v) => (titleMatchesLocation = v)"
    @update:title="(v) => (currentValues.title = v)"
    @update:location="(v) => (currentValues.location = v)"
    @update:description="(v) => (currentValues.description = v)"
  >
    <template #fields="{ form }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <!-- Gemarkung -->
        <div class="flex flex-col gap-1">
          <label for="cadastralDistrict" class="font-medium">{{ t('property.cadastralDistrict') }}</label>
          <InputText
            id="cadastralDistrict"
            name="cadastralDistrict"
            fluid
            @update:modelValue="(v) => (currentValues.cadastralDistrict = v as string)"
          />
        </div>

        <!-- Blattnummer -->
        <div class="flex flex-col gap-1">
          <label for="sheetNumber" class="font-medium">{{ t('property.sheetNumber') }}</label>
          <InputText
            id="sheetNumber"
            name="sheetNumber"
            fluid
            @update:modelValue="(v) => (currentValues.sheetNumber = v as string)"
          />
        </div>

        <!-- Flur -->
        <div class="flex flex-col gap-1">
          <label for="cadastralSection" class="font-medium">{{ t('property.cadastralSection') }}</label>
          <InputText
            id="cadastralSection"
            name="cadastralSection"
            fluid
            @update:modelValue="(v) => (currentValues.cadastralSection = v as string)"
          />
        </div>

        <!-- Flurstück -->
        <div class="flex flex-col gap-1">
          <label for="plot" class="font-medium">{{ t('property.plot') }}</label>
          <InputText
            id="plot"
            name="plot"
            fluid
            @update:modelValue="(v) => (currentValues.plot = v as string)"
          />
        </div>

        <!-- Flurstücksnummer -->
        <div class="flex flex-col gap-1">
          <label for="plotNumber" class="font-medium">{{ t('property.plotNumber') }}</label>
          <InputNumber
            id="plotNumber"
            name="plotNumber"
            :minFractionDigits="0"
            :maxFractionDigits="0"
            :min="1"
            fluid
            @update:modelValue="(v) => (currentValues.plotNumber = v as number | null)"
          />
          <Message
            v-if="form.plotNumber?.invalid && form.plotNumber?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ form.plotNumber.error?.message }}
          </Message>
        </div>

        <!-- Liegenschaftsbuch -->
        <div class="flex flex-col gap-1">
          <label for="landRegistry" class="font-medium">{{ t('property.landRegister') }}</label>
          <InputText
            id="landRegistry"
            name="landRegistry"
            fluid
            @update:modelValue="(v) => (currentValues.landRegistry = v as string)"
          />
        </div>

        <!-- Wirtschaftsart -->
        <div class="col-span-2 flex flex-col gap-1">
          <label for="economyType" class="font-medium">{{ t('property.economyType') }}</label>
          <Select
            id="economyType"
            name="economyType"
            :options="usageOptions"
            optionLabel="label"
            optionValue="value"
            showClear
            filter
            fluid
            @update:modelValue="(v) => (currentValues.economyType = v as string | null)"
          />
        </div>

        <!-- Grundstücksfläche -->
        <div class="flex flex-col gap-1">
          <label for="plotArea" class="font-medium">{{ t('property.plotArea') }}</label>
          <InputNumber
            id="plotArea"
            name="plotArea"
            :min="0"
            :maxFractionDigits="2"
            fluid
            @update:modelValue="(v) => (currentValues.plotArea = v as number | null)"
          />
          <Message
            v-if="form.plotArea?.invalid && form.plotArea?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ form.plotArea.error?.message }}
          </Message>
        </div>

        <!-- Nutzfläche -->
        <div class="flex flex-col gap-1">
          <label for="space" class="font-medium">{{ t('property.space') }}</label>
          <InputNumber
            id="space"
            name="space"
            :min="0"
            :maxFractionDigits="2"
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
