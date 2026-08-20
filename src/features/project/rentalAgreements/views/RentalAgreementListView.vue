<script setup lang="ts">
import RentalAgreementListCard from '../components/RentalAgreementListCard.vue';

defineProps<{
  projectId: string;
}>();
</script>

<template>
  <RentalAgreementListCard :projectId="projectId" />
</template>
