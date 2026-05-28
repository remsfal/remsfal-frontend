<route lang="yaml">
name: TenantAccountSettings
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import UserAddressCard from "@/components/UserAddressCard.vue";
import UserContactDataCard from "@/components/UserContactDataCard.vue";
import UserDangerZoneCard from "@/components/UserDangerZoneCard.vue";
</script>

<template>
  <UserContactDataCard />
  <UserAddressCard />
  <UserDangerZoneCard />
</template>
