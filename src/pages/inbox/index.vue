<route lang="yaml">
name: Inbox
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import InboxView from '@/views/InboxView.vue'
</script>

<template>
  <InboxView />
</template>
