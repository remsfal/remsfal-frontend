<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from "primevue/button"
import Card from "primevue/card"

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
        <template #title> Impressum </template>
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
      </Card>
    </div>
    <div class="col-6">
      <Card>
        <template #title> Kontakt </template>
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
      </Card>
    </div>
  </div>
</template>