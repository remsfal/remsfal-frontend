<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ProjectService from '@/services/ProjectService';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

const props = defineProps<{
  projectId: string;
}>();

const router = useRouter();
const route = useRoute();
const projectService = new ProjectService();

const id = ref(route.query.propertyId || '');
const title = ref('');
const description = ref('');
const district = ref<string>(''); // Gemarkung
const corridor = ref<string>(''); // Flur
const parcel = ref<string>(''); // Flurstück
const landRegistry = ref<string>(''); // Liegenschaftsbuch
const usageType = ref<string | null>(null); // Wirtschaftsart
const usageOptions = [
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
  usageType: null,
});

onMounted(() => {
  if (id.value) {
    fetchPropertyDetails();
  }
});

const fetchPropertyDetails = () => {
  projectService
      .getProperty(props.projectId, id.value.toString())
      .then((property) => {
        title.value = property.title || '';
        description.value = property.description || '';
        district.value = property.district || '';
        corridor.value = property.corridor || '';
        parcel.value = property.parcel || '';
        landRegistry.value = property.landRegistry || '';
        usageType.value = property.usageType ?? null;


        originalValues.value = {
          title: title.value,
          description: description.value,
          district: district.value,
          corridor: corridor.value,
          parcel: parcel.value,
          landRegistry: landRegistry.value,
          usageType: usageType.value,
        };
      })
      .catch((err) => {
        console.error('Fehler beim Laden der Objektdetails:', err);
      });
};


const isModified = computed(() => {
  return (
      title.value !== originalValues.value.title ||
      description.value !== originalValues.value.description ||
      district.value !== originalValues.value.district ||
      corridor.value !== originalValues.value.corridor ||
      parcel.value !== originalValues.value.parcel ||
      landRegistry.value !== originalValues.value.landRegistry ||
      usageType.value !== originalValues.value.usageType
  );
});

const updateProperty = () => {
  if (!id.value) return;

  projectService
      .updateProperty(props.projectId, id.value.toString(), {
        title: title.value,
        description: description.value,
        district: district.value || '',
        corridor: corridor.value || '',
        parcel: parcel.value || '',
        landRegistry: landRegistry.value || '',
        usageType: usageType.value ?? null,
        landRegisterEntry: '',
        plotArea: 0,
        effective_space: 0,
      })
      .then(() => {
        router.push(`/project/${props.projectId}/objects`);
      })
      .catch((err) => {
        console.error('Fehler beim Aktualisieren des Eigentums:', err);
      });
};

const cancel = () => {
  router.push(`/project/${props.projectId}/objects`);
};
</script>

<template>
  <div class="col-12">
    <div class="card">
      <h5>Bearbeite Eigentum mit ID: {{ id }}</h5>
      <div class="p-fluid formgrid grid">
        <div class="field col-12">
          <label for="title">Titel</label>
          <InputText id="title" v-model="title" type="text" />
        </div>
        <div class="field col-12">
          <label for="description">Beschreibung</label>
          <Textarea id="description" v-model="description" rows="4" class="no-resize" />
        </div>
        <div class="field col-6">
          <label for="district">Gemarkung</label>
          <InputText id="district" v-model="district" type="text" />
        </div>
        <div class="field col-6">
          <label for="corridor">Flur</label>
          <InputText id="corridor" v-model="corridor" type="text" />
        </div>
        <div class="field col-6">
          <label for="parcel">Flurstück</label>
          <InputText id="parcel" v-model="parcel" type="text" />
        </div>
        <div class="field col-6">
          <label for="landRegistry">Liegenschaftsbuch</label>
          <InputText id="landRegistry" v-model="landRegistry" type="text" />
        </div>
        <div class="field col-6">
          <label for="usageType">Wirtschaftsart</label>
          <Dropdown id="usageType" v-model="usageType" :options="usageOptions" optionLabel="label" />
        </div>
        <div class="field col-12 text-right">
          <Button
              label="Speichern"
              icon="pi pi-check"
              @click="updateProperty"
              class="mr-2"
              :disabled="!isModified"
          />
          <Button
              label="Abbrechen"
              icon="pi pi-times"
              @click="cancel"
              class="p-button-secondary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.text-right {
  text-align: right;
}

.no-resize {
  resize: none;
}
</style>
