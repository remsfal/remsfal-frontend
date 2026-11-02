<route lang="yaml">
name: Login
meta:
  layout: auth
</route>

<script setup lang="ts">
import { LoginView } from '@/features/common/authentication';
</script>

<template>
  <LoginView />
</template>
