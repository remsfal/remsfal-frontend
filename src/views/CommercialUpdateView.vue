<script setup lang="ts">
import CommercialEditComponent from '../components/CommercialEditComponent.vue';
import ProjectService, { type CommercialItem } from '@/services/ProjectService';

const props = defineProps<{
  projectId: string;
  propertyId: string;
  buildingId: string;
  commercialId: string;
}>();

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
    const response = projectService.updateCommercial(props.projectId, props.propertyId, props.buildingId, props.commercialId, commercial);
    console.log('Commercial created:', response);
    // TODO go back to the overview
  } catch (error) {
    console.error('Error updating commercial:', error);
  }
};

const handleCommercialCancel = () => {
  console.log('Commercial creation canceled');
  // TODO go back to the overview
};
</script>

<template>
  <CommercialEditComponent
    headline="Gewerbeeinheit bearbeiten"
    :projectId="props.projectId"
    :propertyId="props.propertyId"
    :buildingId="props.buildingId"
    :commercialId="props.commercialId"
    saveButtonText="Speichern"
    cancelButtonText="Abbrechen"
    @submit="handleCommercialSubmit"
    @cancel="handleCommercialCancel"
  />
</template>