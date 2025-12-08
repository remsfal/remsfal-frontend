<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

const isEditMode = ref(false);
const description = ref(`## Issue Description

Users are experiencing login failures on mobile devices when using the app. The issue appears to be related to session management.

### Steps to Reproduce:
1. Open the app on a mobile device
2. Enter valid credentials
3. Click "Login"

### Expected Behavior:
User should be logged in successfully

### Actual Behavior:
Login fails with "Session expired" error`);
</script>

<template>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <span>Description</span>
        <Button 
          :label="isEditMode ? 'Preview' : 'Edit'" 
          :icon="isEditMode ? 'pi pi-eye' : 'pi pi-pencil'"
          text 
          size="small"
          @click="isEditMode = !isEditMode"
        />
      </div>
    </template>
    <template #content>
      <div v-if="isEditMode" class="flex flex-col gap-2">
        <textarea 
          v-model="description"
          class="w-full p-3 border rounded min-h-[200px] font-mono text-sm"
          disabled
        />
        <span class="text-xs text-gray-500">Note: Edit functionality is non-functional (placeholder only)</span>
      </div>
      <div v-else class="prose max-w-none">
        <div v-html="description.replace(/\n/g, '<br>')" />
      </div>
    </template>
  </Card>
</template>
