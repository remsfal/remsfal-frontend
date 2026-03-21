<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseCard from '@/components/common/BaseCard.vue';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import { userService } from '@/services/UserService';
import AddressService from '@/services/AddressService';

const { t } = useI18n();
const toast = useToast();

const addressService = new AddressService();

const schema = z.object({
  street: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    // eslint-disable-next-line max-len
    .regex(/^(?=.*[A-Za-zÄÖÜäöüß])(?=.*\d)[A-Za-zÄÖÜäöüß0-9\s./-]+$/, { message: t('accountSettings.validation.streetInvalid') }),
  zip: z.string().trim().min(1, { message: t('validation.required') }),
  city: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(/^[A-Za-zÄÖÜäöüß\s-]+$/, {message: t('accountSettings.validation.nameInvalid'),}),
  province: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(/^[A-Za-zÄÖÜäöüß\s-]+$/, {message: t('accountSettings.validation.nameInvalid'),}),
  countryCode: z.string().length(2, { message: t('accountSettings.validation.countryCodeLength') }),
});

const resolver = zodResolver(schema);

// serverValues = baseline from backend (for dirty comparison)
const serverValues = reactive({
 street: '', zip: '', city: '', province: '', countryCode: '' 
});

// currentValues = what the user has typed (tracked via @update:modelValue)
const currentValues = reactive({
 street: '', zip: '', city: '', province: '', countryCode: '' 
});

// initialValues drives what the Form component displays
const initialValues = ref({ ...currentValues });
const formKey = ref(0);

const isDirty = computed(
  () =>
    currentValues.street !== serverValues.street ||
    currentValues.zip !== serverValues.zip ||
    currentValues.city !== serverValues.city ||
    currentValues.province !== serverValues.province ||
    currentValues.countryCode !== serverValues.countryCode,
);

onMounted(async () => {
  try {
    const user = await userService.getUser();
    const addr = user.address;
    const loaded = {
      street: addr?.street || '',
      zip: addr?.zip || '',
      city: addr?.city || '',
      province: addr?.province || '',
      countryCode: addr?.countryCode || '',
    };
    Object.assign(serverValues, loaded);
    Object.assign(currentValues, loaded);
    initialValues.value = { ...loaded };
    formKey.value++;
  } catch (error) {
    console.error('Failed to load address', error);
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
      // Re-key form to show auto-filled values
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
  try {
    await userService.updateUser({
      address: {
        street: s.street?.value || '',
        zip: s.zip?.value || '',
        city: s.city?.value || '',
        province: s.province?.value || '',
        countryCode: s.countryCode?.value || '',
      },
    });

    const saved = {
      street: s.street?.value || '',
      zip: s.zip?.value || '',
      city: s.city?.value || '',
      province: s.province?.value || '',
      countryCode: s.countryCode?.value || '',
    };

    // Move server baseline forward → isDirty becomes false
    Object.assign(serverValues, saved);
    Object.assign(currentValues, saved);
    initialValues.value = { ...saved };
    formKey.value++;

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('accountSettings.address.saveSuccess'),
      life: 3000,
    });
  } catch (error) {
    console.error('Failed to save address', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('accountSettings.address.saveError'),
      life: 4000,
    });
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('accountSettings.address.title') }}
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
              {{ t('accountSettings.address.street') }}*
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
                {{ t('accountSettings.address.zip') }}*
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
                {{ t('accountSettings.address.city') }}*
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
                {{ t('accountSettings.address.province') }}*
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

            <!-- Country Code -->
            <div class="flex flex-col gap-1">
              <label for="countryCode" class="font-medium">
                {{ t('accountSettings.address.countryCode') }}*
              </label>
              <InputText
                id="countryCode"
                name="countryCode"
                fluid
                @update:modelValue="(v) => (currentValues.countryCode = v as string)"
              />
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
