<script lang="ts" setup>
import UnitBreadcrumb from '@/components/UnitBreadcrumb.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import FacilityAddressCard from '@/components/FacilityAddressCard.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { buildingService } from '@/services/BuildingService.ts';
import type { components } from '@/services/api/platform-schema.ts';
import { useToast } from 'primevue/usetoast';
import {handleCancel,
  navigateToObjects,
  showSavingErrorToast,
  showValidationErrorToast,
  valuesAreEqual,} from '@/helper/viewHelper.ts';

const props = defineProps<{ projectId: string; unitId: string }>();
const router = useRouter();
const toast = useToast();

type BuildingResponse = components['schemas']['BuildingJson'];
type UpdateBuildingRequest = Partial<BuildingResponse>;

// Form fields
const title = ref('');
const description = ref('');
const livingSpace = ref<number | null>(null);
const commercialSpace = ref<number | null>(null);
const usableSpace = ref<number | null>(null);
const heatingSpace = ref<number | null>(null);

// Original values with correct typing
const originalValues = ref({
  title: '' as string,
  description: '' as string,
  livingSpace: null as number | null,
  commercialSpace: null as number | null,
  usableSpace: null as number | null,
  heatingSpace: null as number | null,
});

const hasChanges = computed(
  () =>
    !valuesAreEqual(title.value, originalValues.value.title) ||
    !valuesAreEqual(description.value, originalValues.value.description) ||
    !valuesAreEqual(livingSpace.value, originalValues.value.livingSpace) ||
    !valuesAreEqual(commercialSpace.value, originalValues.value.commercialSpace) ||
    !valuesAreEqual(usableSpace.value, originalValues.value.usableSpace) ||
    !valuesAreEqual(heatingSpace.value, originalValues.value.heatingSpace),
);

const validationErrors = computed(() => {
  const errors: string[] = [];
  if (livingSpace.value === null || livingSpace.value < 0)
    errors.push('Wohnfläche ist erforderlich und darf nicht negativ sein.');
  if (commercialSpace.value === null || commercialSpace.value < 0)
    errors.push('Gewerbefläche ist erforderlich und darf nicht negativ sein.');
  if (usableSpace.value === null || usableSpace.value < 0)
    errors.push('Nutzfläche ist erforderlich und darf nicht negativ sein.');
  if (heatingSpace.value === null || heatingSpace.value < 0)
    errors.push('Heizfläche ist erforderlich und darf nicht negativ sein.');
  if (description.value && description.value.length > 500)
    errors.push('Beschreibung darf maximal 500 Zeichen lang sein.');
  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

const fetchBuildingDetails = () => {
  if (!props.projectId || !props.unitId) return;

  buildingService
    .getBuilding(props.projectId, props.unitId)
    .then((b: any) => {
      title.value = b.title || '';
      description.value = b.description || '';
      livingSpace.value = b.livingSpace ?? null;
      commercialSpace.value = b.commercialSpace ?? null;
      usableSpace.value = b.usableSpace ?? null;
      heatingSpace.value = b.heatingSpace ?? null;

      originalValues.value = {
        title: title.value,
        description: description.value,
        livingSpace: livingSpace.value,
        commercialSpace: commercialSpace.value,
        usableSpace: usableSpace.value,
        heatingSpace: heatingSpace.value,
      };
    })
    .catch((err) => {
      console.error('Fehler beim Laden des Gebäudes:', err);
      toast.add({
        severity: 'error',
        summary: 'Ladefehler',
        detail: 'Gebäude konnte nicht geladen werden.',
        life: 6000,
      });
    });
};

onMounted(() => {
  if (props.unitId) {
    fetchBuildingDetails();
  } else {
    console.warn('unitId fehlt – keine Daten können geladen werden.');
    toast.add({
      severity: 'warn',
      summary: 'Ungültige ID',
      detail: 'Gebäude konnte nicht geladen werden, da keine ID übergeben wurde.',
      life: 6000,
    });
  }
});

const save = () => {
  if (!isValid.value) {
    showValidationErrorToast(toast, validationErrors.value);
    return;
  }

  const payload = {
    title: title.value,
    description: description.value,
    livingSpace: livingSpace.value ?? undefined,
    commercialSpace: commercialSpace.value ?? undefined,
    usableSpace: usableSpace.value ?? undefined,
    heatingSpace: heatingSpace.value ?? undefined,
  } as unknown as UpdateBuildingRequest;


  buildingService
    .updateBuilding(props.projectId, props.unitId, payload)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Erfolg',
        detail: 'Gebäude erfolgreich gespeichert.',
        life: 3000,
      });
      navigateToObjects(router, props.projectId);
    })
    .catch((err) => {
      console.error('Fehler beim Speichern:', err);
      showSavingErrorToast(toast, 'Gebäude konnte nicht gespeichert werden.', err);
    });
};

const cancel = () => handleCancel(hasChanges, router, props.projectId);
</script>

<template>
  <UnitBreadcrumb
    :projectId="props.projectId" 
    :unitId="props.unitId" 
    :currentTitle="title"
    mode="edit" 
  />

  <BaseCard>
    <template #title>
      Bearbeite Gebäude mit ID: {{ unitId }}
    </template>

    <template #content>
      <form @submit.prevent="save">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div class="col-span-2">
            <label for="title" class="block text-gray-700 mb-1">Titel</label>
            <input id="title" v-model="title" type="text" class="form-input w-full">
          </div>

          <div class="col-span-2">
            <label for="description" class="block text-gray-700 mb-1">Beschreibung</label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              class="form-textarea w-full"
            />
          </div>

          <div>
            <label for="livingSpace" class="block text-gray-700 mb-1">Wohnfläche (m²)</label>
            <input
              id="livingSpace"
              v-model.number="livingSpace"
              type="number"
              class="form-input w-full"
            >
          </div>

          <div>
            <label for="commercialSpace" class="block text-gray-700 mb-1">Gewerbefläche (m²)</label>
            <input
              id="commercialSpace"
              v-model.number="commercialSpace"
              type="number"
              class="form-input w-full"
            >
          </div>

          <div>
            <label for="usableSpace" class="block text-gray-700 mb-1">Nutzfläche (m²)</label>
            <input
              id="usableSpace"
              v-model.number="usableSpace"
              type="number"
              class="form-input w-full"
            >
          </div>

          <div>
            <label for="heatingSpace" class="block text-gray-700 mb-1">Heizfläche (m²)</label>
            <input
              id="heatingSpace"
              v-model.number="heatingSpace"
              type="number"
              class="form-input w-full"
            >
          </div>
        </div>

        <div v-if="validationErrors.length" class="text-red-600 mt-4">
          <ul>
            <li v-for="(error, i) in validationErrors" :key="i">
              {{ error }}
            </li>
          </ul>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button
            type="submit"
            :disabled="!hasChanges"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Speichern
          </button>

          <button
            type="button"
            class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            @click="cancel"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </template>
  </BaseCard>

  <FacilityAddressCard
    :projectId="props.projectId"
    :unitId="props.unitId"
    facilityType="building"
  />
</template>

<style scoped>
.form-input,
.form-textarea {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
}
</style>