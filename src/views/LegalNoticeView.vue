<script setup>
import BaseLayout from "@/views/templates/FullscreenViewLayout.vue";
</script>

<template>
  <BaseLayout>
    <div class="col-12">
      <PrimeCard>
        <template #title>
          Impressum
        </template>
        <template #content>
          <p>Angaben gemäß § 5 Telemediengesetz (TMG):</p>
          <p>
            Prof. Dr.-Ing. Alexander Stanik<br />
            TA Gebäude C, Raum 830<br />
            Treskowallee 8<br />
            10318 Berlin<br />
            Deutschland<br />
          </p>
        </template>
      </PrimeCard>
    </div>
    <div class="col-12">
      <PrimeCard>
        <template #title>
          Kontakt
        </template>
        <template #content>
          <p>
            Tel.: +49 30 5019-2346<br />
            Fax: +49 30 5019-48-2346<br />
            E-Mail: info@remsfal.de<br />
          </p>
          <p>
            Verantwortlicher für den Inhalt ist gemäß § 55 Abs. 2 Rundfunkstaatsvertrag (RStV):<br />
            Prof. Dr.-Ing. Alexander Stanik, info@remsfal.de
          </p>
        </template>
      </PrimeCard>
    </div>
  </BaseLayout>
</template>
