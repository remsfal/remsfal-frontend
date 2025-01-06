<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import ReusableFormComponent from '@/components/ReusableFormComponent.vue';
// Router und Route für IDs
const router = useRouter();
const route = useRoute();
const projectId = route.params.projectId as string;
const commercialId = route.params.commercialId as string;

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

// Ladezustand
const isLoading = ref(false);

// Daten senden
const handleSubmit = async (formData: Record<string, any>) => {
  isLoading.value = true;
  try {
    await axios.post(`/project/${projectId}/commercial/${commercialId}/buildings`, formData);
    alert('Building created successfully!');
    await router.push(`/project/${projectId}/commercial/${commercialId}`);
  } catch (error) {
    console.error('Error creating building:', error);
    alert('Failed to create building. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Abbrechen
const handleCancel = () => {
  router.push(`/project/${projectId}/commercial/${commercialId}`);
};
</script>

<template>
  <div>
    <h1>Create New Building</h1>
    <ReusableFormComponent
        :headline="'Create New Building'"
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
