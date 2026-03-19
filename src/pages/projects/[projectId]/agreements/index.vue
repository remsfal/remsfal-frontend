<route lang="yaml">
name: RentalAgreementView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import RentalAgreementView from '@/views/project/RentalAgreementView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('RentalAgreementView')
</script>

<template>
  <RentalAgreementView :projectId="(route.params.projectId as string)" />
</template>
