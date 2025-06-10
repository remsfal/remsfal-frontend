<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { garageService, type GarageUnit } from '@/services/GarageService';

const props = defineProps<{
  projectId: string;
  garageId: string;
}>();

const router = useRouter();

// Formfelder
const title = ref('');
const description = ref('');
const location = ref('');
const usableSpace = ref<number | null>(null);

// Originalwerte zur Vergleichserkennung
const originalValues = ref({
  title: '',
  description: '',
  location: '',
  usableSpace: null as number | null,
});

const hasChanges = computed(() => {
  return (
    title.value !== originalValues.value.title ||
    description.value !== originalValues.value.description ||
    location.value !== originalValues.value.location ||
    usableSpace.value !== originalValues.value.usableSpace
  );
});

const validationErrors = computed(() => {
  const errors: string[] = [];
  if (!title.value || title.value.length < 3) {
    errors.push('Der Titel muss mindestens 3 Zeichen lang sein.');
  }
  if (!location.value) {
    errors.push('Standort ist erforderlich.');
  }
  if (usableSpace.value !== null && usableSpace.value < 0) {
    errors.push('Nutzfläche darf nicht negativ sein.');
  }
  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

const fetchGarageDetails = async () => {
  try {
    const data = await garageService.getGarage(props.projectId, props.garageId);
    console.log('Garage-Daten vom Backend:', data); // Hier siehst du die Antwort
    title.value = data.title || '';
    description.value = data.description || '';
    location.value = data.location || '';
    usableSpace.value = data.usableSpace ?? null;

    originalValues.value = {
      title: title.value,
      description: description.value,
      location: location.value,
      usableSpace: usableSpace.value,
    };
  } catch (error) {
    console.error('Fehler beim Laden der Garage:', error);
  }
};
onMounted(() => {
  if (props.garageId) {
    fetchGarageDetails();
  }
});

const save = async () => {
  if (!isValid.value) {
    alert('Bitte beheben Sie die Validierungsfehler.');
    return;
  }

  const payload: GarageUnit = {
    title: title.value,
    description: description.value,
    location: location.value,
    usableSpace: usableSpace.value!,
  };

  try {
    await garageService.updateGarage(props.projectId, props.garageId, payload);
    alert('Garage erfolgreich gespeichert!');
    window.location.reload();
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    alert('Fehler beim Speichern');
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
      <h2 class="text-2xl font-semibold mb-6">Bearbeite Garage mit ID: {{ garageId }}</h2>
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
        </div>

        <!-- Nutzfläche -->
        <div>
          <label class="block text-gray-700 mb-1">Nutzfläche (m²)</label>
          <input v-model.number="usableSpace" type="number" class="form-input w-full" />
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
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
}
</style>
