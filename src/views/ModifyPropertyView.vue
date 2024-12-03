<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
  { label: 'GF (Gebäude und Freifläche)', value: 'GF' },
  { label: 'BF (Betriebsfläche)', value: 'BF' },
  { label: 'Erholungsfläche', value: 'Erholungsfläche' },
];

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
      })
      .catch((err) => {
        console.error('Fehler beim Laden der Objektdetails:', err);
      });
};

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
          <Button label="Speichern" icon="pi pi-check" @click="updateProperty" class="mr-2" />
          <Button label="Abbrechen" icon="pi pi-times" @click="cancel" class="p-button-secondary" />
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
