<script setup lang="ts">
defineProps<{
  tenantId: string;
  disabled?: boolean;
}>();
</script>

<template>
  <div class="flex gap-2">
    <Button
      icon="pi pi-phone"
      severity="secondary"
      size="small"
      outlined
      :disabled="disabled"
      aria-label="Anrufen"
    />
    <Button
      icon="pi pi-envelope"
      severity="secondary"
      size="small"
      outlined
      :disabled="disabled"
      aria-label="Nachricht"
    />
  </div>
</template>
