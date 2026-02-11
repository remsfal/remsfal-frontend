<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { tenantService, type Tenant } from '@/services/TenantService';
import BaseCard from '@/components/common/BaseCard.vue';

const props = defineProps<{
  projectId: string;
  tenantId: string;
}>();

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Form schema
const tenantSchema = z.object({
  firstName: z.string().trim().min(1, { message: t('validation.required') }),
  lastName: z.string().trim().min(1, { message: t('validation.required') }),
  email: z
    .string()
    .trim()
    .email({ message: t('validation.email') })
    .optional()
    .or(z.literal('')),
  mobilePhoneNumber: z.string().trim().optional().or(z.literal('')),
  businessPhoneNumber: z.string().trim().optional().or(z.literal('')),
  privatePhoneNumber: z.string().trim().optional().or(z.literal('')),
  street: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  zip: z
    .string()
    .trim()
    .regex(/^\d{4,5}$/, { message: t('validation.zip') })
    .optional()
    .or(z.literal('')),
  province: z.string().trim().optional().or(z.literal('')),
  countryCode: z.string().trim().optional().or(z.literal('')),
  placeOfBirth: z.string().trim().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
});

const resolver = zodResolver(tenantSchema);
const initialValues = ref<Record<string, string>>({});
const isLoading = ref(false);

// Load tenant data
async function loadTenant() {
  isLoading.value = true;
  try {
    const tenant = await tenantService.getTenant(props.projectId, props.tenantId);

    if (!tenant) {
      toast.add({
 severity: 'error', summary: t('tenantDetail.notFound'), life: 3000 
});
      router.push({ name: 'TenantList', params: { projectId: props.projectId } });
      return;
    }

    // Set initial form values (flatten address)
    initialValues.value = {
      firstName: tenant.firstName || '',
      lastName: tenant.lastName || '',
      email: tenant.email || '',
      mobilePhoneNumber: tenant.mobilePhoneNumber || '',
      businessPhoneNumber: tenant.businessPhoneNumber || '',
      privatePhoneNumber: tenant.privatePhoneNumber || '',
      street: tenant.address?.street || '',
      city: tenant.address?.city || '',
      zip: tenant.address?.zip || '',
      province: tenant.address?.province || '',
      countryCode: tenant.address?.countryCode || '',
      placeOfBirth: tenant.placeOfBirth || '',
      dateOfBirth: tenant.dateOfBirth || '',
    };
  } catch (error) {
    toast.add({
 severity: 'error', summary: t('tenantDetail.error'), life: 3000 
});
    router.push({ name: 'TenantList', params: { projectId: props.projectId } });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadTenant();
});

// Save handler
async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid) return;

  const formData = event.states;

  // Rebuild Tenant with nested address
  const updatedTenant: Tenant = {
    id: props.tenantId,
    firstName: formData.firstName?.value || '',
    lastName: formData.lastName?.value || '',
    email: formData.email?.value || undefined,
    mobilePhoneNumber: formData.mobilePhoneNumber?.value || undefined,
    businessPhoneNumber: formData.businessPhoneNumber?.value || undefined,
    privatePhoneNumber: formData.privatePhoneNumber?.value || undefined,
    address: {
      street: formData.street?.value || undefined,
      city: formData.city?.value || undefined,
      zip: formData.zip?.value || undefined,
      province: formData.province?.value || undefined,
      countryCode: formData.countryCode?.value || undefined,
    },
    placeOfBirth: formData.placeOfBirth?.value || undefined,
    dateOfBirth: formData.dateOfBirth?.value || undefined,
  };

  try {
    await tenantService.updateTenant(props.projectId, props.tenantId, updatedTenant);
    toast.add({
 severity: 'success', summary: t('tenantDetail.success'), life: 3000 
});
    router.push({ name: 'TenantList', params: { projectId: props.projectId } });
  } catch (error) {
    toast.add({
 severity: 'error', summary: t('tenantDetail.error'), life: 3000 
});
  }
}

