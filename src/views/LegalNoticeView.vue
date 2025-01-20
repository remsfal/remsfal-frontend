<script setup lang="ts">
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

const navigateToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-12 mb-4">
      <Button icon="pi pi-home" label="Zurück zur Startseite" @click="navigateToHome" />
    </div>
    <div class="col-span-6">
      <Card>
        <template #title> {{ t('legalNotice.title') }}</template>
        <template #content>
          <p>{{ t('legalNotice.definition') }}</p>
          <p v-html="t('legalNotice.contact.address')"></p>
        </template>
      </Card>
    </div>
    <div class="col-span-6">
      <Card>
        <template #title> {{ t('legalNotice.contact') }}</template>
        <template #content>
          <p>
            {{ t('legalNotice.contact.phone') }}<br />
            {{ t('legalNotice.contact.fax') }}<br />
            {{ t('legalNotice.contact.email') }}<br />
          </p>
          <p v-html="t('legalNotice.representative')"></p>
        </template>
      </Card>
    </div>
  </div>
</template>
