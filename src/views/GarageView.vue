<template>
<!-- TODO: Delete -->
<p>New Garage</p>

<div>
  <ReusableFormComponentVue
  :headline="'Garage Creation Form'"
  :fields="fields"
  :initialValues="initialValues"
  saveButtonText="Create Garage"
  cancelButtonText="Cancel"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>

</div>
</template>

<script setup lang="ts">
import ReusableFormComponentVue from '@/components/ReusableFormComponent.vue';
import ProjectService, { type GarageItem } from '@/services/ProjectService';
import { ref } from 'vue';

const props = defineProps<{
  projectId: string;
  propertyId: string;
  buildingId: string;
}>();

const fields = [
  {
    name: 'title',
    label: 'Garage Title',
    type: 'text',
    required: true,
    validations: [
      (value: any): string | null =>
        typeof value === 'string' && value.length < 3
          ? 'Title must be at least 3 characters.'
          : null,
    ],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    validations: null, // Explicitly define when no validations exist
  },
  {
    name: 'usableSpace',
    label: 'Usable Space (m²)',
    type: 'text',
    required: true,
    validations: [
      (value: any): string | null =>
        isNaN(parseFloat(value)) || parseFloat(value) <= 0
          ? 'Usable Space must be a positive number.'
          : null,
    ],
    options: undefined, // Explicitly define when no options exist
  },
];

const initialValues = ref({
  title: '',
  description: '',
  usableSpace: '',
});

const handleSubmit = async (values: Record<string, any>) => {
    const service = new ProjectService();
    const garage = {
        title: values.title,
        description: values.description,
        usableSpace: parseFloat(values.usableSpace),
        buildingId: values.buildingId,
    };

  try {
    const response = await service.createGarage(
      garage.title,
      props.projectId,
      props.propertyId,
      props.buildingId,
      values.garage
    );
    console.log('Garage created successfully:', response);
    alert('Garage created successfully!');
  } catch (error) {
    console.error('Error creating garage:', error);
    alert('Failed to create garage. Please try again.');
  }
};
const handleCancel = () => {
  console.log("Form Cancelled");
}
</script>
<style>
.garage-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>