<script setup lang="ts">
import ReusableForm from '../components/ReusableFormComponent.vue';
import {  ref } from 'vue';

const props = defineProps<{
  projectId: string;
  propertyId?: string;
  siteId?: string;
  headline: string; // Optional headline text
  saveButtonText: string; // Text for the save button
  cancelButtonText: string; // Text for the cancel button
  onSubmit?: (formValues: any) => Promise<void>; // Submit handler
  onCancel?: () => void; // Cancel handler
  initialValues?: Record<string, any>;
}>();

// Define the form fields based on the SiteJson structure
const fields: {
  name: string;
  label: string;
  type: "select" | "textarea" | "text" | "checkbox";
  options?: any[];
  required?: boolean;
  validations?: ((value: any) => string | null)[];
}[] = [
  {
    name: 'title',
    label: 'Titel',
    type: 'text',
    required: true,
    validations: [
      (value: string) => (value.length > 255 ? 'Ein Titel darf nicht mehr als 255 Zeichen lang sein.' : null),
    ],
  },
  {
    name: 'description',
    label: 'Beschreibung',
    type: 'textarea',
  },
  {
    name: 'usableSpace',
    label: 'Nutzfläche (qm)',
    type: 'text',
    validations: [
      (value) => (!isNaN(value) ? null : 'Muss eine Zahl sein'),
    ],
  },
  {
    name: 'street',
    label: 'Straße und Hausnummer',
    type: 'text',
    required: false,
  },
  {
    name: 'city',
    label: 'Stadt',
    type: 'text',
    required: false,
  },
  {
    name: 'zip',
    label: 'PLZ',
    type: 'text',
    required: false,
  },
  {
    name: 'province',
    label: 'Bundesland',
    type: 'text',
    required: false,
  },
  {
    name: 'country',
    label: 'Land',
    type: 'text',
    required: false,
  },
];

let initialValues = ref(props.initialValues);

if (!props.initialValues) {
  initialValues = ref({
    title: '',
    description: '',
    usableSpace: '',
    street: '',
    city: '',
    zip: '',
    province: '',
    country: ''
  });
}

</script>

<template>
  <ReusableForm
    :fields="fields"
    :initialValues="initialValues"
    :headline="headline"
    :saveButtonText="saveButtonText"
    :cancelButtonText="cancelButtonText"
    :onSubmit="onSubmit"
    :onCancel="onCancel"
  />
</template>