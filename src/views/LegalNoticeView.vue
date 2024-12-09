<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template>
  <div class="grid">
    <div class="col-6">
      <Card>
        <template #title> {{ $t('legalNotice.title') }}</template>
        <template #content>
          <p>{{ $t('legalNotice.definition') }}</p>
          <p>
            Prof. Dr.-Ing. Alexander Stanik<br />
            TA Gebäude C, Raum 830<br />
            Treskowallee 8<br />
            10318 Berlin<br />
            Deutschland<br />
          </p>
        </template>
      </Card>
    </div>
    <div class="col-6">
      <Card>
        <template #title> {{ $t('legalNotice.contact') }}</template>
        <template #content>
          <p>
            Tel.: +49 30 5019-2346<br />
            Fax: +49 30 5019-48-2346<br />
            E-Mail: info@remsfal.de<br />
          </p>
          <p>
            {{ $t('legalNotice.representative') }}
          </p>
        </template>
      </Card>
    </div>
  </div>
</template>
