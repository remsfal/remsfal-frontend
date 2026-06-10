<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Message from 'primevue/message';
import PhoneInput from '@/components/common/PhoneInput.vue';
import BaseDialog from '@/components/common/BaseDialog.vue';
import DialogFormField from '@/components/common/DialogFormField.vue';
import { organizationService } from '@/services/OrganizationService';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import { useUserSessionStore } from '@/stores/UserSession';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ 'update:visible': [value: boolean] }>();

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const organizationStore = useOrganizationStore();
const sessionStore = useUserSessionStore();

const formKey = ref(0);
const submitting = ref(false);
const phoneValue = ref('');
const phoneRegex = /^\+[1-9]\d{4,14}$/;

const emailOptions = computed<string[]>(() => {
  const primary = sessionStore.user?.email;
  const additional = sessionStore.user?.additionalEmails ?? [];
  return [...new Set([primary, ...additional].filter(Boolean))] as string[];
});

const emailValue = ref(sessionStore.user?.email ?? '');

const initialValues = reactive({
  name: '', trade: '',
});

const phoneError = computed(() => {
  if (!phoneValue.value) return null;
  return phoneRegex.test(phoneValue.value) ? null : t('validation.phone');
});

const schema = z.object({
  name: z.string().trim().min(3, { message: t('organization.validation.nameRequired') }),
  trade: z.string().trim().optional(),
});

const resolver = zodResolver(schema);

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid || phoneError.value) return;
  submitting.value = true;
  try {
    const previousIds = new Set(organizationStore.userOrganizations.map(o => o.id));
    await organizationService.createOrganization({
      name: event.states.name?.value || undefined,
      phone: phoneValue.value || undefined,
      email: emailValue.value || undefined,
      trade: event.states.trade?.value || undefined,
    });
    await organizationStore.fetchUserOrganization();
    toast.add({
      severity: 'success',
      summary: t('organization.createSuccess'),
      life: 3000,
    });
    emit('update:visible', false);
    const newOrg = organizationStore.userOrganizations.find(o => !previousIds.has(o.id));
    const orgId = newOrg?.id;
    if (orgId) {
      router.push(`/manager/organizations/${orgId}`);
    } else {
      router.push('/manager/organizations/new');
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('organization.createError'),
      life: 4000,
    });
  } finally {
    submitting.value = false;
  }
}

function onHide() {
  Object.assign(initialValues, { name: '', trade: '' });
  phoneValue.value = '';
  emailValue.value = sessionStore.user?.email ?? '';
  formKey.value++;
  emit('update:visible', false);
}
</script>

<template>
  <BaseDialog
    :visible="props.visible"
    :header="t('organization.newOrganization')"
    @update:visible="onHide"
  >
    <Form
      :key="formKey" v-slot="$form"
      :initialValues :resolver
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-6">
        <DialogFormField
          inputId="org-name"
          :label="t('organization.name')"
          required
          :errorMessage="$form.name?.invalid && $form.name?.touched ? $form.name.error?.message : undefined"
        >
          <InputText id="org-name" name="name" fluid :placeholder="t('organization.name')" />
        </DialogFormField>

        <DialogFormField inputId="org-trade" :label="t('organization.trade')">
          <InputText id="org-trade" name="trade" fluid :placeholder="t('organization.trade')" />
        </DialogFormField>

        <DialogFormField
          inputId="org-phone"
          :label="t('organization.phone')"
          :errorMessage="phoneError && phoneValue ? phoneError : undefined"
        >
          <PhoneInput v-model="phoneValue" inputId="org-phone" />
        </DialogFormField>

        <DialogFormField inputId="org-email" :label="t('organization.email')">
          <Select v-model="emailValue" :options="emailOptions" inputId="org-email" fluid />
        </DialogFormField>

        <Message severity="secondary" size="small" variant="simple">
          {{ t('accountSettings.userProfile.requiredFields') }}
        </Message>

        <div class="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            :label="t('button.cancel')"
            severity="secondary"
            @click="onHide"
          />
          <Button
            type="submit"
            :label="t('organization.createButton')"
            icon="pi pi-plus"
            :loading="submitting"
          />
        </div>
      </div>
    </Form>
  </BaseDialog>
</template>
