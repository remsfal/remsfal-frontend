<template>
<!-- TODO: Delete -->
<h2>{{ isEditMode ? 'Edit Garage' : 'Create Garage' }}</h2>

<div>
  <ReusableFormComponentVue
  :headline="isEditMode ? 'Edit Garage Form' : 'Garage Creation Form'"
  :fields="fields"
  :initialValues="initialValues"
  saveButtonText="Save"
  cancelButtonText="Cancel"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
</div>
</template>

<script setup lang="ts">
import ReusableFormComponentVue from '@/components/ReusableFormComponent.vue';
import { useRouter, useRoute } from 'vue-router';
import ProjectService, { type GarageItem } from '@/services/ProjectService';
import { onMounted, ref } from 'vue';
import { computed } from 'vue';

const props = defineProps<{
  projectId: string;
  propertyId: string;
  buildingId: string;
  garageId?: string;
}>();

const router = useRouter();
const route = useRoute(); // Get route info
const service = new ProjectService();
const garageId = route.params.garageId as string | undefined;
const isEditMode = computed(() => !!garageId); // `true` if garageId exists, else `false`

const fields: {
    name: string; // Field key
    label: string; // Label for the field
    type: 'text' | 'textarea' | 'checkbox' | 'select'; // Input type
    options?: any[]; // For dropdowns
    required?: boolean; // Is this field required
    validations?: ((value: any) => string | null)[]; // Array of validation functions
  }[] = [
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
    validations: undefined, // Explicitly define when no validations exist
  },
  {
    name: 'usableSpace',
    label: 'Usable Space (m²)',
    type: 'text',
    required: true,
    validations: [
    (value: any): string | null => {
      const numberValue = Number(value);
      return isNaN(numberValue) || numberValue <= 0
        ? 'Usable Space must be a positive number.'
        : null;
      },
    ],
    options: undefined, // Explicitly define when no options exist
  },
];

const initialValues = ref({
  title: '',
  description: '',
  usableSpace: null,
});

// fetch garage
const fetchGarageData = async () => {
  if (!isEditMode.value || !garageId) return;

  try {
    const response: any = await service.getGarage(
      props.projectId,
      props.propertyId,
      props.buildingId,
      garageId
    );
    // Populate the initialValues
    initialValues.value = {
      title: response.data.title || '',
      description: response.data.description || '',
      usableSpace: response.data.usableSpace || '',
    };
  } catch (error) {
    console.error('Failed to fetch garage data:', error);
    alert('Failed to fetch garage data. Please try again.');
  }
};

const handleSubmit = async (values: Record<string, any>) => {
    const garage = {
        title: values.title,
        description: values.description,
        usableSpace: parseFloat(values.usableSpace),
        buildingId: props.buildingId,
    };

  try {
    if (isEditMode.value && garageId) {
      // Update existing garage
      const response = await service.updateGarage(
        props.projectId,
        props.propertyId,
        props.buildingId,
        garageId,
        values.garage
      );
      console.log('Garage updated successfully:', response);
      alert('Garage updated successfully!');
    } else {
      // create a new garage
      const response = await service.createGarage(
      garage.title,
      props.projectId,
      props.propertyId,
      props.buildingId,
      values.garage
    );
    console.log('Garage created successfully:', response);
    alert('Garage created successfully!');
    router.back();
    }
  } catch (error) {
    console.error('Error submitting garage data:', error);
    alert('Failed to submit garage data. Please try again.');
  }
};
const handleCancel = () => {
  console.log("Form Cancelled");
  router.back();
}

onMounted(fetchGarageData);
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