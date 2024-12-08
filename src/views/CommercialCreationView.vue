<script setup lang="ts">
import ReusableForm from '../components/ReusableFormComponent.vue';
import ProjectService, { type CommercialItem } from '@/services/ProjectService';

const props = defineProps<{
  projectId: string;
  propertyId: string;
  buildingId: string;
}>();

const fields: {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select';
  options?: any[];
  required?: boolean;
  validations?: ((value: any) => string | null)[];
}[] = [
  { name: 'title', label: 'Titel', type: 'text', required: true },
  { name: 'location', label: 'Standort', type: 'textarea', required: false },
  {
    name: 'commercialSpace',
    label: 'Gewerbefläche (qm)',
    type: 'text',
    validations: [
      (value: any) => (!isNaN(value) ? null : 'Muss eine Zahl sein'),
      (value: any) => (value > 0 ? null : 'Muss größer als 0 sein'),
    ],
  },
  {
    name: 'usableSpace',
    label: 'Nutzfläche (qm)',
    type: 'text',
    validations: [
      (value: any) => (!isNaN(value) ? null : 'Muss eine Zahl sein'),
      (value: any) => (value > 0 ? null : 'Muss größer als 0 sein'),
    ],
  },
  {
    name: 'heatingSpace',
    label: 'Heizfläche (qm)',
    type: 'text',
    validations: [
      (value: any) => (!isNaN(value) ? null : 'Muss eine Zahl sein'),
      (value: any) => (value > 0 ? null : 'Muss größer als 0 sein'),
    ],
  },
  {
    name: 'description',
    label: 'Beschreibung',
    type: 'textarea',
    validations: [
      (value: any) => (value.length <= 500 ? null : 'Beschreibung muss 500 Zeichen oder weniger sein'),
    ],
  },
];

const initialCommercialData = {};

const handleCommercialSubmit = (values: Record<string, any>) => {
  const projectService = new ProjectService();
  console.log('Submitting commercial:', values);
  // Create the commercial
  const commercial: CommercialItem = {
    buildingId: props.buildingId,
    title: values.title,
    location: values.location,
    commercialSpace: values.commercialSpace,
    usableSpace: values.usableSpace,
    heatingSpace: values.heatingSpace,
    description: values.description
  };
  try {
    const response = projectService.createCommercial(props.projectId, props.propertyId, props.buildingId, commercial);
    console.log('Commercial created:', response);
    // TODO go back to the overview
  } catch (error) {
    console.error('Error creating commercial:', error);
  }
};

const handleCommercialCancel = () => {
  console.log('Commercial creation canceled');
  // TODO go back to the overview
};
</script>

<template>
  <ReusableForm
      headline="Neue Gewerbeeinheit erstellen"
      :fields="fields"
      :initialValues="initialCommercialData"
      saveButtonText="Gewerbeeinheit erstellen"
      cancelButtonText="Abbrechen"
      @submit="handleCommercialSubmit"
      @cancel="handleCommercialCancel"
  />
</template>