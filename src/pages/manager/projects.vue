<route lang="yaml">
name: ProjectSelection
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { ManagerView } from '@/features/manager/projects';
</script>

<template>
  <ManagerView />
</template>
