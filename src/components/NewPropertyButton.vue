<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { propertyService } from '@/services/PropertyService';

const props = defineProps<{
  projectId: string;
}>();
const emit = defineEmits<{
  (e: 'newUnit', title: string): void;
}>();

const { t } = useI18n();

const visible = ref<boolean>(false);
const title = ref<string | undefined>(undefined);
const description = ref<string | undefined>(undefined);

const createProperty = async () => {
  console.log('createProperty called');
  if (!title.value) {
    console.log('Title is empty, no creation occurs');
    alert('Titel ist ein Pflichtfeld!');
    return;
  }

  visible.value = false;
  propertyService
    .createProperty(props.projectId, {
      title: title.value!,
      description: description.value,
    })
    .then((newProperty) => {
      console.log('Property created:', newProperty);
      emit('newUnit', title.value!);
    })
    .catch((err) => {
      console.error('Failed to create property:', err);
    });
};
</script>

<template>
  <Button
    type="button"
    icon="pi pi-plus"
    label="Grundstück hinzufügen"
    severity="success"
    @click="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    modal
    header="Grundstück hinzufügen"
    :style="{ width: '35rem' }"
  >
    <div class="flex items-center gap-6 mb-6">
      <label for="title" class="font-semibold w-24">Titel</label>
      <InputText
        id="title"
        v-model="title"
        type="text"
        placeholder="Titel der neun Einheit"
        class="flex-auto"
        autocomplete="on"
      />
    </div>
    <div class="flex items-center gap-6 mb-20">
      <label for="description" class="font-semibold w-24">Beschreibung</label>
      <Textarea id="description" v-model="description" rows="4" class="flex-auto" />
    </div>
    <div class="flex justify-end gap-2">
      <Button
        type="button"
        :label="t('button.cancel')"
        severity="secondary"
        @click="visible = false"
      ></Button>
      <Button type="button" :label="t('button.add')" @click="createProperty"></Button>
    </div>
  </Dialog>
</template>

<style scoped></style>
