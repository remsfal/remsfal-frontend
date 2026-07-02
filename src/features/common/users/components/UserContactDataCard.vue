<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import BaseCard from '@/components/common/BaseCard.vue';
import PhoneInput from '@/components/common/PhoneInput.vue';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Select from 'primevue/select';
import BaseDialog from '@/components/common/BaseDialog.vue';
import { userService } from '@/services/UserService';
import { type Locale } from '@/i18n/i18n';

const { t } = useI18n();
const i18n = useI18n();
const toast = useToast();

const nameRegex = /^[A-Za-zÄÖÜäöüß\s]+$/;
const phoneRegex = /^\+[1-9]\d{4,14}$/;

const schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(nameRegex, { message: t('accountSettings.validation.nameInvalid') }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(nameRegex, { message: t('accountSettings.validation.nameInvalid') }),
  locale: z.string(),
});

const resolver = zodResolver(schema);
const formKey = ref(0);
const formFields = ['firstName', 'lastName', 'locale'];
const initialValues = ref<Record<string, string>>({
  firstName: '',
  lastName: '',
  locale: i18n.locale.value,
});

// Phone fields tracked separately (not via PrimeVue Forms)
const serverPhones = reactive({
  mobile: '', business: '', private: '' 
});
const currentPhones = reactive({
  mobile: '', business: '', private: '' 
});

const phoneDirty = computed(
  () =>
    currentPhones.mobile !== serverPhones.mobile ||
    currentPhones.business !== serverPhones.business ||
    currentPhones.private !== serverPhones.private,
);

function phoneFieldError(val: string) {
  return val && !phoneRegex.test(val) ? t('validation.phone') : null;
}
const mobilePhoneError = computed(() => phoneFieldError(currentPhones.mobile));
const businessPhoneError = computed(() => phoneFieldError(currentPhones.business));
const privatePhoneError = computed(() => phoneFieldError(currentPhones.private));
const hasPhoneError = computed(() => !!mobilePhoneError.value || !!businessPhoneError.value || !!privatePhoneError.value);

const email = ref('');
const additionalEmails = ref<string[]>([]);
const altEmailDirty = ref(false);
const altEmailSuccess = ref(false);
const altEmailError = ref(false);

const dialogVisible = ref(false);
const alternativeEmailInput = ref('');
const isEmailInvalid = ref(false);
const emailErrorMessage = ref('');

const localeOptions = [
  { language: 'Deutsch', value: 'de' },
  { language: 'English', value: 'en' },
];

function validateLocale(locale: string): Locale {
  return locale === 'de' || locale === 'en' ? (locale as Locale) : 'en';
}

onMounted(async () => {
  try {
    const profile = await userService.getUser();
    email.value = profile.email || '';
    initialValues.value = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      locale: profile.locale ? validateLocale(profile.locale) : i18n.locale.value,
    };
    if (profile.locale) {
      i18n.locale.value = validateLocale(profile.locale);
    }
    const phones = {
      mobile: profile.mobilePhoneNumber || '',
      business: profile.businessPhoneNumber || '',
      private: profile.privatePhoneNumber || '',
    };
    Object.assign(serverPhones, phones);
    Object.assign(currentPhones, phones);
    additionalEmails.value = Array.isArray(profile.additionalEmails)
      ? [...profile.additionalEmails]
      : [];
    formKey.value++;
  } catch (error) {
    console.error('Failed to load user profile', error);
  }
});

const displayAlternativeEmail = computed<string | null>(() =>
  additionalEmails.value.length > 0 ? (additionalEmails.value[0] ?? null) : null,
);

function validateEmailFormat(emailStr: string) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr);
}

function resetAltEmailDialog() {
  alternativeEmailInput.value = '';
  isEmailInvalid.value = false;
  emailErrorMessage.value = '';
}

function saveAlternativeEmail() {
  const entered = alternativeEmailInput.value.trim();
  const primary = email.value.trim().toLowerCase();

  if (!entered || !validateEmailFormat(entered)) {
    isEmailInvalid.value = true;
    emailErrorMessage.value = t('projectSettings.newProjectMemberButton.invalidEmail');
    return;
  }
  if (entered.toLowerCase() === primary) {
    isEmailInvalid.value = true;
    emailErrorMessage.value = t('accountSettings.userProfile.alternativeEmailNotEqualPrimary');
    return;
  }
  isEmailInvalid.value = false;
  emailErrorMessage.value = '';
  additionalEmails.value = [entered];
  altEmailDirty.value = true;
  altEmailSuccess.value = false;
  altEmailError.value = false;
  dialogVisible.value = false;
  alternativeEmailInput.value = '';
}

