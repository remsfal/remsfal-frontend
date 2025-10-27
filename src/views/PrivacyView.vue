<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
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
      <Button
        icon="pi pi-home"
        label="Zurück zur Startseite"
        @click="navigateToHome"
      />
    </div>
    <div class="col-span-12">
      <Card>
        <template #title>
          {{ t('privacy.title') }}
        </template>
        <template #content>
          <p>{{ t('privacy.explanation') }}</p>
          <p class="p-card-content-header">
            {{ t('privacy.responsibility') }}
          </p>
          <p v-html="t('legalNotice.contact.address')" />
          <p>{{ t('legalNotice.contact.email') }}</p>

          <p class="p-card-content-header">
            {{ t('privacy.representative') }}
          </p>
          <p>
            Prof. Dr.-Ing. Alexander Stanik<br>
            E-Mail: privacy@remsfal.de
          </p>
          <p>
            {{ t('privacy.contact') }}
          </p>

          <p class="p-card-content-header">
            {{ t('privacy.betroffenenrechte.title') }}
          </p>
          <p>
            {{ t('privacy.betroffenenrechte.explanation.1') }}
          </p>
          <p>
            {{ t('privacy.betroffenenrechte.explanation.2') }}
          </p>
          <p>
            {{ t('privacy.portability') }}
            <a
              href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html </a>.
          </p>
        </template>
        <template #footer>
          <a
            href="https://opr.vc/docs/allgemein/dse_einleitung/"
            target="_blank"
            rel="noopener noreferrer"
          >
            open privacy by opr.vc
          </a>
        </template>
      </Card>
    </div>

    <div class="col-span-12">
      <Card>
        <template #title>
          {{ t('privacy.hosting.title') }}
        </template>
        <template #content>
          <p class="p-card-content-header">
            {{ t('privacy.hosting.explanation.1') }}
          </p>
          <p>
            {{ t('privacy.hosting.explanation.2') }}
          </p>
          <p>
            {{ t('privacy.hosting.explanation.3') }}
          </p>
          <p>
            {{ t('privacy.hosting.explanation.4') }}
          </p>
          <p class="p-card-content-header">
            {{ t('privacy.hosting.explanation.5') }}
          </p>
          <p v-html="t('privacy.hosting.adress')" />
          <p>
            {{ t('privacy.furtherInformation') }}
            <a
              href="https://www.htw-berlin.de/datenschutz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.htw-berlin.de/datenschutz/
            </a>
          </p>
        </template>
        <template #footer>
          <p>{{ t('privacy.lastUpdated') }}</p>
        </template>
      </Card>
    </div>
  </div>
</template>
