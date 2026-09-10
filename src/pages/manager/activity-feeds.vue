<route lang="yaml">
name: ActivityFeeds
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { ActivityFeedView } from '@/features/manager/activityFeeds';
</script>

<template>
  <ActivityFeedView />
</template>