function deleteAlternativeEmail() {
  additionalEmails.value = [];
  altEmailDirty.value = true;
  altEmailSuccess.value = false;
  altEmailError.value = false;
}

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid || hasPhoneError.value) return;
  const s = event.states;
  try {
    const updatedUser = await userService.updateUser({
      firstName: s.firstName?.value || undefined,
      lastName: s.lastName?.value || undefined,
      mobilePhoneNumber: currentPhones.mobile || undefined,
      businessPhoneNumber: currentPhones.business || undefined,
      privatePhoneNumber: currentPhones.private || undefined,
      locale: s.locale?.value || undefined,
      additionalEmails: altEmailDirty.value ? additionalEmails.value : undefined,
    });

    initialValues.value = {
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      locale: updatedUser.locale ? validateLocale(updatedUser.locale) : i18n.locale.value,
    };
    formKey.value++;

    const savedPhones = {
      mobile: updatedUser.mobilePhoneNumber || '',
      business: updatedUser.businessPhoneNumber || '',
      private: updatedUser.privatePhoneNumber || '',
    };
    Object.assign(serverPhones, savedPhones);
    Object.assign(currentPhones, savedPhones);

    additionalEmails.value = Array.isArray(updatedUser.additionalEmails)
      ? [...updatedUser.additionalEmails]
      : [];
    altEmailDirty.value = false;
    altEmailSuccess.value = true;
    altEmailError.value = false;

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('accountSettings.userProfile.saveSuccess'),
      life: 3000,
    });
  } catch (error) {
    console.error('Failed to update user profile', error);
    altEmailSuccess.value = false;
    altEmailError.value = true;
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('accountSettings.userProfile.saveError'),
      life: 4000,
    });
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('accountSettings.userProfile.title') }}
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
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- First Name -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="firstName">
                {{ t('accountSettings.userProfile.firstName') }}*
              </label>
              <InputText id="firstName" fluid name="firstName" />
              <Message
                v-if="$form.firstName?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.firstName.error?.message }}
              </Message>
            </div>

            <!-- Last Name -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="lastName">
                {{ t('accountSettings.userProfile.lastName') }}*
              </label>
              <InputText id="lastName" fluid name="lastName" />
              <Message
                v-if="$form.lastName?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.lastName.error?.message }}
              </Message>
            </div>

            <!-- Primary Email (readonly) -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="primaryEmail">
                {{ t('accountSettings.userProfile.email') }}
              </label>
              <InputText id="primaryEmail" :value="email" disabled fluid />
            </div>

            <!-- Alternative Email -->
            <div class="flex flex-col gap-1">
              <label class="font-medium">
                {{ t('accountSettings.userProfile.alternativeEmail') }}
              </label>
              <div v-if="displayAlternativeEmail" class="flex items-center gap-2">
                <InputText :value="displayAlternativeEmail" class="flex-1" disabled />
                <span v-if="altEmailSuccess" class="text-green-600 font-bold">✔</span>
                <span v-if="altEmailError" class="text-red-600 font-bold">✗</span>
                <Button
                  icon="pi pi-trash"
                  severity="secondary"
                  type="button"
                  @click="deleteAlternativeEmail"
                />
              </div>
              <div>
                <Button
                  :disabled="!!displayAlternativeEmail"
                  :label="t('accountSettings.userProfile.addAlternativeEmail')"
                  icon="pi pi-plus"
                  type="button"
                  @click="dialogVisible = true"
                />
              </div>
            </div>

            <!-- Mobile Phone -->
            <div class="flex flex-col gap-1">
              <label for="mobile-phone" class="font-medium">
                {{ t('accountSettings.userProfile.mobilePhone') }}
              </label>
              <PhoneInput
                inputId="mobile-phone"
                :modelValue="currentPhones.mobile"
                @update:modelValue="(v) => (currentPhones.mobile = v)"
              />
              <Message
                v-if="mobilePhoneError && currentPhones.mobile"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ mobilePhoneError }}
              </Message>
            </div>

            <!-- Business Phone -->
            <div class="flex flex-col gap-1">
              <label for="business-phone" class="font-medium">
                {{ t('accountSettings.userProfile.businessPhone') }}
              </label>
              <PhoneInput
                inputId="business-phone"
                :modelValue="currentPhones.business"
                @update:modelValue="(v) => (currentPhones.business = v)"
              />
              <Message
                v-if="businessPhoneError && currentPhones.business"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ businessPhoneError }}
              </Message>
            </div>

            <!-- Private Phone -->
            <div class="flex flex-col gap-1">
              <label for="private-phone" class="font-medium">
                {{ t('accountSettings.userProfile.privatePhone') }}
              </label>
              <PhoneInput
                inputId="private-phone"
                :modelValue="currentPhones.private"
                @update:modelValue="(v) => (currentPhones.private = v)"
              />
              <Message
                v-if="privatePhoneError && currentPhones.private"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ privatePhoneError }}
              </Message>
            </div>

            <!-- Language -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="locale">
                {{ t('accountSettings.userProfile.language') }}
              </label>
              <Select
                id="locale"
                :options="localeOptions"
                fluid
                name="locale"
                optionLabel="language"
                optionValue="value"
                @change="(e) => (i18n.locale.value = e.value)"
              />
            </div>
          </div>

          <Message severity="secondary" size="small" variant="simple">
            {{ t('accountSettings.userProfile.requiredFields') }}
          </Message>

          <!-- Save Button -->
          <div class="flex justify-end">
            <Button
              :disabled="!(formFields.some(k => $form[k]?.dirty) || altEmailDirty || phoneDirty) || hasPhoneError"
              :label="t('button.save')"
              icon="pi pi-save"
              type="submit"
            />
          </div>
        </div>
      </Form>
    </template>
  </BaseCard>

  <!-- Alternative Email Dialog -->
  <BaseDialog
    v-model:visible="dialogVisible"
    :header="t('accountSettings.userProfile.addAlternativeEmail')"
    @hide="resetAltEmailDialog"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="font-semibold" for="alt-email-input">
          {{ t('accountSettings.userProfile.email') }}
        </label>
        <InputText
          id="alt-email-input"
          v-model="alternativeEmailInput"
          :invalid="isEmailInvalid"
          :placeholder="t('accountSettings.userProfile.alternativeEmail')"
          autocomplete="off"
          fluid
          type="email"
        />
        <small v-if="isEmailInvalid" class="text-red-500">
          {{ emailErrorMessage }}
        </small>
      </div>
      <div class="flex justify-end gap-2">
        <Button
          :label="t('button.cancel')"
          severity="secondary"
          type="button"
          @click="dialogVisible = false"
        />
        <Button
          :label="t('button.add')"
          type="button"
          @click="saveAlternativeEmail"
        />
      </div>
    </div>
  </BaseDialog>
</template>
