<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';

const { t } = useI18n();
</script>

<template>
  <main>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-10">
        <div class="card">
          <h5>{{ t('customerView.title') }}</h5>
          <Message severity="info">{{ t('customerView.notAvailable') }}</Message>
        </div>
      </div>
    </div>
  </main>
</template>
