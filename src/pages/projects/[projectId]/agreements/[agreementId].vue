<route lang="yaml">
name: RentalAgreementDetails
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { RentalAgreementDetailView as RentalAgreementDetails } from '@/features/project/rentalAgreements'
import { useRoute } from 'vue-router'
const route = useRoute('RentalAgreementDetails')
</script>

<template>
  <RentalAgreementDetails
    :projectId="(route.params.projectId as string)"
    :agreementId="(route.params.agreementId as string)"
  />
</template>
