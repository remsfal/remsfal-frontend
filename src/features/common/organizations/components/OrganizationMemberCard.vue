<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import BaseCard from '@/components/common/BaseCard.vue';
import EmployeeRoleSelect from '@/features/common/organizations/components/EmployeeRoleSelect.vue';
import NewOrganizationMemberButton from '@/features/common/organizations/components/NewOrganizationMemberButton.vue';
import { type OrganizationEmployeeJson, organizationService } from '@/services/OrganizationService';

const props = defineProps<{ organizationId: string }>();

const { t } = useI18n();
const toast = useToast();

const employees = ref<OrganizationEmployeeJson[]>([]);

const fetchEmployees = async () => {
  await organizationService
    .getEmployees(props.organizationId)
    .then((list) => {
      employees.value = list.employees;
    })
    .catch((error) => {
      console.error('Failed to fetch employees', error);
    });
};

const updateEmployeeRole = async (employee: OrganizationEmployeeJson) => {
  try {
    if (!employee.id) {
      console.error('Employee ID is undefined, cannot update role');
      return;
    }

    await organizationService.updateEmployeeRole(props.organizationId, employee.id, employee.employeeRole);
    toast.add({
      severity: 'success',
      summary: t('organization.members.updateRoleSuccess'),
      detail: t('organization.members.updateRoleDetail', [employee.email]),
      life: 3000,
    });
  } catch (error) {
    const err = error as { response?: { data: OrganizationEmployeeJson }; message: string };
    console.error('Failed to update employee role:', err.response?.data || err.message);
  }
};

const removeEmployee = async (employeeId: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(employeeId)) {
    console.error('Invalid employeeId format:', employeeId);
    return;
  }

  try {
    await organizationService.removeEmployee(props.organizationId, employeeId);
    await fetchEmployees();
  } catch (error) {
    const err = error as { response?: { data: unknown }; message: string };
    console.error('Failed to remove employee:', err.response?.data || err.message);
  }
};

onMounted(() => {
  fetchEmployees();
});

function onNewMember(email: string) {
  fetchEmployees();
  toast.add({
    severity: 'success',
    summary: t('organization.members.addSuccess'),
    detail: t('organization.members.addSuccessDetail', [email]),
    life: 3000,
  });
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('organization.members.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <DataTable :value="employees">
          <Column :header="t('organization.members.columnName')">
            <template #body="slotProps">
              <span :class="{ 'text-gray-400': slotProps.data.active === false }">
                {{ slotProps.data.name || slotProps.data.email }}
                <span v-if="slotProps.data.active === false"> ({{ t('managerSettings.memberships.status.inactive') }})</span>
              </span>
            </template>
          </Column>
          <Column field="email" :header="t('organization.members.columnEmail')" />
          <Column :header="t('organization.members.columnRole')">
            <template #body="slotProps">
              <EmployeeRoleSelect
                v-model="slotProps.data.employeeRole"
                @change="updateEmployeeRole(slotProps.data)"
              />
            </template>
          </Column>
          <Column :header="t('organization.members.columnOptions')">
            <template #body="slotProps">
              <Button
                :label="t('button.delete')"
                severity="danger"
                @click="removeEmployee(slotProps.data.id ?? '')"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="flex justify-end basis-auto mt-6">
        <NewOrganizationMemberButton :organizationId="organizationId" @newMember="onNewMember" />
      </div>
    </template>
  </BaseCard>
</template>
