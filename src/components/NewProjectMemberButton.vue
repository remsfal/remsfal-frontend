<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const email = ref(null);
</script>

<template>
  <Button
    :label="t('projectSettings.newProjectMemberButton.label')"
    icon="pi pi-plus"
    style="width: auto"
    @click="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    modal
    :header="t('projectSettings.newProjectMemberButton.label')"
    :style="{ width: '35rem' }"
  >
    <div class="flex items-center gap-4 mb-4">
      <FloatLabel>
        <InputText id="email_label" v-model="email" class="flex-auto" autocomplete="off" />
        <label for="email_label">E-Mail Adresse</label>
      </FloatLabel>
    </div>
    <div class="flex items-center gap-4 mb-4">
      <label for="username" class="font-semibold w-24">Username</label>
      <InputText id="username" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="email" class="font-semibold w-24">Email</label>
      <InputText id="email" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" :label="t('button.cancel')" severity="secondary" @click="visible = false"></Button>
      <Button type="button" :label="t('button.add')" @click="visible = false"></Button>
    </div>
  </Dialog>
</template>

<style scoped></style>
