<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apartmentService, type ApartmentUnit } from '@/services/ApartmentService';

const props = defineProps<{
  projectId: string;
  apartmentId: string;
}>();

const router = useRouter();

// Refs für Felder
const title = ref('');
const location = ref('');
const heatingSpace = ref<number | null>(null);
const livingSpace = ref<number | null>(null);
const usableSpace = ref<number | null>(null);
const description = ref('');

// Originalwerte
const originalValues = ref({
  title: '',
  location: '',
  heatingSpace: null as number | null,
  livingSpace: null as number | null,
  usableSpace: null as number | null,
  description: '',
});

// Änderungen erkennen
const hasChanges = computed(() => {
  return (
    title.value !== originalValues.value.title ||
    location.value !== originalValues.value.location ||
    heatingSpace.value !== originalValues.value.heatingSpace ||
    livingSpace.value !== originalValues.value.livingSpace ||
    usableSpace.value !== originalValues.value.usableSpace ||
    description.value !== originalValues.value.description
  );
});

// Validierung
const validationErrors = computed(() => {
  const errors: string[] = [];
  if (heatingSpace.value !== null && heatingSpace.value < 0)
    errors.push('Heizfläche darf nicht negativ sein.');
  if (livingSpace.value !== null && livingSpace.value < 0)
    errors.push('Wohnfläche darf nicht negativ sein.');
  if (usableSpace.value !== null && usableSpace.value < 0)
    errors.push('Nutzfläche darf nicht negativ sein.');

  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

// Daten laden
const fetchApartment = async () => {
  try {
    const data = await apartmentService.getApartment(props.projectId, props.apartmentId);
    title.value = data.title || '';
    location.value = data.location || '';
    heatingSpace.value = data.heatingSpace ?? null;
    livingSpace.value = data.livingSpace ?? null;
    usableSpace.value = data.usableSpace ?? null;
    description.value = data.description || '';

    originalValues.value = {
      title: title.value,
      location: location.value,
      heatingSpace: heatingSpace.value,
      livingSpace: livingSpace.value,
      usableSpace: usableSpace.value,
      description: description.value,
    };
  } catch (err) {
    console.error('Fehler beim Laden der Wohnung:', err);
  }
};

onMounted(() => {
  if (props.apartmentId) {
    fetchApartment();
  }
});

// Speichern
const save = async () => {
  if (!isValid.value) {
    alert('Bitte beheben Sie die Validierungsfehler.');
    return;
  }

  const payload: ApartmentUnit = {
    title: title.value,
    location: location.value,
    description: description.value,
    heatingSpace: heatingSpace.value ?? undefined,
    livingSpace: livingSpace.value ?? undefined,
    usableSpace: usableSpace.value ?? undefined,
  };

  try {
    await apartmentService.updateApartment(props.projectId, props.apartmentId, payload);
    alert('Apartment erfolgreich aktualisiert!');
    window.location.reload();
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    alert('Fehler beim Speichern des Apartments.');
  }
};
const cancel = () => {
  if (window.opener) {
    window.close();
  } else {
    router.push(`/project/${props.projectId}/objects`);
  }
};
</script>

<template>
  <div class="p-6 w-full">
    <div class="bg-white rounded-lg shadow-md p-10 max-w-screen-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6">Bearbeite Apartment mit ID: {{ apartmentId }}</h2>

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <!-- Titel -->
          <div class="col-span-2">
            <label class="block text-gray-700 mb-1">Titel</label>
            <input v-model="title" type="text" class="form-input w-full" />
          </div>

          <!-- Beschreibung -->
          <div class="col-span-2">
            <label class="block text-gray-700 mb-1">Beschreibung</label>
            <textarea v-model="description" rows="3" class="form-textarea w-full" />
          </div>

          <!-- Standort -->
          <div class="col-span-2">
            <label class="block text-gray-700 mb-1">Standort</label>
            <input v-model="location" type="text" class="form-input w-full" />
          </div>

          <div>
            <label class="block text-gray-700 mb-1">Heizfläche (m²)</label>
            <input v-model.number="heatingSpace" type="number" class="form-input w-full" />
          </div>

          <div>
            <label class="block text-gray-700 mb-1">Wohnfläche (m²)</label>
            <input v-model.number="livingSpace" type="number" class="form-input w-full" />
          </div>

          <div class="col-span-2">
            <label class="block text-gray-700 mb-1">Nutzfläche (m²)</label>
            <input v-model.number="usableSpace" type="number" class="form-input w-full" />
          </div>
        </div>

        <!-- Validierungsfehler -->
        <div v-if="validationErrors.length" class="text-red-600 mt-4">
          <ul>
            <li v-for="(error, i) in validationErrors" :key="i">{{ error }}</li>
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
  background-color: #f3f4f6;
  border-radius: 0.5rem;
}
</style>
