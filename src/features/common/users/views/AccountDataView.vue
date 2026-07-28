<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { UserContactDataCard, UserAddressCard, UserDangerZoneCard } from '@/features/common/users';

const { t } = useI18n();
</script>

<template>
  <UserContactDataCard />
  <UserAddressCard />
  <div class="flex justify-center gap-4 flex-wrap">
    <Button severity="info" as="router-link" to="/manager/projects">
      {{ t('accountSettings.userProfile.managementView') }}
    </Button>
    <Button severity="info" as="router-link" to="/tenant/dashboard">
      {{ t('accountSettings.userProfile.tenanciesView') }}
    </Button>
    <Button severity="info" as="router-link" to="/contractor/dashboard">
      {{ t('accountSettings.userProfile.contractorView') }}
    </Button>
  </div>
  <UserDangerZoneCard />
</template>
