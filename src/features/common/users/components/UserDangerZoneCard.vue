<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useAppToast } from '@/composables/useAppToast';
import { userService } from '@/features/common/users/services/UserService';
import DangerZoneCard from '@/components/DangerZoneCard.vue';

const { t } = useI18n();
const appToast = useAppToast();

const deleteUser = async () => {
  try {
    await userService.deleteUser();
    appToast.success(t('accountSettings.dangerZone.deleteSuccess'), { summary: t('success.saved') });
    window.location.pathname = '/api/v1/authentication/logout';
  } catch (err) {
    console.error('Error deleting user account:', err);
  }
};
</script>

<template>
  <DangerZoneCard
    :description="t('accountSettings.dangerZone.description')"
    :deleteButtonLabel="t('accountSettings.dangerZone.deleteButton')"
    :confirmTitle="t('accountSettings.dangerZone.confirmTitle')"
    :confirmMessage="t('accountSettings.dangerZone.confirmMessage')"
    @confirm="deleteUser"
  />
</template>
