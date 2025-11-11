<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { commercialService, type CommercialUnit } from '@/services/CommercialService';
import { useToast } from 'primevue/usetoast';
import { handleCancel, showSavingErrorToast, showValidationErrorToast, valuesAreEqual } from '@/helper/viewHelper';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const toast = useToast();
const router = useRouter();
const { t } = useI18n();

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
    !valuesAreEqual(title.value, originalValues.value.title) ||
    !valuesAreEqual(description.value, originalValues.value.description) ||
    !valuesAreEqual(commercialSpace.value, originalValues.value.commercialSpace) ||
    !valuesAreEqual(heatingSpace.value, originalValues.value.heatingSpace) ||
    !valuesAreEqual(location.value, originalValues.value.location)
  );
});

const validationErrors = computed(() => {
  const errors: string[] = [];

  if (commercialSpace.value === null) {
    errors.push(t('commercialUnit.validation.commercialRequired'));
  } else if (commercialSpace.value < 0) {
    errors.push(t('commercialUnit.validation.commercialNegative'));
  }

  if (heatingSpace.value === null) {
    errors.push(t('commercialUnit.validation.heatingRequired'));
  } else if (heatingSpace.value < 0) {
    errors.push(t('commercialUnit.validation.heatingNegative'));
  }

  if (description.value && description.value.length > 500) {
    errors.push(t('commercialUnit.validation.descriptionTooLong'));
  }

  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

async function fetchCommercialDetails() {
  if (!props.projectId) {
    console.error('Keine projectId');
    return;
  }
  if (!props.unitId) {
    console.error('Keine unitId');
    return;
  }

  try {
    const data = await commercialService.getCommercial(props.projectId, props.unitId);

    title.value = data.title || '';
    description.value = data.description || '';
    commercialSpace.value = data.netFloorArea ?? null; // <-- map netFloorArea
    heatingSpace.value = data.technicalServicesArea ?? null; // <-- map technicalServicesArea
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
      summary: t('commercialUnit.loadErrorTitle'),
      detail: t('commercialUnit.loadErrorDetail'),
      life: 6000,
    });
  }
}

onMounted(() => {
  if (props.unitId) {
    fetchCommercialDetails();
  } else {
    toast.add({
      severity: 'warn',
      summary: t('commercialUnit.missingIdTitle'),
      detail: t('commercialUnit.missingIdDetail'),
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
    netFloorArea: commercialSpace.value ?? undefined,
    heatingSpace: heatingSpace.value ?? undefined,
    location: location.value,
  };

  try {
    await commercialService.updateCommercial(props.projectId, props.unitId, payload);
    toast.add({
      severity: 'success',
      summary: t('commercialUnit.saveSuccessTitle'),
      detail: t('commercialUnit.saveSuccessDetail'),
      life: 6000,
    });
    router.push(`/project/${props.projectId}/commercial/${props.unitId}`);
  } catch (err) {
    console.error('Error saving commercial unit:', err);
    showSavingErrorToast(toast, t('commercialUnit.saveError'));
  }
};

const cancel = () => handleCancel(hasChanges, router, props.projectId);

// This is the crucial line to expose the fetchCommercialDetails method externally
defineExpose({ fetchCommercialDetails });
</script>

<template>
  <div class="p-6 w-full">
    <div class="bg-white rounded-lg shadow-md p-10 max-w-screen-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6">
        {{ t('commercialUnit.editTitle', { id: unitId }) }}
      </h2>

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div class="col-span-2">
            <label for="title" class="block text-gray-700 mb-1">{{
              t('rentableUnits.form.title')
            }}</label>
            <input id="title" v-model="title" type="text" class="form-input w-full">
          </div>

          <div class="col-span-2">
            <label for="description" class="block text-gray-700 mb-1">{{
              t('rentableUnits.form.description')
            }}</label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              class="form-textarea w-full"
            />
          </div>

          <div class="col-span-2">
            <label for="location" class="block text-gray-700 mb-1">{{
              t('property.address')
            }}</label>
            <input id="location" v-model="location" type="text" class="form-input w-full">
          </div>

          <div>
            <label for="commercialSpace" class="block text-gray-700 mb-1">
              {{ t('commercialUnit.commercialSpace') }} (m²)
            </label>
            <input
              id="commercialSpace"
              v-model.number="commercialSpace"
              type="number"
              class="form-input w-full"
            >
          </div>

          <div>
            <label for="heatingSpace" class="block text-gray-700 mb-1">
              {{ t('commercialUnit.heatingSpace') }} (m²)
            </label>
            <input
              id="heatingSpace"
              v-model.number="heatingSpace"
              type="number"
              class="form-input w-full"
            >
          </div>
        </div>

        <div v-if="validationErrors.length" class="text-red-600 mt-4">
          <ul>
            <li v-for="(error, i) in validationErrors" :key="i">
              {{ error }}
            </li>
          </ul>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button
            type="submit"
            :disabled="!hasChanges"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('button.save') }}
          </button>

          <button
            type="button"
            class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            @click="cancel"
          >
            {{ t('button.cancel') }}
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
