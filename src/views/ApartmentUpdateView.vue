<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import ReusableFormComponent from '@/components/ReusableFormComponent.vue';

// Router und Route für IDs
const router = useRouter();
const route = useRoute();
const projectId = route.params.projectId as string;
const buildingId = route.params.buildingId as string;
const apartmentId = route.params.apartmentId as string;

// Typ für Felder-Array
interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "checkbox" | "select";
  options?: any[];
  required?: boolean;
  validations?: ((value: any) => string | null)[];
}

// Form Felder für Apartment Update
const fields: Field[] = [
  { name: 'title', type: 'text', label: 'Title', required: true },
  { name: 'location', type: 'text', label: 'Location', required: true },
  { name: 'heatingSpace', type: 'text', label: 'Heating Space (m²)', required: true, validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null] },
  { name: 'livingSpace', type: 'text', label: 'Living Space (m²)', required: true, validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null] },
  { name: 'description', type: 'textarea', label: 'Description', required: false },
  { name: 'usableSpace', type: 'text', label: 'Usable Space (m²)', required: true, validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null] },
];

// Initialwerte und Laden-Status
const initialValues = ref<Record<string, any>>({});
const isLoading = ref(false);

// Apartment-Daten laden
const fetchApartmentData = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(
        `/project/${projectId}/building/${buildingId}/apartments/${apartmentId}`
    );
    initialValues.value = response.data;
  } catch (error) {
    console.error('Error fetching apartment data:', error);
    alert('Failed to load apartment data. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Daten an Backend senden
const handleSubmit = async (formData: Record<string, any>) => {
  isLoading.value = true;
  try {
    await axios.patch(
        `/project/${projectId}/building/${buildingId}/apartments/${apartmentId}`,
        formData
    );
    alert('Apartment updated successfully!');
    router.push(`/project/${projectId}/buildings/${buildingId}`);
  } catch (error) {
    console.error('Error updating apartment:', error);
    alert('Failed to update apartment. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Abbrechen Aktion
const handleCancel = () => {
  router.push(`/project/${projectId}/buildings/${buildingId}`);
};

// Daten beim Laden abrufen
onMounted(fetchApartmentData);
</script>

<template>
  <div>
    <h1>Update Apartment</h1>
    <ReusableFormComponent
        :headline="'Update Apartment'"
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
