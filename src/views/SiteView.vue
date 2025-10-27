<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SiteFormComponent from '../components/SiteFormComponent.vue';
import { siteService, type SiteUnit } from '@/services/SiteService';

const props = defineProps<{
  projectId: string;
  propertyId?: string;
  siteId: string;
}>();

const initialValues = ref<Partial<SiteUnit>>({});

const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  if (!props.siteId) return;
  try {
    console.log('Fetching site data...');
    // Cast response to SiteUnit to remove 'unknown'
    const site = (await siteService.getSite(props.projectId, props.siteId)) as SiteUnit;

    initialValues.value.title = site.title;
    initialValues.value.description = site.description;
    //    initialValues.value.usableSpace = site.usableSpace.toString();
    //    initialValues.value.street = site.address?.street;
    //    initialValues.value.city = site.address?.city;
    //    initialValues.value.zip = site.address?.zip;
    //    initialValues.value.province = site.address?.province;
    //    initialValues.value.country = site.address?.country;

    console.log('Site data:', initialValues.value);
  } catch (err) {
    console.error('Error fetching site data:', err);
  }
});

// Submit handler
const handleSubmit = async (formValues: Partial<SiteUnit>) => {
  loading.value = true;
  error.value = null;

  //  const address: AddressItem = {
  //    street: formValues.street,
  //    city: formValues.city,
  //    zip: formValues.zip,
  //    province: formValues.province,
  //    country: formValues.country,
  //  };

  const siteUpdate: Partial<SiteUnit> = {
    title: formValues.title,
    description: formValues.description,
    space: formValues.space !== undefined ? parseFloat(String(formValues.space)) : undefined,
    //    address: address,
    address: formValues.address,
  };

  try {
    // Create the site
    console.log('Updating site:', siteUpdate);
    await siteService.updateSite(props.projectId, props.siteId, siteUpdate);
    // Here we could handle how to go back to the previous page
  } catch (err) {
    error.value = 'Außenanlage konnte nicht aktualisiert werden.' + err;
  } finally {
    loading.value = false;
  }
};

// Cancel handler
const handleCancel = () => {
  alert('Form submission cancelled');
  // Here we could handle how to go back to the previous page
};
</script>

<template>
  <div>
    <SiteFormComponent
      :projectId="projectId"
      :propertyId="propertyId"
      :siteId="siteId"
      headline="Außenanlage bearbeiten"
      saveButtonText="Speichern"
      cancelButtonText="Abbrechen"
      :onSubmit="handleSubmit"
      :onCancel="handleCancel"
      :initialValues="initialValues"
    />
    <div v-if="loading">Senden...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
