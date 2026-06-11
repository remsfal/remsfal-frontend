<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import PhoneInput from '@/components/common/PhoneInput.vue';
import { organizationService } from '@/services/OrganizationService';
import { useOrganizationStore } from '@/stores/OrganizationStore';

const props = defineProps<{ organizationId: string }>();

const { t } = useI18n();
const toast = useToast();
const organizationStore = useOrganizationStore();

const phoneRegex = /^\+[1-9]\d{4,14}$/;

const schema = z.object({
  name: z.string().trim().min(3, { message: t('organization.validation.nameRequired') }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {message: t('organization.validation.emailInvalid'),}),
  trade: z.string().trim().optional(),
});

const resolver = zodResolver(schema);

const serverValues = reactive({
  name: '', phone: '', email: '', trade: '' 
});
const currentValues = reactive({
  name: '', phone: '', email: '', trade: '' 
});
const initialValues = ref({
  name: '', email: '', trade: '' 
});
const formKey = ref(0);

const isDirty = computed(
  () =>
    currentValues.name !== serverValues.name ||
    currentValues.phone !== serverValues.phone ||
    currentValues.email !== serverValues.email ||
    currentValues.trade !== serverValues.trade,
);

const phoneError = computed(() => {
  const v = currentValues.phone;
  if (!v) return null;
  return phoneRegex.test(v) ? null : t('validation.phone');
});

onMounted(async () => {
  try {
    const org = await organizationService.getOrganization(props.organizationId);
    const loaded = {
      name: org.name ?? '',
      phone: org.phone ?? '',
      email: org.email ?? '',
      trade: org.trade ?? '',
    };
    Object.assign(serverValues, loaded);
    Object.assign(currentValues, loaded);
    initialValues.value = {
      name: loaded.name, email: loaded.email, trade: loaded.trade 
    };
    formKey.value++;
  } catch {
    // silently ignore load error — form stays empty
  }
});

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid || phoneError.value) return;
  const s = event.states;
  const payload = {
    name: s.name?.value || undefined,
    phone: currentValues.phone || undefined,
    email: s.email?.value || undefined,
    trade: s.trade?.value || undefined,
  };
  try {
    const updated = await organizationService.updateOrganization(props.organizationId, payload);
    const saved = {
      name: updated.name ?? '',
      phone: updated.phone ?? '',
      email: updated.email ?? '',
      trade: updated.trade ?? '',
    };
    Object.assign(serverValues, saved);
    Object.assign(currentValues, saved);
    initialValues.value = {
      name: saved.name, email: saved.email, trade: saved.trade 
    };
    formKey.value++;
    organizationStore.setOrganization(updated);
    toast.add({
      severity: 'success',
      summary: t('organization.saveSuccess'),
      life: 3000,
    });
  } catch {
    toast.add({
      severity: 'error',
      summary: t('organization.saveError'),
      life: 4000,
    });
  }
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('organization.settings.title') }}
    </template>
    <template #content>
      <Form
        :key="formKey" v-slot="$form"
        :initialValues :resolver
        @submit="onSubmit"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label for="org-name" class="font-medium">{{ t('organization.name') }}*</label>
            <InputText
              id="org-name"
              name="name"
              fluid
              @update:modelValue="(v) => (currentValues.name = v as string)"
            />
            <Message
              v-if="$form.name?.invalid && $form.name?.touched"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.name.error?.message }}
            </Message>
          </div>

          <div class="flex flex-col gap-1">
            <label for="org-trade" class="font-medium">{{ t('organization.trade') }}</label>
            <InputText
              id="org-trade"
              name="trade"
              fluid
              @update:modelValue="(v) => (currentValues.trade = v as string)"
            />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1">
              <label for="org-phone" class="font-medium">{{ t('organization.phone') }}</label>
              <PhoneInput
                :modelValue="currentValues.phone"
                inputId="org-phone"
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
              <label for="org-email" class="font-medium">{{ t('organization.email') }}</label>
              <InputText
                id="org-email"
                name="email"
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
