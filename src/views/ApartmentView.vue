\<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apartmentService } from '@/services/ApartmentService';
import { useToast } from 'primevue/usetoast';
import { handleCancel, showSavingErrorToast, showValidationErrorToast } from '@/helper/viewHelper';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const toast = useToast();
const router = useRouter();

// Refs for form fields
const title = ref('');
const location = ref('');
const heatingSpace = ref<number | null>(null);
const livingSpace = ref<number | null>(null);
const usableSpace = ref<number | null>(null);
const description = ref('');

// Original values to detect changes
const originalValues = ref({
  title: '',
  location: '',
  heatingSpace: null as number | null,
  livingSpace: null as number | null,
  usableSpace: null as number | null,
  description: '',
});

// Detect changes
const hasChanges = computed(() => 
  title.value !== originalValues.value.title ||
  location.value !== originalValues.value.location ||
  heatingSpace.value !== originalValues.value.heatingSpace ||
  livingSpace.value !== originalValues.value.livingSpace ||
  usableSpace.value !== originalValues.value.usableSpace ||
  description.value !== originalValues.value.description
);

// Validation
const validationErrors = computed(() => {
  const errors: string[] = [];
  if (heatingSpace.value === null) errors.push('Heizfläche ist erforderlich.');
  else if (heatingSpace.value < 0) errors.push('Heizfläche darf nicht negativ sein.');
  
  if (livingSpace.value === null) errors.push('Wohnfläche ist erforderlich.');
  else if (livingSpace.value < 0) errors.push('Wohnfläche darf nicht negativ sein.');

  if (usableSpace.value === null) errors.push('Nutzfläche ist erforderlich.');
  else if (usableSpace.value < 0) errors.push('Nutzfläche darf nicht negativ sein.');

  if (description.value && description.value.length > 500)
    errors.push('Beschreibung darf maximal 500 Zeichen lang sein.');

  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

// Load apartment data
const fetchApartment = async () => {
  if (!props.projectId || !props.unitId) return;

  try {
    const data = await apartmentService.getApartment(
      props.projectId, 
      props.unitId
    ) as {
      title?: string;
      location?: string;
      heatingSpace?: number | null;
      livingSpace?: number | null;
      usableSpace?: number | null;
      description?: string;
    };

    // assign to reactive refs
    title.value = data.title || '';
    location.value = data.location || '';
    heatingSpace.value = data.heatingSpace ?? null;
    livingSpace.value = data.livingSpace ?? null;
    usableSpace.value = data.usableSpace ?? null;
    description.value = data.description || '';

    // normalize data for originalValues
    originalValues.value = {
      title: data.title || '',
      location: data.location || '',
      heatingSpace: data.heatingSpace ?? null,
      livingSpace: data.livingSpace ?? null,
      usableSpace: data.usableSpace ?? null,
      description: data.description || '',
    };
  } catch (err) {
    console.error('Fehler beim Laden der Wohnung:', err);
    toast.add({
      severity: 'error',
      summary: 'Ladefehler',
      detail: 'Wohnung konnte nicht geladen werden.',
      life: 6000,
    });
  }
};

onMounted(() => {
  if (props.unitId) fetchApartment();
  else {
    toast.add({
      severity: 'warn',
      summary: 'Ungültige ID',
      detail: 'Wohnung konnte nicht geladen werden, da keine ID übergeben wurde.',
      life: 6000,
    });
  }
});

// Save
const save = async () => {
  if (!isValid.value) {
    showValidationErrorToast(toast, validationErrors.value);
    return;
  }

  const payload = {
    title: title.value,
    location: location.value,
    description: description.value,
    heatingSpace: heatingSpace.value ?? undefined,
    livingSpace: livingSpace.value ?? undefined,
    usableSpace: usableSpace.value ?? undefined,
  };

  try {
    await apartmentService.updateApartment(props.projectId, props.unitId, payload);
    toast.add({
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Apartment erfolgreich gespeichert.',
      life: 6000,
    });
    router.push(`/project/${props.projectId}/apartment/${props.unitId}`);
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    showSavingErrorToast(toast, 'Apartment konnte nicht gespeichert werden.');
  }
};

// Cancel
const cancel = () => handleCancel(hasChanges, router, props.projectId);
</script>

<template>
  <div class="p-6 w-full">
    <div class="bg-white rounded-lg shadow-md p-10 max-w-screen-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6">
        Bearbeite Apartment mit ID: {{ unitId }}
      </h2>

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <!-- Titel -->
          <div class="col-span-2">
            <label
              for="title"
              class="block text-gray-700 mb-1"
            >Titel</label>
            <input
              id="title"
              v-model="title"
              type="text"
              class="form-input w-full"
            >
          </div>

          <!-- Beschreibung -->
          <div class="col-span-2">
            <label
              for="description"
              class="block text-gray-700 mb-1"
            >Beschreibung</label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              class="form-textarea w-full"
            />
          </div>

          <!-- Standort -->
          <div class="col-span-2">
            <label
              for="location"
              class="block text-gray-700 mb-1"
            >Standort</label>
            <input
              id="location"
              v-model="location"
              type="text"
              class="form-input w-full"
            >
          </div>

          <div>
            <label
              for="heatingSpace"
              class="block text-gray-700 mb-1"
            >Heizfläche (m²)</label>
            <input
              id="heatingSpace"
              v-model.number="heatingSpace"
              type="number"
              class="form-input w-full"
            >
          </div>

          <div>
            <label
              for="livingSpace"
              class="block text-gray-700 mb-1"
            >Wohnfläche (m²)</label>
            <input
              id="livingSpace"
              v-model.number="livingSpace"
              type="number"
              class="form-input w-full"
            >
          </div>

          <div class="col-span-2">
            <label
              for="usableSpace"
              class="block text-gray-700 mb-1"
            >Nutzfläche (m²)</label>
            <input
              id="usableSpace"
              v-model.number="usableSpace"
              type="number"
              class="form-input w-full"
            >
          </div>
        </div>

        <!-- Validierungsfehler -->
        <div
          v-if="validationErrors.length"
          class="text-red-600 mt-4"
        >
          <ul>
            <li
              v-for="(error, i) in validationErrors"
              :key="i"
            >
              {{ error }}
            </li>
          </ul>
        </div>

        <!-- Buttons -->
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
    </div>
  </div>
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
