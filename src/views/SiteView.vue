<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SiteFormComponent from '../components/SiteFormComponent.vue';
import { siteService, type SiteUnit } from '@/services/SiteService';

const props = defineProps<{
  projectId: string
  propertyId?: string
  siteId: string
}>();

const initialValues: Record<string, any> = ref({});

onMounted(async () => {
  if (!props.siteId) return;
  try {
    console.log('Fetching site data...');
    const site = await siteService.getSite(props.projectId, props.siteId);
    initialValues.value.title = site.title;
    initialValues.value.description = site.description;
    //    initialValues.value.usableSpace = site.usableSpace.toString();
    //    initialValues.value.street = site.address.street;
    //    initialValues.value.city = site.address.city;
    //    initialValues.value.zip = site.address.zip;
    //    initialValues.value.province = site.address.province;
    //    initialValues.value.country = site.address.country;

    console.log('Site data:', initialValues.value);
  }
  catch (error) {
    console.error('Error fetching site data:', error);
  }
});

const loading = ref(false);
const error = ref<string | null>(null);

// Submit handler
const handleSubmit = async (formValues: any) => {
  loading.value = true;
  error.value = null;

  //  const address: AddressItem = {
  //    street: formValues.street,
  //    city: formValues.city,
  //    zip: formValues.zip,
  //    province: formValues.province,
  //    country: formValues.country,
  //  };

  const site: SiteUnit = {
    title: formValues.title,
    description: formValues.description,
    usableSpace: parseFloat(formValues.usableSpace),
    //    address: address,
  };

  try {
    // Create the site
    console.log('Creating site:', site);
    await siteService.updateSite(props.projectId, props.siteId, site);
    // Here we could handle how to go back to the previous page
  }
  catch (err) {
    error.value = 'Außenanlage konnte nicht aktualisiert werden.' + err;
  }
  finally {
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
      :project-id="projectId"
      :property-id="propertyId"
      :site-id="siteId"
      headline="Außenanlage bearbeiten"
      save-button-text="Speichern"
      cancel-button-text="Abbrechen"
      :on-submit="handleSubmit"
      :on-cancel="handleCancel"
      :initial-values="initialValues"
    />
    <div v-if="loading">
      Senden...
    </div>
    <div
      v-if="error"
      class="error-message"
    >
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
