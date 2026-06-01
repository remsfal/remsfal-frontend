<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import Message from 'primevue/message';
import { Form } from '@primevue/forms';
import type { FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import ProjectMemberRoleSelect from '@/components/projectMembership/ProjectMemberRoleSelect.vue';
import { type MemberRole } from '@/services/ProjectMemberService';
import { projectOrganizationService } from '@/services/ProjectOrganizationService';

const props = defineProps<{ projectId: string }>();
const emit = defineEmits<(e: 'newOrganization', organizationName: string) => void>();

const { t } = useI18n();
const organizationStore = useOrganizationStore();

const visible = ref(false);

const validationSchema = z.object({
  organizationId: z
    .string()
    .min(1, { message: t('projectSettings.newProjectOrganizationButton.invalidOrganization') }),
  role: z
    .string()
    .min(1, { message: t('projectSettings.newProjectOrganizationButton.invalidRole') }),
});

const resolver = zodResolver(validationSchema);

const initialValues = ref({ organizationId: '', role: '' });

function resetForm() {
  initialValues.value = { organizationId: '', role: '' };
}

const onSubmit = (event: FormSubmitEvent) => {
  const formState = event.states;
  const organizationId = formState.organizationId?.value || '';
  const role = formState.role?.value || '';

  if (!event.valid || !organizationId || !role) {
    return;
  }

  addOrganization(organizationId, role as MemberRole);
};

const addOrganization = async (organizationId: string, role: MemberRole) => {
  visible.value = false;

  const org = organizationStore.userOrganizations.find((o) => o.id === organizationId);
  const organizationName = org?.name ?? organizationId;

  try {
    await projectOrganizationService.addOrganization(props.projectId, { organizationId, role });
    emit('newOrganization', organizationName);
    resetForm();
  } catch (error) {
    const err = error as { response?: { data: unknown }; message: string };
    console.error('Failed to add organization:', err.response?.data || err.message);
  }
};

onMounted(async () => {
  if (!organizationStore.initialized) {
    await organizationStore.fetchUserOrganization();
  }
});
</script>

<template>
  <Button
    :label="t('projectSettings.newProjectOrganizationButton.label')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    modal
    :header="t('projectSettings.newProjectOrganizationButton.label')"
    :style="{ width: '35rem' }"
    @hide="resetForm"
  >
    <Form v-slot="$form" :initialValues :resolver @submit="onSubmit">
      <div class="flex flex-col gap-1 mb-6">
        <div class="flex items-center gap-6">
          <label for="organizationId" class="font-semibold w-24">{{
            t('projectSettings.newProjectOrganizationButton.organizationLabel')
          }}</label>
          <Select
            id="organizationId"
            name="organizationId"
            :options="organizationStore.userOrganizations"
            optionLabel="name"
            optionValue="id"
            :placeholder="t('projectSettings.newProjectOrganizationButton.organizationPlaceholder')"
            class="flex-auto"
            :class="{ 'p-invalid': $form.organizationId?.invalid && $form.organizationId?.touched }"
            fluid
          />
        </div>
        <Message
          v-if="$form.organizationId?.invalid && $form.organizationId?.touched"
          severity="error"
          size="small"
          variant="simple"
          class="ml-28"
        >
          {{ $form.organizationId.error.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-1 mb-2">
        <div class="flex items-center gap-6">
          <label for="role" class="font-semibold w-24">{{
            t('projectSettings.newProjectOrganizationButton.roleLabel')
          }}</label>
          <ProjectMemberRoleSelect
            name="role"
            :invalid="$form.role?.invalid && $form.role?.touched"
            class="w-full"
          />
        </div>
        <Message
          v-if="$form.role?.invalid && $form.role?.touched"
          severity="error"
          size="small"
          variant="simple"
          class="ml-28"
        >
          {{ $form.role.error.message }}
        </Message>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <Button type="button" :label="t('button.cancel')" severity="secondary" @click="visible = false" />
        <Button
          type="submit"
          :label="t('button.add')"
          :disabled="!$form.organizationId?.valid || !$form.role?.valid || (!$form.organizationId?.dirty && !$form.role?.dirty)"
        />
      </div>
    </Form>
  </Dialog>
</template>
