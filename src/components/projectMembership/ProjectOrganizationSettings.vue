<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import NewProjectOrganizationButton from '@/components/projectMembership/NewProjectOrganizationButton.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { onMounted, ref } from 'vue';
import { type ProjectOrganizationJson, projectOrganizationService } from '@/services/ProjectOrganizationService';
import ProjectMemberRoleSelect from '@/components/projectMembership/ProjectMemberRoleSelect.vue';

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const organizations = ref<ProjectOrganizationJson[]>([]);

const fetchOrganizations = async () => {
  await projectOrganizationService
    .getOrganizations(props.projectId)
    .then((list) => {
      organizations.value = list.organizations ?? [];
    })
    .catch((error) => {
      console.error('Failed to fetch organizations', error);
    });
};

const updateOrganizationRole = async (org: ProjectOrganizationJson) => {
  try {
    if (!org.organizationId) {
      console.error('Organization ID is undefined, cannot update role');
      return;
    }

    await projectOrganizationService.updateOrganizationRole(props.projectId, org.organizationId, { role: org.role });
    toast.add({
      severity: 'success',
      summary: t('projectSettings.updateOrganizationRoleSuccess'),
      detail: t('projectSettings.updateRoleDetail', [org.organizationName]),
      life: 3000,
    });
  } catch (error) {
    const err = error as { response?: { data: ProjectOrganizationJson }; message: string };
    console.error('Failed to update organization role:', err.response?.data || err.message);
  }
};

const removeOrganization = async (organizationId: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(organizationId)) {
    console.error('Invalid organizationId format:', organizationId);
    return;
  }

  try {
    await projectOrganizationService.removeOrganization(props.projectId, organizationId);
    await fetchOrganizations();
  } catch (error) {
    const err = error as { response?: { data: unknown }; message: string };
    console.error('Failed to remove organization:', err.response?.data || err.message);
  }
};

onMounted(() => {
  fetchOrganizations();
});

function onNewOrganization(organizationName: string) {
  fetchOrganizations();
  toast.add({
    severity: 'success',
    summary: t('projectSettings.newOrganizationAdded'),
    detail: t('projectSettings.newOrganizationAddedDetail', [organizationName]),
    life: 3000,
  });
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('projectSettings.projectOrganizationTable.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <DataTable :value="organizations">
          <Column field="organizationName" :header="t('projectSettings.projectOrganizationTable.columnName')" />
          <Column :header="t('projectSettings.projectMemberTable.columnRole')">
            <template #body="slotProps">
              <ProjectMemberRoleSelect v-model="slotProps.data.role" @change="updateOrganizationRole(slotProps.data)" />
            </template>
          </Column>
          <Column :header="t('projectSettings.projectMemberTable.columnOptions')">
            <template #body="slotProps">
              <Button
                :label="t('button.delete')"
                class="deactivate-btn"
                severity="danger"
                @click="removeOrganization(slotProps.data.organizationId ?? '')"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="flex justify-end basis-auto mt-6">
        <NewProjectOrganizationButton :projectId="projectId" @newOrganization="onNewOrganization" />
      </div>
    </template>
  </BaseCard>
</template>

<style scoped></style>
