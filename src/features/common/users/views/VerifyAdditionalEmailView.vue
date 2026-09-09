<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Message from 'primevue/message';
import BaseCard from '@/components/BaseCard.vue';
import { authService } from '@/services/AuthService';

const { t } = useI18n();
const route = useRoute();

const loading = ref(true);
const verified = ref(false);

onMounted(async () => {
  const token = route.query.token;

  if (typeof token !== 'string' || !token) {
    loading.value = false;
    verified.value = false;
    return;
  }

  try {
    verified.value = await authService.verifyAdditionalEmail(token);
  } catch {
    verified.value = false;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <BaseCard :loading="loading" cardClass="flex flex-col gap-4 basis-full max-w-xl mx-auto">
    <template #title>
      {{ t('emailVerification.title') }}
    </template>
    <template #loading>
      <p>{{ t('emailVerification.loading') }}</p>
    </template>
    <template #content>
      <Message v-if="verified" severity="success" :closable="false">
        {{ t('emailVerification.successMessage') }}
      </Message>
      <Message v-else severity="error" :closable="false">
        {{ t('emailVerification.errorMessage') }}
      </Message>
      <div class="flex justify-center mt-4">
        <Button as="router-link" :to="{ name: 'ManagerAccountData' }" severity="info">
          {{ t('emailVerification.backToSettings') }}
        </Button>
      </div>
    </template>
  </BaseCard>
</template>
