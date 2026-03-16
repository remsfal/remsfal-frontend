<route lang="yaml">
name: SiteView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import SiteView from '@/views/project/SiteView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('SiteView')
</script>

<template>
  <SiteView
    :projectId="(route.params.projectId as string)"
    :siteId="(route.params.unitId as string)"
  />
</template>
