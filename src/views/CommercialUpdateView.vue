<script setup lang="ts">
import ReusableForm from '../components/ReusableFormComponent.vue';
import ProjectService, {type PropertyItem} from '@/services/ProjectService';

const props = defineProps<{
  projectId: string;
  propertyId: string;
  buildingId: string;
  commercialId: string;
}>();

const fields = [
  { name: 'name', label: 'Titel', type: 'text', required: true },
  { name: 'location', label: 'Standort', type: 'textarea', required: false },
  {
    name: 'commercialSpace',
    label: 'Gewerbefläche (qm)',
    type: 'text',
    validations: [
      (value) => (!isNaN(value) ? null : 'Muss eine Zahl sein'),
      // or null
      (value) => (value > 0 ? null : 'Muss größer als 0 sein'),
    ],
  },
  {
    name: 'usableSpace',
    label: 'Nutzfläche (qm)',
    type: 'text',
    validations: [
      (value) => (!isNaN(value) ? null : 'Muss eine Zahl sein'),
      (value) => (value > 0 ? null : 'Muss größer als 0 sein'),
    ],
  },
  {
    name: 'heatingSpace',
    label: 'Heizfläche (qm)',
    type: 'text',
    validations: [
      (value) => (!isNaN(value) ? null: 'Muss eine Zahl sein'),
      (value) => (value > 0 ? null: 'Muss größer als 0 sein'),
    ],
  },
  {
    name: 'description',
    label: 'Beschreibung',
    type: 'textarea',
    validations: [
      (value) => (value.length <= 500 ? null : 'Beschreibung muss 500 Zeichen oder weniger sein'),
    ],
  },
];

// get the commercial data from the API
const projectService = new ProjectService();
const commercial = projectService.getCommercial(props.projectId, props.propertyId, props.buildingId, props.commercialId);

const initialCommercialData = {
  title: commercial.title,
  location: commercial.location,
  commercialSpace: commercial.commercialSpace,
  usableSpace: commercial.usableSpace,
  heatingSpace: commercial.heatingSpace,
  description: commercial.description,
  propertyType: commercial.propertyType
};

const handleCommercialSubmit = (values: Record<string, any>) => {
  const projectService = new ProjectService();
  console.log('Submitting commercial:', values);
  try {
    const response = projectService.createCommercial(props.projectId, props.propertyId, props.buildingId, values);
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
    headline="Gewerbeeinheit bearbeiten"
    :fields="fields"
    :initialValues="initialCommercialData"
    saveButtonText="Speichern"
    cancelButtonText="Abbrechen"
    @submit="handleCommercialSubmit"
    @cancel="handleCommercialCancel"
  />
</template>