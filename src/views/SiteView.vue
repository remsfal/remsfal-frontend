<script setup lang="ts">
import UnitBreadcrumb from '@/components/UnitBreadcrumb.vue';
import { onMounted, ref } from 'vue';
import SiteFormComponent from '../components/SiteFormComponent.vue';
import { siteService, type SiteUnit } from '@/services/SiteService';
import { propertyService } from '@/services/PropertyService';

const props = defineProps<{
  projectId: string;
  propertyId?: string;
  siteId: string;
}>();

const initialValues = ref<Partial<SiteUnit>>({});
const loadedParentId = ref<string | undefined>(undefined);
const pageTitle = ref<string>(''); 
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  if (!props.siteId) return;
  try {
    // 1. Site laden
    const site = (await siteService.getSite(props.projectId, props.siteId)) as any;
    initialValues.value.title = site.title;
    initialValues.value.description = site.description;
    pageTitle.value = site.title || '';

    // 2. Parent ID holen (aus URL oder via Service-Suche)
    if (props.propertyId) {
        loadedParentId.value = props.propertyId;
    } else {
        // Wir suchen im Baum
        const foundId = await propertyService.getParentId(props.projectId, props.siteId);
        loadedParentId.value = foundId;
    }
    
  } catch (err) {
    console.error('Fehler:', err);
  }
});

const handleSubmit = async (formValues: Partial<SiteUnit>) => {
  loading.value = true;
  error.value = null;
  const siteUpdate: Partial<SiteUnit> = {
    title: formValues.title,
    description: formValues.description,
    space: formValues.space !== undefined ? parseFloat(String(formValues.space)) : undefined,
    address: formValues.address,
  };
  try {
    await siteService.updateSite(props.projectId, props.siteId, siteUpdate);
    if (formValues.title) pageTitle.value = formValues.title;
  } catch (err) {
    error.value = 'Fehler: ' + err;
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => { alert('Abgebrochen'); };
</script>

<template>
  <div>
    <div class="px-6 mt-6 max-w-4xl mx-auto">
        <UnitBreadcrumb 
          :projectId="props.projectId" 
          :unitId="props.siteId" 
          :currentTitle="pageTitle"
          :contextParentId="loadedParentId"
          mode="edit" 
        />
    </div>

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
    
    <div v-if="loading" class="text-center mt-4">Senden...</div>
    <div v-if="error" class="error-message text-center">{{ error }}</div>
  </div>
</template>

<style scoped>
.error-message { color: red; margin-top: 1rem; }
</style>