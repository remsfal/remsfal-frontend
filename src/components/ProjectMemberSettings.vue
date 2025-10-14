<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import NewProjectMemberButton from '@/components/NewProjectMemberButton.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { onMounted, ref } from 'vue';
import { type ProjectMember, projectMemberService } from '@/services/ProjectMemberService';
import ProjectMemberRoleSelect from '@/components/ProjectMemberRoleSelect.vue';

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const members = ref<ProjectMember[]>([]);

const fetchMembers = async () => {
  await projectMemberService
    .getMembers(props.projectId)
    .then((list) => {
      console.log('Fetched members:', list);
      // TEMP FIX: cast to expected type until backend spec is fixed
      members.value = (list as { members: ProjectMember[] }).members;
    })
    .catch((error) => {
      console.error('Failed to fetch members', error);
    });
};

const updateMemberRole = async (member: ProjectMember) => {
  console.log('Member object passed to updateMemberRole:', member);
  try {
    // TEMP FIX: pass memberId and a body with role
    if (!member.id) {
      console.error('Member ID is undefined, cannot update role');
      return;
    }

    await projectMemberService.updateMemberRole(props.projectId, member.id, {
      role: member.role,
    });
    toast.add({
      severity: 'success',
      summary: 'Rolle aktualisiert',
      detail: `Die Rolle von ${member.name} wurde erfolgreich geändert.`,
      life: 3000,
    });
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    console.error('Failed to update member role:', err.response?.data || err.message);
  }
};

const removeMember = async (memberId: string) => {
  console.log('Removing member with projectId:', props.projectId, 'memberId:', memberId);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(memberId)) {
    console.error('Invalid memberId format:', memberId);
    return;
  }

  try {
    await projectMemberService.removeMember(props.projectId, memberId);
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

function onNewMember(email: string) {
  fetchMembers();
  toast.add({
    severity: 'success',
    summary: 'Neues Mitglied hinzugefügt',
    detail: `Ein Neues Mitglied mit der E-Mail Adresse ${email} wurde erfolgreich hinzugefügt`,
    life: 3000,
  });
}
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <div class="font-semibold text-xl">{{ t('projectSettings.projectMemberTable.title') }}</div>
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <DataTable :value="members">
          <Column field="email" header="Email"></Column>
          <Column header="Rolle">
            <template #body="slotProps">
              <ProjectMemberRoleSelect v-model="slotProps.data.role" @change="updateMemberRole(slotProps.data)" />
            </template>
          </Column>
          <Column header="Optionen">
            <template #body="slotProps">
              <Button
                label="Löschen"
                class="deactivate-btn"
                severity="danger"
                @click="removeMember(slotProps.data.id ?? '')"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="flex justify-end basis-auto mt-6">
        <NewProjectMemberButton :projectId="projectId" @newMember="onNewMember" />
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
