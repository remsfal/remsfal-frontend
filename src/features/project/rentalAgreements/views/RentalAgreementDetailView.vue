<script setup lang="ts">
import RentalAgreementSummaryCard from '../components/RentalAgreementSummaryCard.vue';
import { rentalAgreementService, type RentalAgreementJson } from '@/services/RentalAgreementService';
import BaseCard from '@/components/common/BaseCard.vue';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  projectId: string;
  agreementId: string;
}>();

const rentalAgreement = ref<RentalAgreementJson | null>(null);

onMounted(async () => {
  if (!props.agreementId || !props.projectId) {
    console.error('Agreement ID or Project ID not found');
    return;
  }

  rentalAgreement.value = await rentalAgreementService.loadRentalAgreement(
    props.projectId,
    props.agreementId
  );
});
</script>

<template>
  <div class="p-4">
    <div class="grid grid-cols-1 gap-6">
      <BaseCard v-if="rentalAgreement">
        <template #content>
          <RentalAgreementSummaryCard :rentalAgreement="rentalAgreement" />
        </template>
      </BaseCard>
    </div>
  </div>
</template>
