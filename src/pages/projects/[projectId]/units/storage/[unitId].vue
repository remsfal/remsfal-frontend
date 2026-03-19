<route lang="yaml">
name: StorageView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import StorageView from '@/views/project/StorageView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('StorageView')
</script>

<template>
  <StorageView
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
</template>
