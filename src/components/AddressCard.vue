<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { countryFlagEmoji, countryDisplayName } from '@/helper/countryHelper';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import BaseCard from '@/components/common/BaseCard.vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Message from 'primevue/message';
import Button from 'primevue/button';
import type { AddressJson } from '@/services/AddressService';
import { useAddressForm, buildAddressSchema } from '@/composables/useAddressForm';

interface Props {
  loadAddress: () => Promise<AddressJson | undefined>;
  saveAddress: (addr: AddressJson) => Promise<void>;
  title?: string;
}

const props = defineProps<Props>();

const { t, locale } = useI18n();

const schema = buildAddressSchema(t);
const resolver = zodResolver(schema);

const {currentValues, initialValues, formKey, isDirty, localizedCountries, handleZipBlur, onSubmit,} = useAddressForm({
  load: props.loadAddress,
  save: props.saveAddress,
});
</script>

<template>
  <BaseCard>
    <template #title>
      {{ title ?? t('address.title') }}
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
          <!-- Street -->
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
            <!-- ZIP -->
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

            <!-- City -->
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

            <!-- Province -->
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

            <!-- Country -->
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

          <!-- Save Button -->
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
