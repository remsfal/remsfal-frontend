<script setup lang="ts">
import Message from 'primevue/message';

defineProps<{
  inputId?: string;
  label: string;
  required?: boolean;
  errorMessage?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="inputId" class="font-semibold">
      {{ label }}<span v-if="required" aria-hidden="true"> *</span>
    </label>
    <slot />
    <Message v-if="errorMessage" severity="error" size="small" variant="simple">
      {{ errorMessage }}
    </Message>
  </div>
</template>
