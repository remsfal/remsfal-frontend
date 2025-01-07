<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
</script>

<template>
  <div class="p-link layout-topbar-button">
    <Select v-model="i18n.locale" :options="i18n.availableLocales">
      <template #value="slotProps">
        <img
          :alt="slotProps.value"
          style="width: 18px"
          :src="`/src/assets/flags/${slotProps.value}.png`"
        />
      </template>
      <template #option="slotProps">
        <img
          :alt="slotProps.option"
          style="width: 18px"
          :src="`/src/assets/flags/${slotProps.option}.png`"
        />
      </template>
    </Select>
  </div>
</template>

<style scoped></style>
