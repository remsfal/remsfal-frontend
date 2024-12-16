<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import ReusableFormComponent from '@/components/ReusableFormComponent.vue';

// Router und Route für IDs
const router = useRouter();
const route = useRoute();
const projectId = route.params.projectId as string;
const propertyId = route.params.propertyId as string;
const buildingId = route.params.buildingId as string;

// Typ für Felder
interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "checkbox" | "select";
  options?: any[];
  required?: boolean;
  validations?: ((value: any) => string | null)[];
}

// Form Felder
const fields: Field[] = [
  { name: 'title', type: 'text', label: 'Building Name', required: true },
  { name: 'addressId', type: 'text', label: 'Address ID', required: true },
  { name: 'description', type: 'textarea', label: 'Description' },
  {
    name: 'commercialSpace',
    type: 'text',
    label: 'Commercial Space (m²)',
    required: true,
    validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null],
  },
  {
    name: 'usableSpace',
    type: 'text',
    label: 'Usable Space (m²)',
    required: true,
    validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null],
  },
  {
    name: 'heatingSpace',
    type: 'text',
    label: 'Heating Space (m²)',
    validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null],
  },
  {
    name: 'rent',
    type: 'text',
    label: 'Rent (€)',
    validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null],
  },
];
// Initialwerte und Ladezustand
const initialValues = ref<Record<string, any>>({});
const isLoading = ref(false);

// Building-Daten laden
const fetchBuildingData = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/project/${projectId}/property/${propertyId}/buildings/${buildingId}`);
    initialValues.value = response.data;
  } catch (error) {
    console.error('Error fetching building data:', error);
    alert('Failed to load building data. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Daten senden
const handleSubmit = async (formData: Record<string, any>) => {
  isLoading.value = true;
  try {
    await axios.patch(`/project/${projectId}/property/${propertyId}/buildings/${buildingId}`, formData);
    alert('Building updated successfully!');
    await router.push(`/project/${projectId}/property/${propertyId}`);
  } catch (error) {
    console.error('Error updating building:', error);
    alert('Failed to update building. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Abbrechen
const handleCancel = () => {
  router.push(`/project/${projectId}/property/${propertyId}`);
};

// Daten beim Laden abrufen
onMounted(fetchBuildingData);
</script>

<template>
  <div>
    <h1>Update Building</h1>
    <ReusableFormComponent
        :headline="'Update Building'"
        :saveButtonText="'Update'"
        :cancelButtonText="'Cancel'"
        :fields="fields"
        :initialValues="initialValues"
        @submit="handleSubmit"
        @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
