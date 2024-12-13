<script setup lang="ts">
import { ref } from 'vue';
import SiteFormComponent from '../components/SiteFormComponent.vue';
import SiteService, { type SiteItem} from '@/services/SiteService';
import type {AddressItem} from "@/services/ProjectService";

const props = defineProps<{
  projectId: string;
  propertyId: string;
}>();

const loading = ref(false);
const error = ref<string | null>(null);

// Submit handler
const handleSubmit = async (formValues: Record<string, any>) => {
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
    const resp = siteService.createSite(props.projectId, props.propertyId, site);
    console.log('Site created:', resp);
    // Here we could handle how to go back to the previous page
  } catch (err) {
    error.value = 'Außenanlage konnte nicht erstellt werden.' + err;
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
        headline="Neue Außenanlage erstellen"
        saveButtonText="Außenanlage erstellen"
        cancelButtonText="Abbrechen"
        :onSubmit="handleSubmit"
        :onCancel="handleCancel"
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
