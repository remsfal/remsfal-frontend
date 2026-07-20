<script setup lang="ts">
import type { components } from '@/services/api/platform-schema';
import BaseCard from '@/components/common/BaseCard.vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

type TenantJson = components['schemas']['TenantJson'];

const props = defineProps<{
  tenants: TenantJson[];
  isDeleteButtonEnabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'onChange', tenants: TenantJson[]): void;
}>();

const { t } = useI18n();
const localTenants = ref<TenantJson[]>([]);
const removeListVisible = ref(false);

watch(
  () => props.tenants,
  (newVal) => {
    localTenants.value = newVal?.map(tenant => ({ ...tenant }));
  },
  { immediate: true, deep: true },
);

const fullName = (tenant: TenantJson) => {
  const name = `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim();
  return name || t('common.notSet');
};

const updateTenantField = (index: number, field: 'firstName' | 'lastName' | 'email', value: string) => {
  const updatedTenants = [...localTenants.value];
  updatedTenants[index] = {
    ...updatedTenants[index],
    [field]: value,
  };
  localTenants.value = updatedTenants;
  emit('onChange', updatedTenants);
};

const addNewRow = () => {
  const newRow: TenantJson = {
    firstName: '',
    lastName: '',
    email: '',
  };
  const updatedTenants = [...localTenants.value, newRow];
  localTenants.value = updatedTenants;
  emit('onChange', updatedTenants);
};

const deleteRow = (index: number) => {
  const updatedTenants = localTenants.value.filter((_, tenantIndex) => tenantIndex !== index);
  localTenants.value = updatedTenants;
  emit('onChange', updatedTenants);
};

const hasTenants = computed(() => localTenants.value.length > 0);
const removableTenants = computed(() => localTenants.value.map((tenant, index) => ({
  index,
  label: fullName(tenant),
})));

const toggleRemoveList = () => {
  if (!hasTenants.value) {
    return;
  }
  removeListVisible.value = !removeListVisible.value;
};

const removeTenantFromList = (index: number) => {
  deleteRow(index);
  if (localTenants.value.length === 0) {
    removeListVisible.value = false;
  }
};

onMounted(() => {
  if (props.isDeleteButtonEnabled && localTenants.value.length === 0) {
    addNewRow();
  }
});
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4">
        <span class="text-xl font-semibold">{{ t('rentalAgreement.step4.tenantsSection') }}</span>
      </div>
    </template>

    <template #content>
      <div v-if="isDeleteButtonEnabled && removeListVisible" class="mb-4 rounded-lg border border-gray-200 p-3">
        <p class="mb-2 text-sm font-medium text-gray-500">
          {{ t('rentalAgreement.step3.selectedTenants') }}
        </p>
        <div class="flex flex-col gap-2">
          <Button
            v-for="tenant in removableTenants"
            :key="tenant.index"
            :label="tenant.label"
            icon="pi pi-trash"
            severity="danger"
            text
            class="justify-start"
            @click="removeTenantFromList(tenant.index)"
          />
        </div>
      </div>

      <div v-if="!hasTenants" class="text-base text-gray-500">
        {{ t('rentalAgreement.validation.oneTenantRequired') }}
      </div>

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="(tenant, index) in localTenants"
          :key="tenant.id || index"
          class="rounded-lg border border-gray-200 p-4"
        >
          <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 class="text-lg font-semibold text-gray-900">
                {{ fullName(tenant) }}
              </h4>
            </div>
          </div>

          <dl class="grid grid-cols-1 gap-4 text-base text-gray-600 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt class="font-medium text-gray-500">
                {{ t('rentalAgreement.step3.firstName') }}
              </dt>
              <dd class="mt-1 text-gray-900">
                <InputText
                  v-if="isDeleteButtonEnabled"
                  :modelValue="tenant.firstName || ''"
                  fluid
                  @update:modelValue="updateTenantField(index, 'firstName', $event)"
                />
                <span v-else>{{ tenant.firstName || '—' }}</span>
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-500">
                {{ t('rentalAgreement.step3.lastName') }}
              </dt>
              <dd class="mt-1 text-gray-900">
                <InputText
                  v-if="isDeleteButtonEnabled"
                  :modelValue="tenant.lastName || ''"
                  fluid
                  @update:modelValue="updateTenantField(index, 'lastName', $event)"
                />
                <span v-else>{{ tenant.lastName || '—' }}</span>
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-500">
                {{ t('rentalAgreement.step3.email') }}
              </dt>
              <dd class="mt-1 text-gray-900 break-words">
                <InputText
                  v-if="isDeleteButtonEnabled"
                  :modelValue="tenant.email || ''"
                  fluid
                  @update:modelValue="updateTenantField(index, 'email', $event)"
                />
                <span v-else>{{ tenant.email || '—' }}</span>
              </dd>
            </div>
            <div v-if="tenant.mobilePhoneNumber">
              <dt class="font-medium text-gray-500">
                {{ t('rentalAgreement.step3.mobilePhone') }}
              </dt>
              <dd class="mt-1 text-gray-900">
                {{ tenant.mobilePhoneNumber }}
              </dd>
            </div>
            <div v-if="tenant.businessPhoneNumber">
              <dt class="font-medium text-gray-500">
                {{ t('rentalAgreement.step3.businessPhone') }}
              </dt>
              <dd class="mt-1 text-gray-900">
                {{ tenant.businessPhoneNumber }}
              </dd>
            </div>
            <div v-if="tenant.privatePhoneNumber">
              <dt class="font-medium text-gray-500">
                {{ t('rentalAgreement.step3.privatePhone') }}
              </dt>
              <dd class="mt-1 text-gray-900">
                {{ tenant.privatePhoneNumber }}
              </dd>
            </div>
            <div v-if="tenant.placeOfBirth">
              <dt class="font-medium text-gray-500">
                {{ t('rentalAgreement.step3.placeOfBirth') }}
              </dt>
              <dd class="mt-1 text-gray-900">
                {{ tenant.placeOfBirth }}
              </dd>
            </div>
            <div v-if="tenant.dateOfBirth">
              <dt class="font-medium text-gray-500">
                {{ t('rentalAgreement.step3.dateOfBirth') }}
              </dt>
              <dd class="mt-1 text-gray-900">
                {{ tenant.dateOfBirth }}
              </dd>
            </div>
          </dl>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <Button
              :label="t('rentalAgreement.step3.addNewTenant')"
              icon="pi pi-plus"
              severity="secondary"
              @click="addNewRow"
          />
          <Button
              :label="t('rentalAgreement.step3.removeTenant')"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="toggleRemoveList"
          />
        </div>
      </div>
    </template>
  </BaseCard>
</template>
