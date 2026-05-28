<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from '@/components/common/BaseCard.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = withDefaults(defineProps<{
  title?: string;
  description: string;
  deleteButtonLabel: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmButtonLabel?: string;
}>(), {
  title: undefined,
  confirmButtonLabel: undefined,
});

const emit = defineEmits<{
  confirm: [];
}>();

const { t } = useI18n();
const showDeleteDialog = ref(false);

const effectiveTitle = computed(() => props.title ?? t('dangerZone.title'));
const effectiveConfirmButtonLabel = computed(
  () => props.confirmButtonLabel ?? t('dangerZone.confirmDeleteButton'),
);

function onConfirm() {
  showDeleteDialog.value = false;
  emit('confirm');
}
</script>

<template>
  <BaseCard titleClass="text-red-600 font-semibold text-xl">
    <template #title>
      {{ effectiveTitle }}
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <p class="text-gray-700">
          {{ props.description }}
        </p>
        <div>
          <Button
            severity="danger"
            :label="props.deleteButtonLabel"
            icon="pi pi-trash"
            @click="showDeleteDialog = true"
          />
        </div>
      </div>
    </template>
  </BaseCard>

  <Dialog
    v-model:visible="showDeleteDialog"
    :header="props.confirmTitle"
    modal
    :style="{ width: '30rem' }"
  >
    <p class="mb-4">
      {{ props.confirmMessage }}
    </p>
    <template #footer>
      <Button
        :label="t('button.cancel')"
        severity="secondary"
        @click="showDeleteDialog = false"
      />
      <Button
        :label="effectiveConfirmButtonLabel"
        severity="danger"
        icon="pi pi-trash"
        @click="onConfirm"
      />
    </template>
  </Dialog>
</template>
