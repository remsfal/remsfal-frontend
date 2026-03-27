<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { userService } from '@/services/UserService';
import DangerZoneCard from '@/components/common/DangerZoneCard.vue';

const { t } = useI18n();
const toast = useToast();

const deleteUser = async () => {
  try {
    await userService.deleteUser();
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('accountSettings.dangerZone.deleteSuccess'),
      life: 3000,
    });
    window.location.pathname = '/api/v1/authentication/logout';
  } catch (err) {
    console.error('Error deleting user account:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('accountSettings.dangerZone.deleteError'),
      life: 6000,
    });
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
