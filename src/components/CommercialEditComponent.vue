<script setup lang="ts">
import ReusableForm from '../components/ReusableFormComponent.vue';
import { onMounted, ref } from 'vue';
import { commercialService, type CommercialUnit } from '@/services/CommercialService';

const props = defineProps<{
  projectId: string;
  unitId?: string;
  buildingId?: string;
  commercialId?: string;
  headline: string; // Optional headline text
  saveButtonText: string; // Text for the save button
  cancelButtonText: string; // Text for the cancel button
  submit?: () => void; // Submit handler
  cancel?: () => void; // Cancel handler
}>();

const fields: {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select';
  options?: any[];
  required?: boolean;
  validations?: ((value: any) => string | null)[];
}[] = [
  {
 name: 'title', label: 'Titel', type: 'text', required: true 
},
  {
 name: 'location', label: 'Standort', type: 'textarea' 
},
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
      (value: any) =>
        value.length <= 500 ? null : 'Beschreibung muss 500 Zeichen oder weniger sein',
    ],
  },
];

const initialCommercialData = ref<CommercialUnit>({
  title: '',
  location: '',
  netFloorArea: 0,
  usableFloorArea: 0,
  technicalServicesArea: 0,
  description: '',
});

onMounted(async () => {
  if (props.commercialId) {
    try {
      initialCommercialData.value = await commercialService.getCommercial(
        props.projectId,
        props.commercialId,
      );
    } catch (error) {
      console.error('Error fetching commercial data:', error);
    }
  }
});
</script>

<template>
  <ReusableForm
    :headline="props.headline"
    :fields="fields"
    :initialValues="initialCommercialData"
    :saveButtonText="props.saveButtonText"
    :cancelButtonText="props.cancelButtonText"
    @submit="props.submit"
    @cancel="props.cancel"
  />
</template>
