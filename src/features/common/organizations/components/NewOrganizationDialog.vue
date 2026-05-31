<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import PhoneInput from '@/components/common/PhoneInput.vue';
import { organizationService } from '@/services/OrganizationService';
import { useOrganizationStore } from '@/stores/OrganizationStore';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ 'update:visible': [value: boolean] }>();

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const organizationStore = useOrganizationStore();

const formKey = ref(0);
const submitting = ref(false);
const phoneValue = ref('');
const phoneRegex = /^\+[1-9]\d{4,14}$/;

const initialValues = reactive({
 name: '', email: '', trade: '' 
});

const phoneError = computed(() => {
  if (!phoneValue.value) return null;
  return phoneRegex.test(phoneValue.value) ? null : t('validation.phone');
});

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

async function onSubmit(event: FormSubmitEvent) {
  if (!event.valid || phoneError.value) return;
  submitting.value = true;
  try {
    const previousIds = new Set(organizationStore.userOrganizations.map(o => o.id));
    await organizationService.createOrganization({
      name: event.states.name?.value || undefined,
      phone: phoneValue.value || undefined,
      email: event.states.email?.value || undefined,
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
  Object.assign(initialValues, {
 name: '', email: '', trade: '' 
});
  phoneValue.value = '';
  formKey.value++;
  emit('update:visible', false);
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    :header="t('organization.newOrganization')"
    modal
    :style="{ width: '32rem' }"
    @update:visible="onHide"
  >
    <Form
      :key="formKey" v-slot="$form"
      :initialValues :resolver
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="org-name" class="font-medium">{{ t('organization.name') }}*</label>
          <InputText id="org-name" name="name" fluid :placeholder="t('organization.name')" />
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
          <InputText id="org-trade" name="trade" fluid :placeholder="t('organization.trade')" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-medium">{{ t('organization.phone') }}</label>
          <PhoneInput v-model="phoneValue" />
          <Message
            v-if="phoneError && phoneValue"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ phoneError }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="org-email" class="font-medium">{{ t('organization.email') }}</label>
          <InputText id="org-email" name="email" fluid :placeholder="t('organization.email')" />
          <Message
            v-if="$form.email?.invalid && $form.email?.touched"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.email.error?.message }}
          </Message>
        </div>

        <Message size="small" severity="secondary" variant="simple">
          {{ t('accountSettings.userProfile.requiredFields') }}
        </Message>

        <div class="flex justify-end gap-2">
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
  </Dialog>
</template>
