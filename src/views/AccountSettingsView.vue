<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import UserContactDataCard from '@/components/UserContactDataCard.vue';
import UserAddressCard from '@/components/UserAddressCard.vue';
import UserDangerZoneCard from '@/components/UserDangerZoneCard.vue';

const { t } = useI18n();
</script>

<template>
  <UserContactDataCard />
  <UserAddressCard />
  <div class="flex justify-center gap-4 flex-wrap">
    <Button severity="info" as="router-link" to="/projects">
      {{ t('accountSettings.userProfile.managementView') }}
    </Button>
    <Button severity="info" as="router-link" to="/tenancies/dashboard">
      {{ t('accountSettings.userProfile.tenanciesView') }}
    </Button>
    <Button severity="info" as="router-link" to="/contractor/dashboard">
      {{ t('accountSettings.userProfile.contractorView') }}
    </Button>
  </div>
  <UserDangerZoneCard />
</template>
