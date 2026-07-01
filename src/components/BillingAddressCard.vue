<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { countryFlagEmoji, countryDisplayName } from '@/helper/countryHelper';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseCard from '@/components/common/BaseCard.vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Message from 'primevue/message';
import Button from 'primevue/button';
import { projectService } from '@/services/ProjectService';
import { useAddressForm, buildAddressSchema } from '@/composables/useAddressForm';

interface Props {
  projectId: string;
}

const props = defineProps<Props>();

const { t, locale } = useI18n();

const schema = buildAddressSchema(t, {
  owner: z.string().trim().optional(),
  careOf: z.string().trim().optional(),
});
const resolver = zodResolver(schema);

// Not part of the form itself, but required by ProjectJson on save — captured on load, re-sent unchanged.
const projectTitle = ref('');

const {currentValues, initialValues, formKey, isDirty, localizedCountries, handleZipBlur, onSubmit,} = useAddressForm({
  extraFieldDefaults: { owner: '', careOf: '' },
  load: async () => {
    const project = await projectService.getProject(props.projectId);
    projectTitle.value = project.title || '';
    return {
      owner: project.owner || '',
      careOf: project.careOf || '',
      street: project.address?.street || '',
      zip: project.address?.zip || '',
      city: project.address?.city || '',
      province: project.address?.province || '',
      countryCode: project.address?.countryCode || '',
    };
  },
  save: async (payload) => {
    await projectService.updateProject(props.projectId, {
      title: projectTitle.value,
      owner: payload.owner || undefined,
      careOf: payload.careOf || undefined,
      address: {
        street: payload.street,
        zip: payload.zip,
        city: payload.city,
        province: payload.province,
        countryCode: payload.countryCode,
      },
    });
  },
  loadErrorLogLabel: 'Failed to load billing recipient data',
  errorLogLabel: 'Failed to save billing recipient data',
});
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
