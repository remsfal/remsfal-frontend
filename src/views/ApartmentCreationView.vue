<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import ReusableFormComponent from '@/components/ReusableFormComponent.vue';

// Router und Route für Projekt- und Gebäudekontext
const router = useRouter();
const route = useRoute();
const projectId = route.params.projectId as string;
const buildingId = route.query.buildingId as string;

// Typ für Felder-Array
interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "checkbox" | "select";
  options?: any[];
  required?: boolean;
  validations?: ((value: any) => string | null)[];
}

// Form Felder für Apartment Erstellung
const fields: Field[] = [
  { name: 'title', type: 'text', label: 'Title', required: true },
  { name: 'location', type: 'text', label: 'Location', required: true },
  {
    name: 'heatingSpace',
    type: 'text',
    label: 'Heating Space (m²)',
    required: true,
    validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null],
  },
  {
    name: 'livingSpace',
    type: 'text',
    label: 'Living Space (m²)',
    required: true,
    validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null],
  },
  { name: 'description', type: 'textarea', label: 'Description', required: false },
  {
    name: 'usableSpace',
    type: 'text',
    label: 'Usable Space (m²)',
    required: true,
    validations: [(value) => isNaN(Number(value)) ? 'Must be a number' : null],
  },
];

// Laden-Status für API-Interaktionen
const isLoading = ref(false);

// Formular-Daten an Backend senden
const handleSubmit = async (formData: Record<string, any>) => {
  isLoading.value = true;
  try {
    await axios.post(
        `/project/${projectId}/building/${buildingId}/apartments`,
        formData
    );
    alert('Apartment created successfully!');
    router.push(`/project/${projectId}/buildings/${buildingId}`);
  } catch (error) {
    console.error('Error creating apartment:', error);
    alert('Failed to create apartment. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Abbrechen Aktion
const handleCancel = () => {
  router.push(`/project/${projectId}/buildings/${buildingId}`);
};
</script>

<template>
  <div>
    <h1>Create New Apartment</h1>
    <ReusableFormComponent
        :headline="'Create New Apartment'"
        :saveButtonText="'Create'"
        :cancelButtonText="'Cancel'"
        :fields="fields"
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
