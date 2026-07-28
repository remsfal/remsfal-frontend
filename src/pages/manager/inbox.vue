<route lang="yaml">
name: Inbox
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { InboxView } from '@/features/manager/inbox';
</script>

<template>
  <InboxView />
</template>
