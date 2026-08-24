<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import PhoneInput from '@/components/common/PhoneInput.vue';
import OrganizationSelect from '@/features/project/contractors/components/OrganizationSelect.vue';
import { projectContractorService } from '@/services/ProjectContractorService';

const props = defineProps<{ projectId: string; contractorId: string }>();

const { t } = useI18n();
const toast = useToast();

const phoneRegex = /^\+[1-9]\d{4,14}$/;

const schema = z.object({
  companyName: z.string().trim().min(1, { message: t('contractor.new.validation.name') }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {message: t('contractor.new.validation.email'),}),
  contactPerson: z.string().trim().optional(),
  trade: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  companyName: '', email: '', phone: '', contactPerson: '', trade: '', remarks: '',
  organizationId: null as string | null,
});
const currentValues = reactive({
  companyName: '', email: '', phone: '', contactPerson: '', trade: '', remarks: '',
  organizationId: null as string | null,
});
const initialValues = ref({
  companyName: '', email: '', phone: '', contactPerson: '', trade: '', remarks: '',
  organizationId: null as string | null,
});
const formKey = ref(0);
const isLoading = ref(true);
const linkedOrganizationName = ref<string | null>(null);

const isDirty = computed(() =>
  Object.keys(serverValues).some(
    (k) => currentValues[k as keyof typeof currentValues] !== serverValues[k as keyof typeof serverValues],
  ),
);

const phoneError = computed(() => {
  const v = currentValues.phone;
  if (!v) return null;
  return phoneRegex.test(v) ? null : t('validation.phone');
});

onMounted(async () => {
  try {
    const c = await projectContractorService.getContractor(props.projectId, props.contractorId);
    const loaded = {
      companyName: c.companyName ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      contactPerson: c.contactPerson ?? '',
      trade: c.trade ?? '',
      remarks: c.remarks ?? '',
      organizationId: c.organizationId ?? null,
    };
    Object.assign(serverValues, loaded);
    Object.assign(currentValues, loaded);
    initialValues.value = { ...loaded };
    linkedOrganizationName.value = c.organization?.name ?? null;
    formKey.value++;
  } catch {
    // silently ignore — form stays empty
  } finally {
    isLoading.value = false;
  }
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid || phoneError.value) return;
  const s = event.states;
  const payload = {
    companyName: s.companyName?.value || undefined,
    email: currentValues.email || undefined,
    phone: currentValues.phone || undefined,
    contactPerson: currentValues.contactPerson || undefined,
    trade: currentValues.trade || undefined,
    remarks: currentValues.remarks || undefined,
    organizationId: currentValues.organizationId || undefined,
  };
  try {
    const updated = await projectContractorService.updateContractor(props.projectId, props.contractorId, payload);
    const saved = {
      companyName: updated.companyName ?? '',
      email: updated.email ?? '',
      phone: updated.phone ?? '',
      contactPerson: updated.contactPerson ?? '',
      trade: updated.trade ?? '',
      remarks: updated.remarks ?? '',
      organizationId: updated.organizationId ?? null,
    };
    Object.assign(serverValues, saved);
    Object.assign(currentValues, saved);
    initialValues.value = { ...saved };
    linkedOrganizationName.value = updated.organization?.name ?? null;
    formKey.value++;
    toast.add({
      severity: 'success', summary: t('contractor.detail.saveSuccess'), life: 3000 
    });
  } catch {
    toast.add({
      severity: 'error', summary: t('contractor.detail.saveError'), life: 4000 
    });
  }
}
</script>

<template>
  <BaseCard :loading="isLoading">
    <template #title>
      {{ t('contractor.detail.title') }}
    </template>
    <template #content>
      <Form
        :key="formKey" v-slot="$form"
        :initialValues :resolver
        @submit="onSubmit"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label for="companyName" class="font-medium">{{ t('contractor.detail.companyName') }}*</label>
            <InputText
              id="companyName"
              name="companyName"
              fluid
              @update:modelValue="(v) => (currentValues.companyName = v as string)"
            />
            <Message
              v-if="$form.companyName?.invalid && $form.companyName?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.companyName.error?.message }}
            </Message>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1">
              <label for="phone" class="font-medium">{{ t('contractor.detail.phone') }}</label>
              <PhoneInput
                :modelValue="currentValues.phone"
                inputId="phone"
                @update:modelValue="(v) => (currentValues.phone = v)"
              />
              <Message
                v-if="phoneError && currentValues.phone"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ phoneError }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <label for="email" class="font-medium">{{ t('contractor.detail.email') }}</label>
              <InputText
                id="email"
                name="email"
                type="email"
                fluid
                @update:modelValue="(v) => (currentValues.email = v as string)"
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

            <div class="flex flex-col gap-1">
              <label for="contactPerson" class="font-medium">{{ t('contractor.detail.contactPerson') }}</label>
              <InputText
                id="contactPerson"
                name="contactPerson"
                fluid
                @update:modelValue="(v) => (currentValues.contactPerson = v as string)"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="trade" class="font-medium">{{ t('contractor.detail.trade') }}</label>
              <InputText
                id="trade"
                name="trade"
                fluid
                @update:modelValue="(v) => (currentValues.trade = v as string)"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="organization" class="font-medium">{{ t('contractor.organization') }}</label>
              <OrganizationSelect
                :modelValue="currentValues.organizationId"
                inputId="organization"
                @update:modelValue="(v) => (currentValues.organizationId = v)"
              />
              <small v-if="linkedOrganizationName" class="text-muted-color">
                {{ t('contractor.detail.organizationLinked', [linkedOrganizationName]) }}
              </small>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label for="remarks" class="font-medium">{{ t('contractor.detail.remarks') }}</label>
            <Textarea
              id="remarks"
              name="remarks"
              rows="3"
              fluid
              @update:modelValue="(v) => (currentValues.remarks = v as string)"
            />
          </div>

          <Message size="small" severity="secondary" variant="simple">
            {{ t('accountSettings.userProfile.requiredFields') }}
          </Message>

          <div class="flex justify-end">
            <Button
              type="submit"
              :label="t('button.save')"
              icon="pi pi-save"
              :disabled="!isDirty || !!phoneError"
            />
          </div>
        </div>
      </Form>
    </template>
  </BaseCard>
</template>
