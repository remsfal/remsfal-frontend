<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { propertyService, type PropertyUnit } from '@/services/PropertyService';
import { useToast } from 'primevue/usetoast';
import { handleCancel, showSavingErrorToast, showValidationErrorToast, valuesAreEqual } from '@/helper/viewHelper';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const toast = useToast();
const router = useRouter();

const title = ref('');
const description = ref('');
const district = ref(''); // Gemarkung (cadastralDistrict)
const corridor = ref(''); // Flur
const parcel = ref(''); // Flurstück
const landRegisterEntry = ref(''); // Liegenschaftsbuch (landRegistry)
const usageType = ref<string | null>(null); // Wirtschaftsart
const plotArea = ref<number | null>(null); // Grundstücksfläche (effectiveSpace)

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
  {
    label: 'Abbauland, noch nicht aufgeschlüsselt',
    value: 'Abbauland, noch nicht aufgeschlüsselt',
  },
  { label: 'Sportfläche', value: 'Sportfläche' },
  { label: 'Kleingartenanlage', value: 'Kleingartenanlage' },
  { label: 'Wochenendgelände', value: 'Wochenendgelände' },
  { label: 'Andere Grünanlage', value: 'Andere Grünanlage' },
  { label: 'Campingplatz', value: 'Campingplatz' },
  {
    label: 'Erholungsfläche, noch nicht aufgeschlüsselt',
    value: 'Erholungsfläche, noch nicht aufgeschlüsselt',
  },
  { label: 'Straße', value: 'Straße' },
  { label: 'Weg', value: 'Weg' },
  { label: 'Platz', value: 'Platz' },
  { label: 'Bahngelände', value: 'Bahngelände' },
  { label: 'Flugplatz', value: 'Flugplatz' },
  { label: 'Verkehrsfläche Schiffsverkehr', value: 'Verkehrsfläche Schiffsverkehr' },
  {
    label: 'Verkehrsfläche, noch nicht aufgeschlüsselt',
    value: 'Verkehrsfläche, noch nicht aufgeschlüsselt',
  },
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
  {
    label: 'Waldfläche, noch nicht aufgeschlüsselt',
    value: 'Waldfläche, noch nicht aufgeschlüsselt',
  },
  { label: 'Fließgewässer', value: 'Fließgewässer' },
  { label: 'Kanal', value: 'Kanal' },
  { label: 'Hafen', value: 'Hafen' },
  { label: 'Bach, Graben', value: 'Bach, Graben' },
  { label: 'Stehendes Gewässer', value: 'Stehendes Gewässer' },
  { label: 'Sumpf', value: 'Sumpf' },
  {
    label: 'Wasserfläche, noch nicht aufgeschlüsselt',
    value: 'Wasserfläche, noch nicht aufgeschlüsselt',
  },
  { label: 'Militärisches Übungsgelände', value: 'Militärisches Übungsgelände' },
  { label: 'Anderes Übungsgelände', value: 'Anderes Übungsgelände' },
  { label: 'Schutzfläche', value: 'Schutzfläche' },
  { label: 'Historische Anlage', value: 'Historische Anlage' },
  { label: 'Friedhof', value: 'Friedhof' },
  { label: 'Unland', value: 'Unland' },
  { label: 'Nutzung noch nicht zugeordnet', value: 'Nutzung noch nicht zugeordnet' },
];

const originalValues = ref<PropertyUnit | null>(null); // no fallback

const hasChanges = computed(() => {
  if (!originalValues.value) return false;
  const orig = originalValues.value as any;

  return (
    !valuesAreEqual(title.value, orig.title) ||
    !valuesAreEqual(description.value, orig.description) ||
    !valuesAreEqual(district.value, orig.cadastralDistrict) ||
    !valuesAreEqual(corridor.value, orig.cadastralSection) ||
    !valuesAreEqual(parcel.value, orig.plot) ||
    !valuesAreEqual(landRegisterEntry.value, orig.landRegistry) ||
    !valuesAreEqual(usageType.value, orig.economyType) ||
    !valuesAreEqual(plotArea.value, orig.plotArea)
  );
});

