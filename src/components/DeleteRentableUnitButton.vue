<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useI18n } from 'vue-i18n';
import type { RentalUnitTreeNodeJson } from '@/services/PropertyService';

const props = defineProps<{
  node: RentalUnitTreeNodeJson;
}>();

const emit = defineEmits<{
  delete: [node: RentalUnitTreeNodeJson];
}>();

const { t } = useI18n();
const showDeleteDialog = ref(false);

function confirmDelete(): void {
  emit('delete', props.node);
  showDeleteDialog.value = false;
}

function getUnitTypeTranslation(): string {
  if (!props.node.data?.type) return '';
  return t(`unitTypes.${props.node.data.type.toLowerCase()}`);
}
</script>

<template>
  <div>
    <Button
      type="button"
      icon="pi pi-trash"
      severity="danger"
      data-testid="deleteRentableUnitButton"
      @click="showDeleteDialog = true"
    />

    <Dialog
      v-model:visible="showDeleteDialog"
      :header="t('rentableUnits.delete.confirmTitle')"
      modal
      :style="{ width: '30rem' }"
      data-testid="deleteRentableUnitDialog"
    >
      <p class="mb-4">
        {{ t('rentableUnits.delete.confirmMessage', {
          type: getUnitTypeTranslation(),
          title: node.data?.title || ''
        }) }}
      </p>
      <template #footer>
        <Button
          :label="t('button.cancel')"
          severity="secondary"
          data-testid="cancelDeleteButton"
          @click="showDeleteDialog = false"
        />
        <Button
          :label="t('rentableUnits.delete.confirmDeleteButton')"
          severity="danger"
          icon="pi pi-trash"
          data-testid="confirmDeleteButton"
          @click="confirmDelete"
        />
      </template>
    </Dialog>
  </div>
</template>
