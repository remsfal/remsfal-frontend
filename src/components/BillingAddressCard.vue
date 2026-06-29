<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { countryFlagEmoji, countryDisplayName } from '@/helper/countryHelper';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseCard from '@/components/common/BaseCard.vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Message from 'primevue/message';
import Button from 'primevue/button';
import AddressService from '@/services/AddressService';
import type { AddressJson } from '@/services/AddressService';
import { projectService } from '@/services/ProjectService';
import { COUNTRIES } from '@/constants/countries';

interface Props {
  projectId: string;
}

const props = defineProps<Props>();

const { t, locale } = useI18n();

const localizedCountries = computed(() =>
  COUNTRIES.map(c => ({ ...c, displayName: countryDisplayName(c.code, locale.value) })),
);
const toast = useToast();
const addressService = new AddressService();

const streetRegex = /^(?=.*[A-Za-zÄÖÜäöüß])(?=.*\d)[A-Za-zÄÖÜäöüß0-9\s./-]+$/;
const schema = z.object({
  owner: z.string().trim().optional(),
  careOf: z.string().trim().optional(),
  street: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(streetRegex, { message: t('address.validation.streetInvalid') }),
  zip: z.string().trim().min(1, { message: t('validation.required') }),
  city: z.string().trim().min(1, { message: t('validation.required') }),
  province: z.string().trim().min(1, { message: t('validation.required') }),
  countryCode: z.string().min(2, { message: t('address.validation.countryRequired') }),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  title: '',
  owner: '',
  careOf: '',
  street: '',
  zip: '',
  city: '',
  province: '',
  countryCode: '',
});

const currentValues = reactive({
  owner: '',
  careOf: '',
  street: '',
  zip: '',
  city: '',
  province: '',
  countryCode: '',
});

const initialValues = ref({ ...currentValues });
const formKey = ref(0);

const isDirty = computed(
  () =>
    currentValues.owner !== serverValues.owner ||
    currentValues.careOf !== serverValues.careOf ||
    currentValues.street !== serverValues.street ||
    currentValues.zip !== serverValues.zip ||
    currentValues.city !== serverValues.city ||
    currentValues.province !== serverValues.province ||
    currentValues.countryCode !== serverValues.countryCode,
);

onMounted(async () => {
  try {
    const project = await projectService.getProject(props.projectId);
    const loaded = {
      title: project.title || '',
      owner: project.owner || '',
      careOf: project.careOf || '',
      street: project.address?.street || '',
      zip: project.address?.zip || '',
      city: project.address?.city || '',
      province: project.address?.province || '',
      countryCode: project.address?.countryCode || '',
    };
    Object.assign(serverValues, loaded);
    Object.assign(currentValues, loaded);
    initialValues.value = { ...currentValues };
    formKey.value++;
  } catch (error) {
    console.error('Failed to load billing recipient data', error);
  }
});

async function handleZipBlur() {
  const zip = currentValues.zip;
  if (!zip) return;
  try {
    const result = await addressService.getCityFromZip(zip);
    if (result?.city) {
      currentValues.city = result.city;
      currentValues.province = result.province || '';
      currentValues.countryCode = result.countryCode || '';
      initialValues.value = { ...currentValues };
      formKey.value++;
    }
  } catch (error) {
    console.error('ZIP lookup failed', error);
  }
}

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;
  const s = event.states;
  const address: AddressJson = {
    street: s.street?.value || undefined,
    zip: s.zip?.value || undefined,
    city: s.city?.value || undefined,
    province: s.province?.value || undefined,
    countryCode: s.countryCode?.value || undefined,
  };

  try {
    const updatedProject = {
      title: serverValues.title,
      owner: s.owner?.value?.trim() || undefined,
      careOf: s.careOf?.value?.trim() || undefined,
      address,
    };
    await projectService.updateProject(props.projectId, updatedProject);

    const saved = {
      owner: updatedProject.owner || '',
      careOf: updatedProject.careOf || '',
      street: address.street || '',
      zip: address.zip || '',
      city: address.city || '',
      province: address.province || '',
      countryCode: address.countryCode || '',
    };
    Object.assign(serverValues, saved);
    Object.assign(currentValues, saved);
    initialValues.value = { ...currentValues };
    formKey.value++;
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('address.saveSuccess'),
      life: 3000,
    });
  } catch (error) {
    console.error('Failed to save billing recipient data', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('address.saveError'),
      life: 4000,
    });
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('projectSettings.billingAddress.title') }}
    </template>

    <template #content>
      <Form
        :key="formKey"
        v-slot="$form"
        :initialValues
        :resolver
        @submit="onSubmit"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label for="owner" class="font-medium">
              {{ t('projectSettings.billingAddress.owner') }}
            </label>
            <InputText
              id="owner"
              name="owner"
              fluid
              @update:modelValue="(v) => (currentValues.owner = v as string)"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label for="careOf" class="font-medium">
              {{ t('projectSettings.billingAddress.careOf') }}
            </label>
            <InputText
              id="careOf"
              name="careOf"
              fluid
              @update:modelValue="(v) => (currentValues.careOf = v as string)"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label for="street" class="font-medium">
              {{ t('address.street') }}*
            </label>
            <InputText
              id="street"
              name="street"
              fluid
              @update:modelValue="(v) => (currentValues.street = v as string)"
            />
            <Message
              v-if="$form.street?.invalid && $form.street?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.street.error?.message }}
            </Message>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1">
              <label for="zip" class="font-medium">
                {{ t('address.zip') }}*
              </label>
              <InputText
                id="zip"
                name="zip"
                fluid
                @update:modelValue="(v) => (currentValues.zip = v as string)"
                @blur="handleZipBlur"
              />
              <Message
                v-if="$form.zip?.invalid && $form.zip?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.zip.error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <label for="city" class="font-medium">
                {{ t('address.city') }}*
              </label>
              <InputText
                id="city"
                name="city"
                fluid
                @update:modelValue="(v) => (currentValues.city = v as string)"
              />
              <Message
                v-if="$form.city?.invalid && $form.city?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.city.error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <label for="province" class="font-medium">
                {{ t('address.province') }}*
              </label>
              <InputText
                id="province"
                name="province"
                fluid
                @update:modelValue="(v) => (currentValues.province = v as string)"
              />
              <Message
                v-if="$form.province?.invalid && $form.province?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.province.error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <label for="countryCode" class="font-medium">
                {{ t('address.countryCode') }}*
              </label>
              <Select
                id="countryCode"
                name="countryCode"
                :options="localizedCountries"
                optionValue="code"
                :filterFields="['displayName']"
                :placeholder="t('address.selectCountry')"
                filter
                fluid
                @update:modelValue="(v) => (currentValues.countryCode = v as string)"
              >
                <template #value="{ value }">
                  <span v-if="value">{{ countryFlagEmoji(value) }} {{ countryDisplayName(value, locale) }}</span>
                </template>
                <template #option="{ option }">
                  <span>{{ countryFlagEmoji(option.code) }} {{ option.displayName }}</span>
                </template>
              </Select>
              <Message
                v-if="$form.countryCode?.invalid && $form.countryCode?.touched"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.countryCode.error?.message }}
              </Message>
            </div>
          </div>

          <Message size="small" severity="secondary" variant="simple">
            {{ t('accountSettings.userProfile.requiredFields') }}
          </Message>

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
