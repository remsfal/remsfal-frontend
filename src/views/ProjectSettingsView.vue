<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { projectMemberService, type Member } from '@/services/ProjectMemberService';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const props = defineProps<{
  projectId: string; // required
}>();

const members = ref<Member[]>([]);
const newMemberEmail = ref('');

const fetchMembers = async () => {
  if (!props.projectId) return; // guard
  try {
    members.value = (await projectMemberService.getMembers(props.projectId)).members;
  } catch (error) {
    console.error('Error fetching members:', error);
  }
};

const addMember = async () => {
  if (!props.projectId || !newMemberEmail.value) return; // guard
  try {
    const addedMember = await projectMemberService.addMember(props.projectId, {
      email: newMemberEmail.value,
      role: 'COLLABORATOR',
    });
    members.value.push(addedMember);
    newMemberEmail.value = '';
  } catch (error) {
    console.error('Error adding member:', error);
  }
};

const updateRole = async (member: Member, role: typeof member.role) => {
  if (!props.projectId || !member.id) return; // guard
  try {
    const updated = await projectMemberService.updateMemberRole(props.projectId, member.id, { role });
    const index = members.value.findIndex((m) => m.id === member.id);
    if (index >= 0) members.value[index] = updated;
  } catch (error) {
    console.error('Error updating member role:', error);
  }
};

const removeMember = async (member: Member) => {
  if (!props.projectId || !member.id) return; // guard
  try {
    await projectMemberService.removeMember(props.projectId, member.id);
    members.value = members.value.filter((m) => m.id !== member.id);
  } catch (error) {
    console.error('Error removing member:', error);
  }
};

onMounted(fetchMembers);
</script>

<template>
  <Card>
    <template #title>Project Members</template>
    <div class="mb-2">
      <InputText v-model="newMemberEmail" placeholder="New member email" />
      <Button label="Add" @click="addMember" />
    </div>
    <ul>
      <li v-for="member in members" :key="member.id">
        {{ member.email }} - {{ member.role }}
        <Button text icon="pi pi-pencil" @click="updateRole(member, 'MANAGER')" />
        <Button text icon="pi pi-trash" @click="removeMember(member)" />
      </li>
    </ul>
  </Card>
</template>