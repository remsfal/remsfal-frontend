<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { commercialService, type CommercialUnit } from '@/services/CommercialService';
import { useToast } from 'primevue/usetoast';
import { handleCancel, showSavingErrorToast, showValidationErrorToast } from '@/helper/viewHelper';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const toast = useToast();
const router = useRouter();

const title = ref('');
const description = ref('');
const commercialSpace = ref<number | null>(null);
const heatingSpace = ref<number | null>(null);
const location = ref('');

const originalValues = ref({
  title: '',
  description: '',
  commercialSpace: null as number | null,
  heatingSpace: null as number | null,
  location: '',
});

const hasChanges = computed(() => {
  return (
    title.value !== originalValues.value.title ||
    description.value !== originalValues.value.description ||
    commercialSpace.value !== originalValues.value.commercialSpace ||
    heatingSpace.value !== originalValues.value.heatingSpace ||
    location.value !== originalValues.value.location
  );
});

const validationErrors = computed(() => {
  const errors: string[] = [];

  if (commercialSpace.value === null) {
    errors.push('Gewerbefläche ist erforderlich.');
  } else if (commercialSpace.value < 0) {
    errors.push('Gewerbefläche darf nicht negativ sein.');
  }

  if (heatingSpace.value === null) {
    errors.push('Heizfläche ist erforderlich.');
  } else if (heatingSpace.value < 0) {
    errors.push('Heizfläche darf nicht negativ sein.');
  }

  if (description.value && description.value.length > 500) {
    errors.push('Beschreibung darf maximal 500 Zeichen lang sein.');
  }
  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

const fetchCommercialDetails = async () => {
  if (!props.projectId || !props.unitId) {
    console.error('projectId or unitId is missing');
    return;
  }
  try {
    const data = await commercialService.getCommercial(props.projectId, props.unitId);
    title.value = data.title || '';
    description.value = data.description || '';
    commercialSpace.value = data.commercialSpace ?? null;
    heatingSpace.value = data.heatingSpace ?? null;
    location.value = data.location || '';

    originalValues.value = {
      title: title.value,
      description: description.value,
      commercialSpace: commercialSpace.value,
      heatingSpace: heatingSpace.value,
      location: location.value,
    };
  } catch (err) {
    console.error('Error loading commercial unit:', err);
    toast.add({
      severity: 'error',
      summary: 'Load Error',
      detail: 'Could not load commercial unit.',
      life: 6000,
    });
  }
};

onMounted(() => {
  if (props.unitId) {
    fetchCommercialDetails();
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Invalid ID',
      detail: 'No commercial unit ID provided.',
      life: 6000,
    });
  }
});

const save = async () => {
  if (!isValid.value) {
    showValidationErrorToast(toast, validationErrors.value);
    return;
  }

  const payload: CommercialUnit = {
    title: title.value,
    description: description.value,
    commercialSpace: commercialSpace.value ?? undefined,
    heatingSpace: heatingSpace.value ?? undefined,
    location: location.value,
  };

  try {
    await commercialService.updateCommercial(props.projectId, props.unitId, payload);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Commercial unit saved successfully.',
      life: 6000,
    });
    router.push(`/project/${props.projectId}/commercial/${props.unitId}`);
  } catch (err) {
    console.error('Error saving commercial unit:', err);
    showSavingErrorToast(toast, 'Could not save commercial unit.');
  }
};

const cancel = () => handleCancel(hasChanges, router, props.projectId);
</script>

<template>
  <div class="p-6 w-full">
    <div class="bg-white rounded-lg shadow-md p-10 max-w-screen-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6">Edit Commercial Unit with ID: {{ unitId }}</h2>

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div class="col-span-2">
            <label for="title" class="block text-gray-700 mb-1">Title</label>
            <input id="title" v-model="title" type="text" class="form-input w-full" />
          </div>

          <div class="col-span-2">
            <label for="description" class="block text-gray-700 mb-1">Description</label>
            <textarea id="description" v-model="description" rows="3" class="form-textarea w-full"></textarea>
          </div>

          <div class="col-span-2">
            <label for="location" class="block text-gray-700 mb-1">Location</label>
            <input id="location" v-model="location" type="text" class="form-input w-full" />
          </div>

          <div>
            <label for="commercialSpace" class="block text-gray-700 mb-1">Commercial Space (m²)</label>
            <input id="commercialSpace" v-model.number="commercialSpace" type="number" class="form-input w-full" />
          </div>

          <div>
            <label for="heatingSpace" class="block text-gray-700 mb-1">Heating Space (m²)</label>
            <input id="heatingSpace" v-model.number="heatingSpace" type="number" class="form-input w-full" />
          </div>
        </div>

        <div v-if="validationErrors.length" class="text-red-600 mt-4">
          <ul>
            <li v-for="(error, i) in validationErrors" :key="i">{{ error }}</li>
          </ul>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button
            type="submit"
            :disabled="!hasChanges"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>

          <button
            type="button"
            class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            @click="cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-input,
.form-textarea {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
}
</style>
