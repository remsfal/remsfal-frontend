<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import AddressCard from '@/components/AddressCard.vue';
import { userService } from '@/services/UserService';
import type { AddressJson } from '@/services/AddressService';

const { t } = useI18n();

async function loadAddress(): Promise<AddressJson | undefined> {
  const user = await userService.getUser();
  return user.address;
}

async function saveAddress(addr: AddressJson): Promise<void> {
  await userService.updateUser({ address: addr });
}
</script>

<template>
  <AddressCard
    :loadAddress="loadAddress"
    :saveAddress="saveAddress"
    :title="t('accountSettings.address.title')"
  />
</template>
