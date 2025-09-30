<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { useI18n } from 'vue-i18n';
import type { Member, MemberRole } from '@/services/ProjectMemberService';
import { memberRoles, projectMemberService } from '@/services/ProjectMemberService';

const props = defineProps<{
  projectId: string;
}>();
const emit = defineEmits<{
  (e: 'newMember', email: string): void;
}>();

const { t } = useI18n();

const visible = ref<boolean>(false);
const newMemberEmail = ref<string | null>(null);
const newMemberRole = ref<MemberRole | null>(null);

const isEmailInvalid = ref(false);
const emailErrorMessage = ref('');
const isRoleInvalid = ref(false);
const roleErrorMessage = ref('');

//  Reset form state
function resetForm() {
  newMemberEmail.value = null;
  newMemberRole.value = null;
  isEmailInvalid.value = false;
  emailErrorMessage.value = '';
  isRoleInvalid.value = false;
  roleErrorMessage.value = '';
}

const addMember = async () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!newMemberEmail.value || !emailRegex.test(newMemberEmail.value)) {
    isEmailInvalid.value = true;
    emailErrorMessage.value = 'Bitte eine gültige E-Mail-Adresse eingeben';
    return;
  } else {
    isEmailInvalid.value = false;
    emailErrorMessage.value = '';
  }

  if (!newMemberRole.value) {
    isRoleInvalid.value = true;
    roleErrorMessage.value = 'Bitte eine gültige Rolle auswählen';
    return;
  } else {
    isRoleInvalid.value = false;
    roleErrorMessage.value = '';
  }

  visible.value = false;

  const member: Member = {
    email: newMemberEmail.value,
    role: newMemberRole.value,
  };

  try {
    console.log('Adding member with email:', newMemberEmail.value, 'role:', newMemberRole.value);
    await projectMemberService.addMember(props.projectId, member);
    emit('newMember', newMemberEmail.value);
    resetForm(); // clear after successful add
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    console.error('Failed to add member:', err.response?.data || err.message);
  }
};
</script>

<template>
  <Button
    :label="t('projectSettings.newProjectMemberButton.label')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    modal
    :header="t('projectSettings.newProjectMemberButton.label')"
    :style="{ width: '35rem' }"
    @hide="resetForm"
  >
    <div class="flex flex-col gap-1 mb-6">
      <div class="flex items-center gap-6">
        <label for="email" class="font-semibold w-24">E-Mail Adresse</label>
        <InputText
          id="email"
          v-model="newMemberEmail"
          type="email"
          placeholder="E-Mail Adresse des neuen Mitglieds"
          class="flex-auto"
          autocomplete="off"
          :invalid="isEmailInvalid"
        />
      </div>
      <small v-if="isEmailInvalid" class="text-red-500 ml-28">{{ emailErrorMessage }}</small>
    </div>

    <div class="flex items-center gap-6 mb-2">
      <label for="role" class="font-semibold w-24">Mitgliedsrolle</label>
      <Select
        v-model="newMemberRole"
        inputId="role"
        :options="[...memberRoles]" 
        optionValue="value"
        class="w-full"
        :class="{ 'p-invalid': isRoleInvalid }"
      />
    </div>
    <small v-if="isRoleInvalid" class="text-red-500 ml-28">{{ roleErrorMessage }}</small>

    <div class="flex justify-end gap-2 mt-6">
      <Button
        type="button"
        :label="t('button.cancel')"
        severity="secondary"
        @click="visible = false"
      />
      <Button type="button" :label="t('button.add')" @click="addMember" />
    </div>
  </Dialog>
</template>

<style scoped></style>