function onCancel() {
  router.push({ name: 'TenantList', params: { projectId: props.projectId } });
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('tenantDetail.title') }}
    </template>
    <template #content>
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <ProgressSpinner />
      </div>

      <!-- Edit Form -->
      <Form
        v-else v-slot="$form"
        :initialValues :resolver
        @submit="onSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <!-- First Name -->
          <div class="flex flex-col gap-2 md:col-span-1">
            <label for="firstName" class="font-semibold">
              {{ t('tenantDetail.form.firstName') }}
            </label>
            <InputText
              name="firstName"
              type="text"
              :class="{ 'p-invalid': $form.firstName?.invalid && $form.firstName?.touched }"
              autofocus
              fluid
            />
            <Message
              v-if="$form.firstName?.invalid && $form.firstName?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.firstName.error?.message }}
            </Message>
          </div>

          <!-- Last Name -->
          <div class="flex flex-col gap-2 md:col-span-1">
            <label for="lastName" class="font-semibold">
              {{ t('tenantDetail.form.lastName') }}
            </label>
            <InputText
              name="lastName"
              type="text"
              :class="{ 'p-invalid': $form.lastName?.invalid && $form.lastName?.touched }"
              fluid
            />
            <Message
              v-if="$form.lastName?.invalid && $form.lastName?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.lastName.error?.message }}
            </Message>
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="email" class="font-semibold">
              {{ t('tenantDetail.form.email') }}
            </label>
            <InputText
              name="email"
              type="email"
              :class="{ 'p-invalid': $form.email?.invalid && $form.email?.touched }"
              fluid
            />
            <Message
              v-if="$form.email?.invalid && $form.email?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.email.error?.message }}
            </Message>
          </div>

          <!-- Mobile Phone -->
          <div class="flex flex-col gap-2">
            <label for="mobilePhoneNumber" class="font-semibold">
              {{ t('tenantDetail.form.mobile') }}
            </label>
            <InputText name="mobilePhoneNumber" type="tel" fluid />
          </div>

          <!-- Business Phone -->
          <div class="flex flex-col gap-2">
            <label for="businessPhoneNumber" class="font-semibold">
              {{ t('tenantDetail.form.business') }}
            </label>
            <InputText name="businessPhoneNumber" type="tel" fluid />
          </div>

          <!-- Private Phone -->
          <div class="flex flex-col gap-2">
            <label for="privatePhoneNumber" class="font-semibold">
              {{ t('tenantDetail.form.private') }}
            </label>
            <InputText name="privatePhoneNumber" type="tel" fluid />
          </div>

          <!-- Address Section -->
          <div class="md:col-span-2 mt-4">
            <h3 class="font-semibold text-lg mb-4">
              {{ t('tenantDetail.form.address') }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <!-- Street -->
              <div class="flex flex-col gap-2 md:col-span-2">
                <label for="street" class="font-semibold">
                  {{ t('tenantDetail.form.street') }}
                </label>
                <InputText name="street" type="text" fluid />
              </div>

              <!-- City -->
              <div class="flex flex-col gap-2">
                <label for="city" class="font-semibold">
                  {{ t('tenantDetail.form.city') }}
                </label>
                <InputText name="city" type="text" fluid />
              </div>

              <!-- ZIP -->
              <div class="flex flex-col gap-2">
                <label for="zip" class="font-semibold">
                  {{ t('tenantDetail.form.zip') }}
                </label>
                <InputText
                  name="zip"
                  type="text"
                  :class="{ 'p-invalid': $form.zip?.invalid && $form.zip?.touched }"
                  fluid
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

              <!-- Province -->
              <div class="flex flex-col gap-2">
                <label for="province" class="font-semibold">
                  {{ t('tenantDetail.form.province') }}
                </label>
                <InputText name="province" type="text" fluid />
              </div>

              <!-- Country Code -->
              <div class="flex flex-col gap-2">
                <label for="countryCode" class="font-semibold">
                  {{ t('tenantDetail.form.countryCode') }}
                </label>
                <InputText name="countryCode" type="text" fluid />
              </div>
            </div>
          </div>

          <!-- Place of Birth -->
          <div class="flex flex-col gap-2">
            <label for="placeOfBirth" class="font-semibold">
              {{ t('tenantDetail.form.placeOfBirth') }}
            </label>
            <InputText name="placeOfBirth" type="text" fluid />
          </div>

          <!-- Date of Birth -->
          <div class="flex flex-col gap-2">
            <label for="dateOfBirth" class="font-semibold">
              {{ t('tenantDetail.form.dateOfBirth') }}
            </label>
            <DatePicker name="dateOfBirth" dateFormat="yy-mm-dd" fluid />
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            :label="t('tenantDetail.button.cancel')"
            severity="secondary"
            @click="onCancel"
          />
          <Button
            type="submit"
            :label="t('tenantDetail.button.save')"
            icon="pi pi-check"
            :disabled="!$form.valid || !$form.dirty"
          />
        </div>
      </Form>
    </template>
  </BaseCard>
</template>
