<script setup lang="ts">
import CommercialEditComponent from '../components/CommercialEditComponent.vue';
import CommercialService, { type CommercialItem } from '@/services/CommercialService';

const props = defineProps<{
  projectId: string;
  propertyId?: string;
  buildingId: string;
}>();

const handleCommercialSubmit = (values: Record<string, any>) => {
  const projectService = new CommercialService();
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
    const response = projectService.createCommercial(props.projectId, props.buildingId, commercial);
    console.log('Commercial created:', response);
    // window.history.back();
  } catch (error) {
    console.error('Error creating commercial:', error);
  }
};

const handleCommercialCancel = () => {
  console.log('Commercial creation canceled');
  // window.history.back();
};
</script>

<template>
  <CommercialEditComponent
    :projectId="props.projectId"
    :propertyId="props.propertyId"
    :buildingId="props.buildingId"
    saveButtonText="Gewerbe erstellen"
    cancelButtonText="Abbrechen"
    headline="Gewerbe erstellen"
    @submit="handleCommercialSubmit"
    @cancel="handleCommercialCancel"
  />
</template>