<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import NewProjectMemberButton from '@/features/project/settings/components/NewProjectMemberButton.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { onMounted, ref } from 'vue';
import { type ProjectMemberJson, projectMemberService } from '@/services/ProjectMemberService';
import ProjectMemberRoleSelect from '@/features/project/settings/components/ProjectMemberRoleSelect.vue';

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const members = ref<ProjectMemberJson[]>([]);

const fetchMembers = async () => {
  await projectMemberService
    .getMembers(props.projectId)
    .then((list) => {
      members.value = (list as { members: ProjectMemberJson[] }).members;
    })
    .catch((error) => {
      console.error('Failed to fetch members', error);
    });
};

const updateMemberRole = async (member: ProjectMemberJson) => {
  try {
    if (!member.id) {
      console.error('Member ID is undefined, cannot update role');
      return;
    }

    await projectMemberService.updateMemberRole(props.projectId, member.id, { role: member.role });
    toast.add({
      severity: 'success',
      summary: t('projectSettings.updateRoleSuccess'),
      detail: t('projectSettings.updateRoleDetail', [member.name]),
      life: 3000,
    });
  } catch (error) {
    const err = error as { response?: { data: ProjectMemberJson }; message: string };
    console.error('Failed to update member role:', err.response?.data || err.message);
  }
};

const removeMember = async (memberId: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(memberId)) {
    console.error('Invalid memberId format:', memberId);
    return;
  }

  try {
    await projectMemberService.removeMember(props.projectId, memberId);
    await fetchMembers();
  } catch (error) {
    const err = error as { response?: { data: unknown }; message: string };
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
    summary: t('projectSettings.newMemberAdded'),
    detail: t('projectSettings.newMemberAddedDetail', [email]),
    life: 3000,
  });
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('projectSettings.projectMemberTable.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <DataTable :value="members">
          <Column :header="t('projectSettings.projectMemberTable.columnName')">
            <template #body="slotProps">
              <span :class="{ 'text-gray-400': slotProps.data.active === false }">
                {{ slotProps.data.name || slotProps.data.email }}
                <span v-if="slotProps.data.active === false"> ({{ t('managerSettings.employments.status.inactive') }})</span>
              </span>
            </template>
          </Column>
          <Column field="email" :header="t('projectSettings.projectMemberTable.columnEmail')" />
          <Column :header="t('projectSettings.projectMemberTable.columnRole')">
            <template #body="slotProps">
              <ProjectMemberRoleSelect v-model="slotProps.data.role" @change="updateMemberRole(slotProps.data)" />
            </template>
          </Column>
          <Column :header="t('projectSettings.projectMemberTable.columnOptions')">
            <template #body="slotProps">
              <Button
                :label="t('button.delete')"
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
  </BaseCard>
</template>
