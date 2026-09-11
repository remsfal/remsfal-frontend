<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <footer>
    <div class="layout-footer flex items-end">
      <div class="pb-2">
        <img src="@/assets/logo.svg" alt="Logo" class="mr-2">
      </div>
      <div>
        {{ t('footer.poweredBy') }}
      </div>
    </div>
  </footer>
</template>
