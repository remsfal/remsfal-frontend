<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import BaseDialog from '@/components/BaseDialog.vue';

defineProps<{
  tenantName?: string;
  deletable?: boolean;
}>();
const emit = defineEmits<{
  delete: [];
}>();

const { t } = useI18n();

const deleteconfirm = ref(false);
</script>

<template>
  <div>
    <Button
      v-if="deletable"
      icon="pi pi-trash"
      severity="danger"
      size="small"
      text
      :aria-label="t('button.delete')"
      @click.stop="deleteconfirm = true"
    />

    <BaseDialog
      v-model:visible="deleteconfirm"
      :header="t('projectTenancies.dialog.confirmationTitle')"
      :closable="false"
      @click.stop
    >
      <p>{{ t('tenantList.card.confirmRemove', { name: tenantName }) }}</p>
      <div class="flex justify-end gap-2 mt-6">
        <Button
          :label="t('button.cancel')"
          severity="secondary"
          type="button"
          @click="deleteconfirm = false"
        />
        <Button
          :label="t('button.delete')"
          icon="pi pi-trash"
          severity="danger"
          type="button"
          @click="emit('delete')"
        />
      </div>
    </BaseDialog>
  </div>
</template>
