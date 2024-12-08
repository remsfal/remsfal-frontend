<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ReusableFormComponent from '../components/ReusableFormComponent.vue';
import ProjectService, { type SiteItem, type AddressItem} from '@/services/ProjectService';

const props = defineProps<{
  projectId: string;
  propertyId: string;
  siteId: string;
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

const initialSiteData = ref({
  title: '',
  description: '',
  usableSpace: '',
  street: '',
  city: '',
  zip: '',
  province: '',
  country: '',
});

onMounted( async ()=> {
  const projectService = new ProjectService();
  try {
    console.log('Fetching site data...');
    const site = await projectService.getSite(props.projectId, props.propertyId, props.siteId);
    initialSiteData.value = {
      title: site.title,
      description: site.description,
      usableSpace: site.usableSpace.toString(),
      street: site.address.street,
      city: site.address.city,
      zip: site.address.zip,
      province: site.address.province,
      country: site.address.country,
    };
    console.log('Site data:', initialSiteData.value);
  } catch (error) {
    console.error('Error fetching site data:', error);
  }
});

const loading = ref(false);
const error = ref<string | null>(null);

// Submit handler
const handleSubmit = async (formValues: any) => {
  loading.value = true;
  error.value = null;
  const projectService = new ProjectService();

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
    await projectService.updateSite(props.projectId, props.propertyId, props.siteId, site);
    alert('Eine Außenanlage wurde erfolgreich aktualisiert!');
    //window.history.back();
  } catch (err) {
    error.value = 'Außenanlage konnte nicht aktualisiert werden.' + err;
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
        :initialValues="initialSiteData"
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
