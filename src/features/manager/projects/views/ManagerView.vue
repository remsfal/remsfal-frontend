<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import Button from 'primevue/button';
import NewProjectDialog from '../components/NewProjectDialog.vue';
import ManagerProjectListCard from '../components/ManagerProjectListCard.vue';

const { t } = useI18n();

const showDialog = ref(false);
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-10">
      <ManagerProjectListCard />
    </div>
    <div class="col-span-2">
      <Button
        :label="t('projectSelection.add')"
        icon="pi pi-plus"
        style="width: auto"
        @click="showDialog = true"
      />
    </div>
  </div>

  <NewProjectDialog v-model:visible="showDialog" />
</template>
