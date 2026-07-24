<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
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
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';
import { tenantService, type TenantJson } from '../services/TenantService';
import { toISODateString } from '@/helper/dataHelper';

const props = defineProps<{
  projectId: string;
  tenantId: string;
}>();

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const phoneRegex = /^\+[1-9]\d{4,14}$/;

const schema = z.object({
  firstName: z.string().trim().min(1, { message: t('validation.required') }),
  lastName: z.string().trim().min(1, { message: t('validation.required') }),
  email: z
    .string()
    .trim()
    .email({ message: t('validation.email') })
    .optional()
    .or(z.literal('')),
  placeOfBirth: z.string().trim().optional().or(z.literal('')),
});

const resolver = zodResolver(schema);
const formKey = ref(0);
const formFields = ['firstName', 'lastName', 'email', 'placeOfBirth'];
const initialValues = ref<Record<string, string>>({
  firstName: '', lastName: '', email: '', placeOfBirth: ''
});
const isLoading = ref(false);

const cardTitle = computed(() => {
  const name = `${initialValues.value.firstName} ${initialValues.value.lastName}`.trim();
  return name ? t('tenantDetail.contactTitle', { name }) : t('tenantDetail.title');
});

// Date of birth tracked separately (not via PrimeVue Forms, DatePicker returns a Date)
const serverDateOfBirth = ref<Date | null>(null);
const dateOfBirthValue = ref<Date | null>(null);
const dateOfBirthDirty = computed(
  () => toISODateString(dateOfBirthValue.value) !== toISODateString(serverDateOfBirth.value),
);

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
const hasPhoneError = computed(
  () => !!mobilePhoneError.value || !!businessPhoneError.value || !!privatePhoneError.value,
);

// Kept from the last load/save so a submit here never wipes out the address
// managed independently by TenantAddressCard.
const serverAddress = ref<TenantJson['address']>(undefined);

async function loadTenant() {
  isLoading.value = true;
  try {
    const tenant = await tenantService.getTenant(props.projectId, props.tenantId);

    initialValues.value = {
      firstName: tenant.firstName || '',
      lastName: tenant.lastName || '',
      email: tenant.email || '',
      placeOfBirth: tenant.placeOfBirth || '',
    };
    serverDateOfBirth.value = dateOfBirthValue.value = tenant.dateOfBirth
      ? new Date(tenant.dateOfBirth)
      : null;
    const phones = {
      mobile: tenant.mobilePhoneNumber || '',
      business: tenant.businessPhoneNumber || '',
      private: tenant.privatePhoneNumber || '',
    };
    Object.assign(serverPhones, phones);
    Object.assign(currentPhones, phones);
    serverAddress.value = tenant.address;
    formKey.value++;
  } catch {
    toast.add({
      severity: 'error',
      summary: t('tenantDetail.error'),
      life: 3000,
    });
    router.push({ name: 'TenantList', params: { projectId: props.projectId } });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadTenant();
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid || hasPhoneError.value) return;
  const s = event.states;

  const updatedTenant: TenantJson = {
    id: props.tenantId,
    firstName: s.firstName?.value || '',
    lastName: s.lastName?.value || '',
    email: s.email?.value || undefined,
    placeOfBirth: s.placeOfBirth?.value?.trim() || undefined,
    dateOfBirth: toISODateString(dateOfBirthValue.value),
    mobilePhoneNumber: currentPhones.mobile || undefined,
    businessPhoneNumber: currentPhones.business || undefined,
    privatePhoneNumber: currentPhones.private || undefined,
    address: serverAddress.value,
  };

  try {
    const updated = await tenantService.updateTenant(props.projectId, props.tenantId, updatedTenant);

    initialValues.value = {
      firstName: updated.firstName || '',
      lastName: updated.lastName || '',
      email: updated.email || '',
      placeOfBirth: updated.placeOfBirth || '',
    };
    serverDateOfBirth.value = dateOfBirthValue.value = updated.dateOfBirth
      ? new Date(updated.dateOfBirth)
      : null;
    const savedPhones = {
      mobile: updated.mobilePhoneNumber || '',
      business: updated.businessPhoneNumber || '',
      private: updated.privatePhoneNumber || '',
    };
    Object.assign(serverPhones, savedPhones);
    Object.assign(currentPhones, savedPhones);
    serverAddress.value = updated.address;
    formKey.value++;

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('tenantDetail.success'),
      life: 3000,
    });
  } catch {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantDetail.error'),
      life: 4000,
    });
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ cardTitle }}
    </template>

    <template #content>
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <ProgressSpinner />
      </div>

      <Form
        v-else
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
                {{ t('tenantDetail.form.firstName') }}*
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
                {{ t('tenantDetail.form.lastName') }}*
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

            <!-- Place of Birth -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="placeOfBirth">
                {{ t('tenantDetail.form.placeOfBirth') }}
              </label>
              <InputText id="placeOfBirth" fluid name="placeOfBirth" />
            </div>

            <!-- Date of Birth -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="dateOfBirth">
                {{ t('tenantDetail.form.dateOfBirth') }}
              </label>
              <DatePicker
                inputId="dateOfBirth"
                v-model="dateOfBirthValue"
                dateFormat="dd.mm.yy"
                fluid
                showIcon
              />
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-1">
              <label class="font-medium" for="email">
                {{ t('tenantDetail.form.email') }}
              </label>
              <InputText id="email" fluid name="email" type="email" />
              <Message
                v-if="$form.email?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.email.error?.message }}
              </Message>
            </div>

            <!-- Mobile Phone -->
            <div class="flex flex-col gap-1">
              <label for="mobile-phone" class="font-medium">
                {{ t('tenantDetail.form.mobile') }}
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
                {{ t('tenantDetail.form.business') }}
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
                {{ t('tenantDetail.form.private') }}
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
          </div>

          <!-- Save Button -->
          <div class="flex justify-end">
            <Button
              :disabled="
                !(formFields.some(k => $form[k]?.dirty) || phoneDirty || dateOfBirthDirty) ||
                  hasPhoneError
              "
              :label="t('tenantDetail.button.save')"
              icon="pi pi-save"
              type="submit"
            />
          </div>
        </div>
      </Form>
    </template>
  </BaseCard>
</template>
