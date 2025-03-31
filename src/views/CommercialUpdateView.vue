<script setup lang="ts">
import CommercialEditComponent from '../components/CommercialEditComponent.vue';
import { commercialService, type CommercialUnit } from '@/services/CommercialService';

const props = defineProps<{
  projectId: string;
  propertyId?: string;
  buildingId: string;
  commercialId: string;
}>();

const handleCommercialSubmit = (values: Record<string, any>) => {
  console.log('Submitting commercial:', values);
  // Create the commercial
  const commercial: CommercialUnit = {
    title: values.title,
    location: values.location,
    commercialSpace: values.commercialSpace,
    usableSpace: values.usableSpace,
    heatingSpace: values.heatingSpace,
    description: values.description,
  };
  try {
    const response = commercialService.updateCommercial(
      props.projectId,
      props.commercialId,
      commercial,
    );
    console.log('Commercial created:', response);
  } catch (error) {
    console.error('Error updating commercial:', error);
  }
};

const handleCommercialCancel = () => {
  console.log('Commercial creation canceled');
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
