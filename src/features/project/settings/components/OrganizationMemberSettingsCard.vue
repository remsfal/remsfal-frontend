<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import NewOrganizationMemberButton from '@/features/project/settings/components/NewOrganizationMemberButton.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { computed, onMounted, ref } from 'vue';
import { type OrganizationMemberJson, organizationMemberService } from '@/services/OrganizationMemberService';
import type { ProjectMemberJson } from '@/services/ProjectMemberService';
import ProjectMemberRoleSelect from '@/features/project/settings/components/ProjectMemberRoleSelect.vue';

type OrganizationRow = { type: 'organization'; key: string; organization: OrganizationMemberJson };
type MemberRow = { type: 'member'; key: string; member: ProjectMemberJson };

const props = defineProps<{
  projectId: string;
}>();

const { t } = useI18n();
const toast = useToast();

const organizations = ref<OrganizationMemberJson[]>([]);

const tableRows = computed<(OrganizationRow | MemberRow)[]>(() =>
  organizations.value.flatMap((organization) => [
    {
      type: 'organization', key: `org-${organization.organizationId}`, organization,
    },
    ...(organization.members ?? []).map((member, index): MemberRow => ({
      type: 'member',
      key: `org-${organization.organizationId}-member-${member.id ?? index}`,
      member,
    })),
  ]),
);

const fetchOrganizations = async () => {
  await organizationMemberService
    .getOrganizations(props.projectId)
    .then((list) => {
      organizations.value = list.organizations ?? [];
    })
    .catch((error) => {
      console.error('Failed to fetch organizations', error);
    });
};

const updateOrganizationRole = async (org: OrganizationMemberJson) => {
  try {
    if (!org.organizationId) {
      console.error('Organization ID is undefined, cannot update role');
      return;
    }

    await organizationMemberService.updateOrganizationRole(props.projectId, org.organizationId, { role: org.role });
    toast.add({
      severity: 'success',
      summary: t('projectSettings.updateOrganizationRoleSuccess'),
      detail: t('projectSettings.updateRoleDetail', [org.organizationName]),
      life: 3000,
    });
  } catch (error) {
    const err = error as { response?: { data: OrganizationMemberJson }; message: string };
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
    await organizationMemberService.removeOrganization(props.projectId, organizationId);
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
      {{ t('projectSettings.organizationMemberTable.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <DataTable :value="tableRows" dataKey="key">
          <Column :header="t('projectSettings.organizationMemberTable.columnName')">
            <template #body="slotProps">
              <span v-if="slotProps.data.type === 'organization'">
                {{ slotProps.data.organization.organizationName }}
              </span>
              <span
                v-else
                class="pl-4"
                :class="{ 'text-gray-400': slotProps.data.member.active === false }"
              >
                {{ slotProps.data.member.name || slotProps.data.member.email }}
                <span v-if="slotProps.data.member.active === false">
                  ({{ t('managerSettings.employments.status.inactive') }})
                </span>
              </span>
            </template>
          </Column>
          <Column :header="t('projectSettings.projectMemberTable.columnRole')">
            <template #body="slotProps">
              <ProjectMemberRoleSelect
                v-if="slotProps.data.type === 'organization'"
                v-model="slotProps.data.organization.role"
                @change="updateOrganizationRole(slotProps.data.organization)"
              />
              <span v-else>{{ t(`roles.${slotProps.data.member.role.toLowerCase()}`) }}</span>
            </template>
          </Column>
          <Column :header="t('projectSettings.projectMemberTable.columnOptions')">
            <template #body="slotProps">
              <Button
                v-if="slotProps.data.type === 'organization'"
                :label="t('button.delete')"
                class="deactivate-btn"
                severity="danger"
                @click="removeOrganization(slotProps.data.organization.organizationId ?? '')"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="flex justify-end basis-auto mt-6">
        <NewOrganizationMemberButton :projectId="projectId" @newOrganization="onNewOrganization" />
      </div>
    </template>
  </BaseCard>
</template>
