<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DangerZoneCard from '@/components/common/DangerZoneCard.vue';
import { propertyService, type UnitType } from '@/services/PropertyService';
import { buildingService } from '@/services/BuildingService';
import { apartmentService } from '@/services/ApartmentService';
import { commercialService } from '@/services/CommercialService';
import { storageService } from '@/services/StorageService';
import { siteService } from '@/services/SiteService';

const props = defineProps<{
  projectId: string;
  unitId: string;
  unitType: UnitType;
}>();

const { t } = useI18n();
const toast = useToast();
const router = useRouter();

const unitTypeLabel = computed(() => t(`unitTypes.${props.unitType.toLowerCase()}`));

async function deleteUnit(): Promise<void> {
  try {
    switch (props.unitType) {
      case 'PROPERTY':
        await propertyService.deleteProperty(props.projectId, props.unitId);
        break;
      case 'BUILDING':
        await buildingService.deleteBuilding(props.projectId, props.unitId);
        break;
      case 'APARTMENT':
        await apartmentService.deleteApartment(props.projectId, props.unitId);
        break;
      case 'COMMERCIAL':
        await commercialService.deleteCommercial(props.projectId, props.unitId);
        break;
      case 'STORAGE':
        await storageService.deleteStorage(props.projectId, props.unitId);
        break;
      case 'SITE':
        await siteService.deleteSite(props.projectId, props.unitId);
        break;
    }
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('rentableUnits.dangerZone.deleteSuccess', { type: unitTypeLabel.value }),
      life: 3000,
    });
    await router.push({ name: 'RentableUnits', params: { projectId: props.projectId } });
  } catch (err) {
    console.error('Error deleting unit:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('rentableUnits.dangerZone.deleteError', { type: unitTypeLabel.value }),
      life: 6000,
    });
  }
}
</script>

<template>
  <DangerZoneCard
    :description="t('rentableUnits.dangerZone.description', { type: unitTypeLabel })"
    :deleteButtonLabel="t('rentableUnits.dangerZone.deleteButton', { type: unitTypeLabel })"
    :confirmTitle="t('rentableUnits.dangerZone.confirmTitle', { type: unitTypeLabel })"
    :confirmMessage="t('rentableUnits.dangerZone.confirmMessage', { type: unitTypeLabel })"
    @confirm="deleteUnit"
  />
</template>
