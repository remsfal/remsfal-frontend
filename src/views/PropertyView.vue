<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProjectService, { type PropertyItem } from '@/services/ProjectService';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';

const props = defineProps<{
  projectId: string;
}>();

const router = useRouter();
const route = useRoute();
const projectService = new ProjectService();

const id = ref(route.query.propertyId || '');
const title = ref('');
const landRegisterEntry = ref('');
const description = ref('');
const effectiveSpace = ref(0);
const plotArea = ref(0);
const error = ref<string | null>(null);
const isLoading = ref(false);

const action = ref(route.query.action || '');

onMounted(() => {
  if (action.value === 'update' || action.value === 'delete') {
    fetchPropertyDetails();
  }
});

const fetchPropertyDetails = () => {
  if (!id.value) return;
  isLoading.value = true;
  projectService
    .getProperty(props.projectId, id.value.toString())
    .then((property: PropertyItem) => {
      title.value = property.title;
      description.value = property.description;
      landRegisterEntry.value = property.landRegisterEntry;
      plotArea.value = property.plotArea;
      effectiveSpace.value = property.effective_space;
    })
    .catch((err) => {
      error.value = `Failed to fetch property details: ${err.message || 'Unknown error'}`;
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const createProperty = () => {
  const newProperty: PropertyItem = {
    title: title.value,
    description: description.value,
    landRegisterEntry: landRegisterEntry.value,
    plotArea: plotArea.value,
    effective_space: effectiveSpace.value,
  };

  projectService
    .createProperty(props.projectId, newProperty)
    .then(() => {
      router.push(`/project/${props.projectId}/objects`);
    })
    .catch((err) => {
      console.error('Error creating property:', err);
    });
};

const updateProperty = () => {
  if (!id.value) return;
  const updatedProperty: PropertyItem = {
    title: title.value,
    description: description.value,
    landRegisterEntry: landRegisterEntry.value,
    plotArea: plotArea.value,
    effective_space: effectiveSpace.value,
  };

  projectService
    .updateProperty(props.projectId, id.value.toString(), updatedProperty)
    .then(() => {
      router.push(`/project/${props.projectId}/objects`);
    })
    .catch((err) => {
      console.error('Error updating property:', err);
    });
};

const deleteProperty = () => {
  if (!id.value) return;
  projectService
    .deleteProperty(props.projectId, id.value.toString())
    .then(() => {
      router.push(`/project/${props.projectId}/objects`);
    })
    .catch((err) => {
      console.error('Error deleting property:', err);
    });
};

const close = () => {
  router.push(`/project/${props.projectId}/objects`);
};
</script>

<template>
  <div class="col-12">
    <div class="card">
      <h5 v-if="action === 'create'">{{ $t('property.create') }}</h5>
      <h5 v-if="action === 'update'">{{ $t('property.update', id) }}</h5>
      <h5 v-if="action === 'delete'">{{ $t('property.delete', id) }}</h5>
      <div v-if="isLoading">$t('loading')</div>
      <div v-if="error">{{ error }}</div>
      <div v-if="!isLoading && !error" class="p-fluid formgrid grid">
        <div class="field col-12 md:col-6">
          <label for="title">{{ $t('property.title') }}</label>
          <InputText id="title" v-model="title" type="text" :disabled="action === 'delete'" />
        </div>
        <div class="field col-12 md:col-6">
          <label for="landRegisterEntry">{{ $t('property.landRegister') }}</label>
          <InputText
            id="landRegisterEntry"
            v-model="landRegisterEntry"
            type="text"
            :disabled="action === 'delete'"
          />
        </div>
        <div class="field col-12">
          <label for="description">{{ $t('property.descripton') }}</label>
          <Textarea
            id="description"
            v-model="description"
            rows="4"
            :disabled="action === 'delete'"
            class="no-resize"
          />
        </div>
        <div class="field col-10 md:col-6">
          <label for="plotArea">{{ $t('proppertty.area') }}</label>
          <InputNumber
            id="plotArea"
            v-model="plotArea"
            type="number"
            :disabled="action === 'delete'"
          />
        </div>
        <div class="field col-10 md:col-6">
          <label for="effectiveSpace">{{ $t('property.effectiveArea') }}</label>
          <InputNumber
            id="effectiveSpace"
            v-model="effectiveSpace"
            type="number"
            :disabled="action === 'delete'"
          />
        </div>
        <div class="field col-12 text-right">
          <Button
            v-if="action === 'create'"
            :label="$t('button.create')"
            icon="pi pi-check"
            class="p-button-property mr-2 mb-2"
            @click="createProperty"
          />
          <Button
            v-if="action === 'update'"
            :label="$t('button.update')"
            icon="pi pi-check"
            class="p-button-property mr-2 mb-2"
            @click="updateProperty"
          />
          <Button
            v-if="action === 'delete'"
            :label="$t('button.delete')"
            icon="pi pi-trash"
            class="p-button-property p-button-danger mr-2 mb-2"
            @click="deleteProperty"
          />
          <Button
            :label="$t('button.cancel')"
            icon="pi pi-times"
            class="p-button-property mr-2 mb-2"
            @click="close"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.text-right {
  text-align: right;
}

.p-button-property {
  width: auto;
}

.no-resize {
  resize: none;
}
</style>