const validationErrors = computed(() => {
  const errors: string[] = [];

  if (!title.value || title.value.length < 3) {
    errors.push('Der Titel muss mindestens 3 Zeichen lang sein.');
  }
  if (description.value && description.value.length > 500) {
    errors.push('Beschreibung darf maximal 500 Zeichen lang sein.');
  }
  if (usageType.value === null) {
    errors.push('Wirtschaftsart ist erforderlich.');
  }
  if (plotArea.value === null) {
    errors.push('Grundstücksfläche ist erforderlich.');
  } else if (plotArea.value < 0) {
    errors.push('Grundstücksfläche darf nicht negativ sein.');
  }
  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

const fetchPropertyDetails = async () => {
  if (!props.projectId || !props.unitId) return;

  try {
    const data = await propertyService.getProperty(props.projectId, props.unitId);

    // Map backend fields to frontend refs
    title.value = data.title || '';
    description.value = data.description || '';
    district.value = data.cadastralDistrict || '';
    corridor.value = data.cadastralSection || ''; // map cadastralSection
    parcel.value = data.plot || ''; // map plot
    landRegisterEntry.value = data.landRegistry || '';
    usageType.value = data.economyType || null; // map economyType
    plotArea.value = data.plotArea ?? null; // map plotArea

    // Store original values for change detection
    originalValues.value = { ...data };
  } catch (err) {
    console.error('Fehler beim Laden der Eigentumsdetails:', err);
    toast.add({
      severity: 'error',
      summary: 'Ladefehler',
      detail: 'Eigentum konnte nicht geladen werden.',
      life: 6000,
    });
  }
};

onMounted(() => {
  if (props.unitId) {
    fetchPropertyDetails();
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Ungültige ID',
      detail: 'Grundstück konnte nicht geladen werden, da keine ID übergeben wurde.',
      life: 6000,
    });
  }
});

const save = async () => {
  if (!isValid.value) {
    showValidationErrorToast(toast, validationErrors.value);
    return;
  }

  const payload: PropertyUnit = {
    title: title.value,
    description: description.value,
    cadastralDistrict: district.value,
    cadastralSection: corridor.value, // frontend corridor → backend cadastralSection
    plot: parcel.value, // frontend parcel → backend plot
    landRegistry: landRegisterEntry.value,
    economyType: usageType.value ?? undefined, // convert null → undefined
    plotArea: plotArea.value ?? undefined, // convert null → undefined
  };

  try {
    await propertyService.updateProperty(props.projectId, props.unitId, payload);
    toast.add({
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Eigentum erfolgreich gespeichert.',
      life: 6000,
    });
    router.push(`/project/${props.projectId}/property/${props.unitId}`);
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    showSavingErrorToast(toast, 'Eigentum konnte nicht gespeichert werden.');
  }
};

const cancel = () => handleCancel(hasChanges, router, props.projectId);
</script>

<template>
  <div class="p-6 w-full">
    <div class="bg-white rounded-lg shadow-md p-10 max-w-screen-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6">
        Bearbeite Eigentum mit ID: {{ props.unitId }}
      </h2>

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <!-- Titel -->
          <div class="col-span-2">
            <label for="title" class="block text-gray-700 mb-1">Titel</label>
            <input id="title" v-model="title" type="text" class="form-input w-full">
          </div>

          <!-- Beschreibung -->
          <div class="col-span-2">
            <label for="description" class="block text-gray-700 mb-1">Beschreibung</label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              class="form-textarea w-full"
            />
          </div>

          <!-- Gemarkung -->
          <div>
            <label for="district" class="block text-gray-700 mb-1">Gemarkung</label>
            <input id="district" v-model="district" type="text" class="form-input w-full">
          </div>

          <!-- Flur -->
          <div>
            <label for="corridor" class="block text-gray-700 mb-1">Flur</label>
            <input id="corridor" v-model="corridor" type="text" class="form-input w-full">
          </div>

          <!-- Flurstück -->
          <div>
            <label for="parcel" class="block text-gray-700 mb-1">Flurstück</label>
            <input id="parcel" v-model="parcel" type="text" class="form-input w-full">
          </div>

          <!-- Liegenschaftsbuch -->
          <div>
            <label for="landRegisterEntry" class="block text-gray-700 mb-1">Liegenschaftsbuch</label>
            <input
              id="landRegisterEntry"
              v-model="landRegisterEntry"
              type="text"
              class="form-input w-full"
            >
          </div>

          <!-- Wirtschaftsart -->
          <div class="col-span-2">
            <label for="usageType" class="block text-gray-700 mb-1">Wirtschaftsart</label>
            <select id="usageType" v-model="usageType" class="form-input w-full">
              <option value="" disabled>
                Bitte wählen
              </option>
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
            <label for="plotArea" class="block text-gray-700 mb-1">Grundstücksfläche (m²)</label>
            <input
              id="plotArea"
              v-model.number="plotArea"
              type="number"
              class="form-input w-full"
            >
          </div>

          <!-- Validierungsfehler -->
          <div v-if="validationErrors.length" class="text-red-600 mt-4">
            <ul>
              <li v-for="(error, i) in validationErrors" :key="i">
                {{ error }}
              </li>
            </ul>
          </div>

          <!-- Buttons -->
          <div class="mt-6 flex justify-end space-x-4">
            <button
              type="submit"
              :disabled="!hasChanges"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700
               disabled:opacity-50 disabled:cursor-not-allowed"
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
