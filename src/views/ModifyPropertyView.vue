<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { propertyService, type PropertyUnit } from '@/services/PropertyService';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const router = useRouter();

const title = ref('');
const description = ref('');
const district = ref(''); // Gemarkung
const corridor = ref(''); // Flur
const parcel = ref(''); // Flurstück
const landRegistry = ref(''); // Liegenschaftsbuch
const usageType = ref<string | null>(null); // Wirtschaftsart
const plotArea = ref<number | null>(null); // Grundstücksfläche
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

const originalValues = ref({
  title: '',
  description: '',
  district: '',
  corridor: '',
  parcel: '',
  landRegistry: '',
  usageType: null as string | null,
  plotArea: null as number | null,
});

const hasChanges = computed(() => {
  return (
    title.value !== originalValues.value.title ||
    description.value !== originalValues.value.description ||
    district.value !== originalValues.value.district ||
    corridor.value !== originalValues.value.corridor ||
    parcel.value !== originalValues.value.parcel ||
    landRegistry.value !== originalValues.value.landRegistry ||
    usageType.value !== originalValues.value.usageType ||
    plotArea.value !== originalValues.value.plotArea
  );
});
const isModified = computed(() => hasChanges.value);

const validationErrors = computed(() => {
  const errors: string[] = [];

  if (plotArea.value !== null && plotArea.value < 0) {
    errors.push('Grundstücksfläche darf nicht negativ sein.');
  }
  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

const fetchPropertyDetails = async () => {
  try {
    const data = await propertyService.getProperty(props.projectId, props.unitId);
    title.value = data.title || '';
    description.value = data.description || '';
    district.value = data.district || '';
    corridor.value = data.corridor || '';
    parcel.value = data.parcel || '';
    landRegistry.value = data.landRegistry || '';
    usageType.value = data.usageType || null;
    plotArea.value = data.plotArea ?? null;

    originalValues.value = {
      title: title.value,
      description: description.value,
      district: district.value,
      corridor: corridor.value,
      parcel: parcel.value,
      landRegistry: landRegistry.value,
      usageType: usageType.value,
      plotArea: plotArea.value,
    };
  } catch (err) {
    console.error('Fehler beim Laden der Eigentumsdetails:', err);
    alert('Fehler beim Laden der Eigentumsdetails.');
  }
};

onMounted(() => {
  if (props.unitId) {
    fetchPropertyDetails();
  }
});

const updateProperty = async () => {
  if (!isValid.value) {
    alert('Bitte beheben Sie die Validierungsfehler.');
    return;
  }

  const payload: PropertyUnit = {
    title: title.value,
    description: description.value,
    district: district.value,
    corridor: corridor.value,
    parcel: parcel.value,
    landRegistry: landRegistry.value,
    usageType: usageType.value,
    plotArea: plotArea.value,
  };

  try {
    await propertyService.updateProperty(props.projectId, props.unitId, payload);
    alert('Eigentum erfolgreich aktualisiert.');
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
      <h2 class="text-2xl font-semibold mb-6">Bearbeite Eigentum mit ID: {{ props.unitId }}</h2>

      <form @submit.prevent="updateProperty">
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

          <!-- Gemarkung -->
          <div>
            <label class="block text-gray-700 mb-1">Gemarkung</label>
            <input v-model="district" type="text" class="form-input w-full" />
          </div>

          <!-- Flur -->
          <div>
            <label class="block text-gray-700 mb-1">Flur</label>
            <input v-model="corridor" type="text" class="form-input w-full" />
          </div>

          <!-- Flurstück -->
          <div>
            <label class="block text-gray-700 mb-1">Flurstück</label>
            <input v-model="parcel" type="text" class="form-input w-full" />
          </div>

          <!-- Liegenschaftsbuch -->
          <div>
            <label class="block text-gray-700 mb-1">Liegenschaftsbuch</label>
            <input v-model="landRegistry" type="text" class="form-input w-full" />
          </div>

          <!-- Wirtschaftsart -->
          <div class="col-span-2">
            <label class="block text-gray-700 mb-1">Wirtschaftsart</label>
            <select v-model="usageType" class="form-input w-full">
              <option value="" disabled>Bitte wählen</option>
              <option
                v-for="option in usageOptions"
                :key="option.value ?? option.label"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Grundstücksfläche -->
          <div>
            <label class="block text-gray-700 mb-1">Grundstücksfläche (m²)</label>
            <input v-model.number="plotArea" type="number" class="form-input w-full" />
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
