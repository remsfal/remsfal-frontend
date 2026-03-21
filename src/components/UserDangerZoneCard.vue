<script lang="ts" setup>
import BaseCard from '@/components/common/BaseCard.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import { userService } from '@/services/UserService';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const toast = useToast();

const showDeleteDialog = ref(false);

const deleteUser = async () => {
  try {
    await userService.deleteUser();
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('accountSettings.dangerZone.deleteSuccess'),
      life: 3000,
    });
    showDeleteDialog.value = false;
    window.location.pathname = '/api/v1/authentication/logout';
  } catch (err) {
    console.error('Error deleting user account:', err);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('accountSettings.dangerZone.deleteError'),
      life: 6000,
    });
  }
};
</script>

<template>
  <BaseCard titleClass="text-red-600 font-semibold text-xl">
    <template #title>
      {{ t('accountSettings.dangerZone.title') }}
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <p class="text-gray-700">
          {{ t('accountSettings.dangerZone.description') }}
        </p>
        <div>
          <Button
            severity="danger"
            :label="t('accountSettings.dangerZone.deleteButton')"
            icon="pi pi-trash"
            @click="showDeleteDialog = true"
          />
        </div>
      </div>
    </template>
  </BaseCard>

  <!-- Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="showDeleteDialog"
    :header="t('accountSettings.dangerZone.confirmTitle')"
    modal
    :style="{ width: '30rem' }"
  >
    <p class="mb-4">
      {{ t('accountSettings.dangerZone.confirmMessage') }}
    </p>
    <template #footer>
      <Button
        :label="t('button.cancel')"
        severity="secondary"
        @click="showDeleteDialog = false"
      />
      <Button
        :label="t('accountSettings.dangerZone.confirmDeleteButton')"
        severity="danger"
        icon="pi pi-trash"
        @click="deleteUser"
      />
    </template>
  </Dialog>
</template>

<style scoped></style>
