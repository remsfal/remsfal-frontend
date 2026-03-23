<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import BaseCard from '@/components/common/BaseCard.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
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

const showDeleteDialog = ref(false);

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
    showDeleteDialog.value = false;
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
  <BaseCard titleClass="text-red-600 font-semibold text-xl">
    <template #title>
      {{ t('rentableUnits.dangerZone.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <p class="text-gray-700">
          {{ t('rentableUnits.dangerZone.description', { type: unitTypeLabel }) }}
        </p>
        <div>
          <Button
            severity="danger"
            :label="t('rentableUnits.dangerZone.deleteButton', { type: unitTypeLabel })"
            icon="pi pi-trash"
            @click="showDeleteDialog = true"
          />
        </div>
      </div>
    </template>
  </BaseCard>

  <Dialog
    v-model:visible="showDeleteDialog"
    :header="t('rentableUnits.dangerZone.confirmTitle', { type: unitTypeLabel })"
    modal
    :style="{ width: '30rem' }"
  >
    <p class="mb-4">
      {{ t('rentableUnits.dangerZone.confirmMessage', { type: unitTypeLabel }) }}
    </p>
    <template #footer>
      <Button
        :label="t('button.cancel')"
        severity="secondary"
        @click="showDeleteDialog = false"
      />
      <Button
        :label="t('rentableUnits.dangerZone.confirmDeleteButton')"
        severity="danger"
        icon="pi pi-trash"
        @click="deleteUnit"
      />
    </template>
  </Dialog>
</template>
