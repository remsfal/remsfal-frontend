<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { useI18n } from 'vue-i18n';
import { type Member, memberRoles, projectMemberService } from '@/services/ProjectMemberService';

const props = defineProps<{
  projectId: string;
}>();
const emit = defineEmits<{
  (e: 'newMember', email: string): void;
}>();

const { t } = useI18n();

const visible = ref<boolean>(false);
const newMemberEmail = ref<string | null>(null);
const newMemberRole = ref<string | null>(null);
const emailValid = ref<boolean>(true);

const addMember = async () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  emailValid.value = !!newMemberEmail.value && emailRegex.test(newMemberEmail.value);
  if (!emailValid.value) {
    return;
  }
  visible.value = false;
  const member: Member = { email: newMemberEmail.value!, role: newMemberRole.value! };
  try {
    const result = await projectMemberService.addMember(props.projectId, member);
    emit('newMember', newMemberEmail.value!);
  } catch (error) {
    console.error('Failed to add member', error);
  }
};
</script>

<template>
  <Button label="Mitglied hinzufügen" icon="pi pi-user-plus" @click="visible = true" />
  <Dialog v-model:visible="visible" modal header="Mitglied hinzufügen" :style="{ width: '30vw' }">
    <div class="flex flex-col gap-3">
      <label for="email">E-Mail Adresse</label>
      <InputText
          id="email"
          v-model="newMemberEmail"
          :class="[{ 'p-invalid border-red-500': !emailValid }, 'w-full']"
          placeholder="name@beispielmail.de"
      />
      <small v-if="!emailValid" class="text-red-500">Bitte eine gültige E-Mail-Adresse eingeben.</small>

      <label for="role">Mitgliedsrolle</label>
      <Select id="role" v-model="newMemberRole" :options="memberRoles" optionLabel="label" class="w-full" />
    </div>

    <template #footer>
      <Button label="Abbrechen" icon="pi pi-times" severity="secondary" @click="visible = false" />
      <Button label="Hinzufügen" icon="pi pi-check" @click="addMember" />
    </template>
  </Dialog>
</template>

<style scoped>
.p-invalid {
  border-color: red !important;
  box-shadow: 0 0 0 0.2rem rgba(255, 0, 0, 0.25);
}
</style>
