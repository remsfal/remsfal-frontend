<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <Card>
        <template #title> {{ $t('privacy.title') }}</template>
        <template #content>
          <p>{{ $t('privacy.explanation') }}</p>
          <p class="p-card-content-header">{{ $t('privacy.responsibility') }}</p>
          <p>
            Prof. Dr.-Ing. Alexander Stanik<br />
            TA Gebäude C, Raum 830<br />
            Treskowallee 8<br />
            10318 Berlin<br />
            Deutschland
          </p>
          <p>E-Mail: info@remsfal.de</p>

          <p class="p-card-content-header">{{ $t('privacy.representative') }}</p>
          <p>
            Prof. Dr.-Ing. Alexander Stanik<br />
            E-Mail: privacy@remsfal.de
          </p>
          <p>
            {{ $t('privacy.contact') }}
          </p>

          <p class="p-card-content-header">{{ $t('privacy.betroffenenrechte.title') }}</p>
          <p>
            {{ $t('privacy.betroffenenrechte.explanation.1') }}
          </p>
          <p>
            {{ $t('privacy.betroffenenrechte.explanation.2') }}
          </p>
          <p>
            {{ $t('privacy.portability') }}
            <a
              href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html </a
            >.
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

    <div class="col-12">
      <Card>
        <template #title> {{ $t('privacy.hosting.title') }}</template>
        <template #content>
          <p class="p-card-content-header">
            {{ $t('privacy.hosting.explanation.1') }}
          </p>
          <p>
            {{ $t('privacy.hosting.explanation.2') }}
          </p>
          <p>
            {{ $t('privacy.hosting.explanation.3') }}
          </p>
          <p>
            {{ $t('privacy.hosting.explanation.4') }}
          </p>
          <p class="p-card-content-header">
            {{ $t('privacy.hosting.explanation.5') }}
          </p>
          <p>
            Hochschulrechenzentrum HTW Berlin<br />
            TGS Technologie- und Gründerzentrum Spreeknie Haus 9<br />
            Ostendstraße 25<br />
            12459 Berlin<br />
            Germany<br />
          </p>
          <p>
            {{ $t('privacy.furtherInformation') }}
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
          <p>{{ $t('privacy.lastUpdated') }}</p>
        </template>
      </Card>
    </div>
  </div>
</template>
