<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SiteFormComponent from '@/components/SiteFormComponent.vue';
import { siteService, type SiteJson } from '@/services/SiteService.ts';

const props = defineProps<{
  projectId: string;
  propertyId?: string;
  siteId: string;
}>();

const initialValues = ref<Partial<SiteJson>>({});
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  if (!props.siteId) return;
  try {
    const site = await siteService.getSite(props.projectId, props.siteId);

    initialValues.value.title = site.title;
    initialValues.value.description = site.description;
    
  } catch (err) {
    console.error('Fehler beim Laden:', err);
    error.value = 'Fehler beim Laden der Daten.';
  }
});

const handleSubmit = async (formValues: Partial<SiteJson>) => {
  loading.value = true;
  error.value = null;

  const siteUpdate: Partial<SiteJson> = {
    title: formValues.title,
    description: formValues.description,
    space: formValues.space === undefined ? undefined : formValues.space,
    address: formValues.address,
  };

  try {
    await siteService.updateSite(props.projectId, props.siteId, siteUpdate);
    // Here we could handle how to go back to the previous page
  } catch (err) {
    error.value = 'Fehler beim Speichern: ' + err;
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  // Here we could handle how to go back to the previous page
  // alert('Canceled'); 
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
    
    <div v-if="loading" class="text-center mt-4">
      Senden...
    </div>
    <div v-if="error" class="error-message text-center">
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