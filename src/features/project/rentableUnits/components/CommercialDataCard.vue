<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Fieldset from 'primevue/fieldset';
import Message from 'primevue/message';
import SelectButton from 'primevue/selectbutton';

import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

import BaseCard from '@/components/common/BaseCard.vue';
import { commercialService } from '@/services/CommercialService.ts';
import type { CommercialJson } from '@/services/CommercialService.ts';
import { showSavingErrorToast } from '@/helper/viewHelper.ts';

const props = defineProps<{
  projectId: string;
  unitId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const schema = z.object({
  title: z.string().trim().min(3, { message: t('validation.minLength', { min: 3 }) }),
  description: z.string().trim().max(500, { message: t('validation.maxLength', { max: 500 }) }).optional().or(z.literal('')),
  location: z.string().trim().optional().or(z.literal('')),
  netFloorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  usableFloorArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  technicalServicesArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  trafficArea: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  heatingSpace: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
  space: z.number().min(0, { message: t('validation.minValue', { min: 0 }) }).nullable().optional(),
});

const resolver = zodResolver(schema);

// ─── DIN 277 mode toggle ──────────────────────────────────────────────────────
type Din277Mode = 'total' | 'detail';
const din277Mode = ref<Din277Mode>('total');
const din277ModeOptions = [
  { label: 'NRF gesamt', value: 'total' },
  { label: 'Aufgeschlüsselt', value: 'detail' },
];

// ─── State ────────────────────────────────────────────────────────────────────
const serverValues = reactive({
  title: '',
  description: '',
  location: '',
  netFloorArea: null as number | null,
  usableFloorArea: null as number | null,
  technicalServicesArea: null as number | null,
  trafficArea: null as number | null,
  heatingSpace: null as number | null,
  space: null as number | null,
});

const currentValues = reactive({ ...serverValues });
const initialValues = ref({ ...currentValues });
const formKey = ref(0);

const isDirty = computed(() =>
  currentValues.title !== serverValues.title ||
  currentValues.description !== serverValues.description ||
  currentValues.location !== serverValues.location ||
  currentValues.netFloorArea !== serverValues.netFloorArea ||
  currentValues.usableFloorArea !== serverValues.usableFloorArea ||
  currentValues.technicalServicesArea !== serverValues.technicalServicesArea ||
  currentValues.trafficArea !== serverValues.trafficArea ||
  currentValues.heatingSpace !== serverValues.heatingSpace ||
  currentValues.space !== serverValues.space,
);

// ─── Mode switch handler ───────────────────────────────────────────────────────
watch(din277Mode, (newMode) => {
  if (newMode === 'detail') {
    currentValues.netFloorArea = null;
  } else {
    currentValues.usableFloorArea = null;
    currentValues.technicalServicesArea = null;
    currentValues.trafficArea = null;
  }
  // Preserve all current field values (including unsaved changes) when resetting form key
  initialValues.value = { ...currentValues };
  formKey.value++;
});

// ─── Load ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!props.unitId) {
    toast.add({
      severity: 'warn',
      summary: t('error.general'),
      detail: t('commercial.noId'),
      life: 6000,
    });
    return;
  }
  try {
    const data = await commercialService.getCommercial(props.projectId, props.unitId);
    const loaded = {
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      netFloorArea: data.netFloorArea ?? null,
      usableFloorArea: data.usableFloorArea ?? null,
      technicalServicesArea: data.technicalServicesArea ?? null,
      trafficArea: data.trafficArea ?? null,
      heatingSpace: data.heatingSpace ?? null,
      space: data.space ?? null,
    };
    Object.assign(serverValues, loaded);
    Object.assign(currentValues, loaded);
    initialValues.value = { ...loaded };
    // Auto-detect mode: if any detail field has a value, switch to detail
    if (loaded.usableFloorArea !== null || loaded.technicalServicesArea !== null || loaded.trafficArea !== null) {
      din277Mode.value = 'detail';
    }
    formKey.value++;
  } catch (err) {
    console.error('Fehler beim Laden der Gewerbeeinheit:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('commercial.loadError'),
      life: 6000,
    });
  }
});

