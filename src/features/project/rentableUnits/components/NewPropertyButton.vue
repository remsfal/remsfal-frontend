<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
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
const titleMatchesLocation = ref(true);
const currentTitle = ref('');
const initialValues = ref({
 title: '', location: '', description: '' 
});
const formKey = ref(0);

const schema = z.object({
  title: z.string().trim().min(3, { message: t('validation.minLength', { min: 3 }) }),
  location: z.string().trim().optional().or(z.literal('')),
  description: z.string().trim().optional().or(z.literal('')),
});

const resolver = zodResolver(schema);

watch(titleMatchesLocation, (checked) => {
  if (checked) {
    initialValues.value = { ...initialValues.value, location: currentTitle.value };
    formKey.value++;
  }
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  const titleVal = s.title?.value as string;
  const loc = titleMatchesLocation.value ? titleVal : (s.location?.value || undefined);

  try {
    await propertyService.createProperty(props.projectId, {
      title: titleVal,
      location: loc,
      description: s.description?.value || undefined,
      plotArea: 0,
    });

    emit('newUnit', titleVal);

    titleMatchesLocation.value = true;
    currentTitle.value = '';
    initialValues.value = {
 title: '', location: '', description: '' 
};
    formKey.value++;
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
}
</script>

<template>
  <Button
    type="button"
    icon="pi pi-plus"
    :label="t('rentableUnits.button.addProperty')"
    pt:root="min-w-[188px]"
    @click="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    modal
    :header="t('rentableUnits.button.addProperty')"
    :style="{ width: '35rem' }"
  >
    <Form
      :key="formKey"
      v-slot="$form"
      :initialValues
      :resolver
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-6">
        <!-- Titel -->
        <div class="flex flex-col gap-1">
          <label for="title" class="font-semibold">{{ t('rentableUnits.form.title') }}</label>
          <InputText
            id="title"
            name="title"
            :placeholder="t('rentableUnits.form.titlePlaceholder')"
            fluid
            autofocus
            @update:modelValue="(v) => (currentTitle = v as string)"
          />
          <Message
            v-if="$form.title?.invalid && $form.title?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.title.error?.message }}
          </Message>
        </div>

        <!-- Lage/Standort -->
        <div class="flex flex-col gap-1">
          <label for="location" class="font-semibold">{{ t('rentableUnits.form.location') }}</label>
          <InputText
            id="location"
            name="location"
            fluid
            :disabled="titleMatchesLocation"
          />
          <div class="flex items-center gap-2 mt-1">
            <Checkbox v-model="titleMatchesLocation" inputId="titleMatchesLocation" binary />
            <label for="titleMatchesLocation" class="text-sm">{{ t('rentableUnits.form.locationMatchesTitle') }}</label>
          </div>
        </div>

        <!-- Beschreibung -->
        <div class="flex flex-col gap-1">
          <label for="description" class="font-semibold">{{ t('rentableUnits.form.description') }}</label>
          <Textarea
            id="description" name="description"
            :rows="4" autoResize
            fluid
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            :label="t('button.cancel')"
            severity="secondary"
            @click="visible = false"
          />
          <Button type="submit" :label="t('button.add')" />
        </div>
      </div>
    </Form>
  </Dialog>
</template>
