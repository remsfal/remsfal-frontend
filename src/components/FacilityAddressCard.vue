<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import AddressCard from '@/components/AddressCard.vue';
import { buildingService } from '@/services/BuildingService';
import { siteService } from '@/services/SiteService';
import type { AddressJson } from '@/services/AddressService';

interface Props {
  projectId: string;
  unitId: string;
  facilityType: 'building' | 'site';
  title?: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

async function loadAddress(): Promise<AddressJson | undefined> {
  if (props.facilityType === 'building') {
    const building = await buildingService.getBuilding(props.projectId, props.unitId);
    return building.address;
  } else {
    const site = await siteService.getSite(props.projectId, props.unitId);
    return site.address;
  }
}

async function saveAddress(addr: AddressJson): Promise<void> {
  if (props.facilityType === 'building') {
    await buildingService.updateBuilding(props.projectId, props.unitId, { address: addr });
  } else {
    await siteService.updateSite(props.projectId, props.unitId, { address: addr });
  }
}
</script>

<template>
  <AddressCard
    :loadAddress="loadAddress"
    :saveAddress="saveAddress"
    :title="title ?? t('address.title')"
  />
</template>
