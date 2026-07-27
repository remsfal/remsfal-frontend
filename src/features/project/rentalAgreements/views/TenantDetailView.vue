<script setup lang="ts">
import TenantContactDataCard from '../components/TenantContactDataCard.vue';
import TenantAddressCard from '../components/TenantAddressCard.vue';

defineProps<{
  projectId: string;
  tenantId: string;
}>();
</script>

<template>
  <TenantContactDataCard :projectId :tenantId />
  <TenantAddressCard :projectId :tenantId />
</template>
