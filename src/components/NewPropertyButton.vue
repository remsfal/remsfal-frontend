<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { propertyService } from '@/services/PropertyService';
import { useToast } from 'primevue/usetoast';
const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits<{
  (e: 'newUnit', title: string): void;
}>();

const { t } = useI18n();
const toast = useToast();
const visible = ref<boolean>(false);
const title = ref<string | undefined>(undefined);
const description = ref<string | undefined>(undefined);

const createProperty = async () => {
  console.log('createProperty called');

  if (!title.value) {
    console.log('Title is empty, no creation occurs');
    toast.add({
      severity: 'warn',
      summary: t('error.general'),
      detail: t('rentableUnits.form.titleRequired'),
      life: 4000,
    });
    return;
  }

  try {
    const newProperty = await propertyService.createProperty(props.projectId, {
      title: title.value,
      description: description.value,
      plotArea: 0,
    });

    console.log('Property created:', newProperty);
    emit('newUnit', title.value!); // non-null because validated above

    // Reset form
    title.value = undefined;
    description.value = undefined;
    visible.value = false;

    toast.add({
      severity: 'success',
      summary: t('success.created'),
      detail: t('success.propertyCreated'),
      life: 4000,
    });
  } catch (err) {
    console.error('Failed to create property:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('error.createProperty'),
      life: 5000,
    });
  }
};
</script>

<template>
  <Button
    type="button"
    icon="pi pi-plus"
    :label="t('rentableUnits.button.addProperty')"
    severity="success"
    @click="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    modal
    :header="t('rentableUnits.button.addProperty')"
    :style="{ width: '35rem' }"
  >
    <div class="flex items-center gap-6 mb-6">
      <label
        for="title"
        class="font-semibold w-24"
      >{{ t('rentableUnits.form.title') }}</label>
      <InputText
        id="title"
        v-model="title"
        type="text"
        :placeholder="t('rentableUnits.form.titlePlaceholder')"
        class="flex-auto"
        autocomplete="on"
      />
    </div>

    <div class="flex items-center gap-6 mb-20">
      <label
        for="description"
        class="font-semibold w-24"
      >{{
        t('rentableUnits.form.description')
      }}</label>
      <Textarea
        id="description"
        v-model="description"
        rows="4"
        class="flex-auto"
      />
    </div>

    <div class="flex justify-end gap-2">
      <Button
        type="button"
        :label="t('button.cancel')"
        severity="secondary"
        @click="visible = false"
      />
      <Button
        type="button"
        :label="t('button.add')"
        @click="createProperty"
      />
    </div>
  </Dialog>
</template>
