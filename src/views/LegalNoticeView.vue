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
  <div class="grid">
    <div class="col-12 mb-3">
      <Button icon="pi pi-home" label="Zurück zur Startseite" @click="navigateToHome" />
    </div>
    <div class="col-6">
      <Card>
        <template #title> {{ t('legalNotice.title') }}</template>
        <template #content>
          <p>{{ t('legalNotice.definition') }}</p>
          <p v-html="t('legalNotice.contact.address')"></p>
        </template>
      </Card>
    </div>
    <div class="col-6">
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