<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import type { ProjectMember } from '../services/ProjectMemberService';
import ProjectMemberService from '../services/ProjectMemberService';
import { useRoute } from 'vue-router';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps<{
  projectId: string;
}>();

const route = useRoute();

let projectId: string = props.projectId;
if (!props.projectId) {
  projectId = route.params.projectId as string;
}

const newMemberEmail = ref('');
const newMemberRole = ref('');
const members = ref<ProjectMember[]>([]);
const roles = [
  { label: 'Verwalter', value: 'MANAGER' },
  { label: 'Mieter', value: 'TENANCY' }, //liquibase changeset anpassen
  { label: 'Eigentümer', value: 'PROPRIETOR' },
  { label: 'Vermieter', value: 'LESSOR' },
  { label: 'Hausmeister', value: 'CARETAKER' },
  { label: 'Auftragnehmer/Berater', value: 'CONTRACTOR' },
]; //liquibase changeset anpassen
const error = ref<string | null>(null);

const fetchMembers = async () => {
  try {
    const fetchedMembers = await ProjectMemberService.getMembers(projectId);
    console.log('Fetched members:', fetchedMembers);
    members.value = fetchedMembers;
  } catch (err) {
    console.error('Failed to fetch members', err);
  }
};

const addMember = async () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!newMemberEmail.value || !emailRegex.test(newMemberEmail.value)) {
    console.error('Invalid email format.');
    return;
  }
  const member: ProjectMember = { email: newMemberEmail.value, role: newMemberRole.value };
  try {
    console.log('Adding member with email:', newMemberEmail.value, 'role:', newMemberRole.value);
    await ProjectMemberService.addMember(projectId, member);
    newMemberEmail.value = '';
    newMemberRole.value = '';
    await fetchMembers();
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    console.error('Failed to add member:', err.response?.data || err.message);
  }
};

const updateMemberRole = async (member: ProjectMember) => {
  console.log('Member object passed to updateMemberRole:', member);
  try {
    await ProjectMemberService.updateMemberRole(projectId, member);
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    console.error('Failed to update member role:', err.response?.data || err.message);
  }
};

const removeMember = async (memberId: string) => {
  console.log('Removing member with projectId:', projectId, 'memberId:', memberId);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(memberId)) {
    console.error('Invalid memberId format:', memberId);
    return;
  }

  try {
    await ProjectMemberService.removeMember(projectId, memberId);
    await fetchMembers();
    console.log('Member removed successfully');
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    console.error('Failed to remove member:', err.response?.data || err.message);
  }
};

onMounted(() => {
  fetchMembers();
});
</script>

<template>
  <h1>Mitglieder einer Liegenschaft</h1>

  <h3>Mitglied hinzufügen</h3>

  <div v-if="error" class="error">{{ error }}</div>

  <div class="project-settings">
    <div>
      <InputText
        v-model="newMemberEmail"
        type="email"
        placeholder="E-Mail des neuen Mitglieds"
        class="p-inputtext"
      />
      <Dropdown
        v-model="newMemberRole"
        :options="roles"
        optionLabel="label"
        optionValue="value"
        placeholder="Rolle auswählen"
      />
      <Button label="Erstellen" class="create-btn" @click="addMember" />
    </div>

    <h3>Mitgliederliste</h3>

    <DataTable :value="members">
      <Column field="email" header="Email"></Column>
      <Column header="Rolle">
        <template #body="slotProps">
          <Dropdown
            v-model="slotProps.data.role"
            :options="roles"
            optionLabel="label"
            optionValue="value"
            @change="updateMemberRole(slotProps.data)"
          />
        </template>
      </Column>
      <Column header="Optionen">
        <template #body="slotProps">
          <Button
            label="Deaktivieren"
            class="deactivate-btn"
            severity="danger"
            @click="removeMember(slotProps.data.id ?? '')"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.project-settings {
  padding: 20px;
}
</style>
