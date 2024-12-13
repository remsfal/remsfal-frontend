<script setup lang="ts">
import { ref } from 'vue';
import SiteFormComponent from '../components/SiteFormComponent.vue';
import SiteService, { type SiteItem} from '@/services/SiteService';
import type {AddressItem} from "@/services/ProjectService";

const props = defineProps<{
  projectId: string;
  propertyId: string;
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
    label: 'Title',
    type: 'text',
    required: true,
    validations: [
      (value: string) => (value.length > 255 ? 'Ein Titel darf nicht mehr als 255 Zeichen lang sein.' : null),
    ],
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
  },
  {
    name: 'usableSpace',
    label: 'Usable Space (sqm)',
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

const initialValues = {
  title: '',
  description: '',
  usableSpace: '',
  address: '',
};

const loading = ref(false);
const error = ref<string | null>(null);

// Submit handler
const handleSubmit = async (formValues: any) => {
  loading.value = true;
  error.value = null;
  const siteService = new SiteService();

  const address: AddressItem = {
    street: formValues.street,
    city: formValues.city,
    zip: formValues.zip,
    province: formValues.province,
    country: formValues.country,
  };

  const site: SiteItem = {
    propertyId: props.propertyId,
    title: formValues.title,
    description: formValues.description,
    usableSpace: parseFloat(formValues.usableSpace),
    address: address,
  };


  try {
    // Create the site
    console.log('Creating site:', site);
    await projectService.createSite(props.projectId, props.propertyId, site);
    alert('Eine Außenanlage wurde erfolgreich erstellt!');
    //window.history.back();
    const resp = siteService.createSite(props.projectId, props.propertyId, site);
  } catch (err) {
    error.value = 'Außenanlage konnte nicht erstellt werden.' + err;
  } finally {
    loading.value = false;
  }
};

// Cancel handler
const handleCancel = () => {
  alert('Form submission cancelled');
  //window.history.back();
};
</script>

<template>
  <div>
    <ReusableFormComponent
        headline="Neue Außenanlage erstellen"
        saveButtonText="Außenanlage erstellen"
        cancelButtonText="Abbrechen"
        :fields="fields"
        :initialValues="initialValues"
        @submit="handleSubmit"
        @cancel="handleCancel"
    />
    <div v-if="loading">Submitting...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