// ─── Save ─────────────────────────────────────────────────────────────────────
async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;

  const payload: Partial<CommercialJson> = {
    title: s.title?.value || undefined,
    description: s.description?.value || undefined,
    location: s.location?.value || undefined,
    heatingSpace: s.heatingSpace?.value ?? undefined,
    space: s.space?.value ?? undefined,
  };

  if (din277Mode.value === 'total') {
    payload.netFloorArea = s.netFloorArea?.value ?? undefined;
    payload.usableFloorArea = undefined;
    payload.technicalServicesArea = undefined;
    payload.trafficArea = undefined;
  } else {
    payload.netFloorArea = undefined;
    payload.usableFloorArea = s.usableFloorArea?.value ?? undefined;
    payload.technicalServicesArea = s.technicalServicesArea?.value ?? undefined;
    payload.trafficArea = s.trafficArea?.value ?? undefined;
  }

  try {
    await commercialService.updateCommercial(props.projectId, props.unitId, payload as CommercialJson);
    const saved = {
      title: payload.title || '',
      description: payload.description || '',
      location: payload.location || '',
      netFloorArea: payload.netFloorArea ?? null,
      usableFloorArea: payload.usableFloorArea ?? null,
      technicalServicesArea: payload.technicalServicesArea ?? null,
      trafficArea: payload.trafficArea ?? null,
      heatingSpace: payload.heatingSpace ?? null,
      space: payload.space ?? null,
    };
    Object.assign(serverValues, saved);
    Object.assign(currentValues, saved);
    initialValues.value = { ...saved };
    formKey.value++;
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('commercial.saveSuccess'),
      life: 3000,
    });
  } catch (err) {
    console.error('Fehler beim Speichern der Gewerbeeinheit:', err);
    showSavingErrorToast(toast, t('commercial.saveError'));
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('commercial.cardTitle') }}
    </template>

    <template #content>
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
            <label for="title" class="font-medium">{{ t('commercial.title') }}*</label>
            <InputText
              id="title"
              name="title"
              fluid
              @update:modelValue="(v) => (currentValues.title = v as string)"
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

          <!-- Beschreibung -->
          <div class="flex flex-col gap-1">
            <label for="description" class="font-medium">{{ t('commercial.description') }}</label>
            <Textarea
              id="description"
              name="description"
              :rows="3"
              autoResize
              fluid
              @update:modelValue="(v) => (currentValues.description = v as string)"
            />
            <Message
              v-if="$form.description?.invalid && $form.description?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.description.error?.message }}
            </Message>
          </div>

          <!-- Lage -->
          <div class="flex flex-col gap-1">
            <label for="location" class="font-medium">{{ t('commercial.location') }}</label>
            <InputText
              id="location"
              name="location"
              fluid
              @update:modelValue="(v) => (currentValues.location = v as string)"
            />
            <Message
              v-if="$form.location?.invalid && $form.location?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.location.error?.message }}
            </Message>
          </div>

          <!-- DIN 277 -->
          <Fieldset :legend="t('commercial.din277.legend')">
            <div class="flex flex-col gap-4">
              <!-- NRF / Mode toggle -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
                <!-- Netto-Raumfläche (total mode) -->
                <div v-if="din277Mode === 'total'" class="flex flex-col gap-1">
                  <label for="netFloorArea" class="font-medium">{{ t('commercial.netFloorArea') }}</label>
                  <InputNumber
                    id="netFloorArea"
                    name="netFloorArea"
                    :min="0"
                    :maxFractionDigits="2"
                    suffix=" m²"
                    fluid
                    @update:modelValue="(v) => (currentValues.netFloorArea = v as number | null)"
                  />
                  <Message
                    v-if="$form.netFloorArea?.invalid && $form.netFloorArea?.touched"
                    severity="error"
                    size="small"
                    variant="simple"
                  >
                    {{ $form.netFloorArea.error?.message }}
                  </Message>
                </div>
                <div v-else class="hidden md:block" />

                <!-- Mode toggle -->
                <div class="flex flex-col gap-1">
                  <SelectButton
                    v-model="din277Mode"
                    :options="din277ModeOptions"
                    optionLabel="label"
                    optionValue="value"
                  />
                </div>
              </div>

              <!-- Detail fields (NUF / TF / VF) -->
              <div
                v-if="din277Mode === 'detail'"
                class="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4"
              >
                <!-- Nutzfläche NF -->
                <div class="flex flex-col gap-1">
                  <label for="usableFloorArea" class="font-medium">{{ t('commercial.usableFloorArea') }}</label>
                  <InputNumber
                    id="usableFloorArea"
                    name="usableFloorArea"
                    :min="0"
                    :maxFractionDigits="2"
                    suffix=" m²"
                    fluid
                    @update:modelValue="(v) => (currentValues.usableFloorArea = v as number | null)"
                  />
                  <Message
                    v-if="$form.usableFloorArea?.invalid && $form.usableFloorArea?.touched"
                    severity="error"
                    size="small"
                    variant="simple"
                  >
                    {{ $form.usableFloorArea.error?.message }}
                  </Message>
                </div>

                <!-- Technische Funktionsfläche TF -->
                <div class="flex flex-col gap-1">
                  <label for="technicalServicesArea" class="font-medium">{{ t('commercial.technicalServicesArea') }}</label>
                  <InputNumber
                    id="technicalServicesArea"
                    name="technicalServicesArea"
                    :min="0"
                    :maxFractionDigits="2"
                    suffix=" m²"
                    fluid
                    @update:modelValue="(v) => (currentValues.technicalServicesArea = v as number | null)"
                  />
                  <Message
                    v-if="$form.technicalServicesArea?.invalid && $form.technicalServicesArea?.touched"
                    severity="error"
                    size="small"
                    variant="simple"
                  >
                    {{ $form.technicalServicesArea.error?.message }}
                  </Message>
                </div>

                <!-- Verkehrsfläche VF -->
                <div class="flex flex-col gap-1">
                  <label for="trafficArea" class="font-medium">{{ t('commercial.trafficArea') }}</label>
                  <InputNumber
                    id="trafficArea"
                    name="trafficArea"
                    :min="0"
                    :maxFractionDigits="2"
                    suffix=" m²"
                    fluid
                    @update:modelValue="(v) => (currentValues.trafficArea = v as number | null)"
                  />
                  <Message
                    v-if="$form.trafficArea?.invalid && $form.trafficArea?.touched"
                    severity="error"
                    size="small"
                    variant="simple"
                  >
                    {{ $form.trafficArea.error?.message }}
                  </Message>
                </div>
              </div>
            </div>
          </Fieldset>

          <!-- Heizfläche + Fläche -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- Heizfläche -->
            <div class="flex flex-col gap-1">
              <label for="heatingSpace" class="font-medium">{{ t('commercial.heatingSpace') }}</label>
              <InputNumber
                id="heatingSpace"
                name="heatingSpace"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.heatingSpace = v as number | null)"
              />
              <Message
                v-if="$form.heatingSpace?.invalid && $form.heatingSpace?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.heatingSpace.error?.message }}
              </Message>
            </div>

            <!-- Fläche -->
            <div class="flex flex-col gap-1">
              <label for="space" class="font-medium">{{ t('commercial.space') }}</label>
              <InputNumber
                id="space"
                name="space"
                :min="0"
                :maxFractionDigits="2"
                suffix=" m²"
                fluid
                @update:modelValue="(v) => (currentValues.space = v as number | null)"
              />
              <Message
                v-if="$form.space?.invalid && $form.space?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.space.error?.message }}
              </Message>
            </div>
          </div>

          <Message size="small" severity="secondary" variant="simple">
            {{ t('accountSettings.userProfile.requiredFields') }}
          </Message>

          <!-- Speichern -->
          <div class="flex justify-end">
            <Button
              type="submit"
              :label="t('button.save')"
              icon="pi pi-save"
              :disabled="!isDirty"
            />
          </div>
        </div>
      </Form>
    </template>
  </BaseCard>
</template>
