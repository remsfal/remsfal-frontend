<script setup lang="ts">
import Card from 'primevue/card';
import {useHead} from "@vueuse/head";
const logoUrl = new URL('@/assets/logo2.png', import.meta.url).href;
useHead({
  title: 'Datenschutzerklärung - Remsfal',
  meta: [
    {
      name: 'description',
      content: 'Erfahren Sie, wie Remsfal Ihre Daten verarbeitet und welche Rechte Sie haben.'
    },
    {
      property: 'og:title',
      content: 'Datenschutzerklärung - Remsfal'
    },
    {
      property: 'og:description',
      content: 'Erfahren Sie, wie Remsfal Ihre Daten verarbeitet und welche Rechte Sie haben.'
    },
    {
      property: 'og:image',
      content: logoUrl
    },
    {
      name: 'twitter:title',
      content: 'Datenschutzerklärung - Remsfal'
    },
    {
      name: 'twitter:description',
      content: 'Erfahren Sie, wie Remsfal Ihre Daten verarbeitet und welche Rechte Sie haben.'
    },
    {
      name: 'twitter:image',
      content: logoUrl
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    }
  ]
});
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <Card>
        <template #title>
          Datenschutzerklärung
        </template>
        <template #content>
          <p>Im Folgenden möchten wir Sie aufklären, wie Ihre Daten von uns verarbeitet werden.</p>
          <p class="p-card-content-header">Verantwortlich im Sinne der DSGVO ist:</p>
          <p>
            Prof. Dr.-Ing. Alexander Stanik<br />
            TA Gebäude C, Raum 830<br />
            Treskowallee 8<br />
            10318 Berlin<br />
            Deutschland
          </p>
          <p>E-Mail: info@remsfal.de</p>

          <p class="p-card-content-header">Unseren Datenschutzbeauftragten erreichen sie unter:</p>
          <p>
            Prof. Dr.-Ing. Alexander Stanik<br />
            E-Mail: privacy@remsfal.de
          </p>
          <p>
            Sollten Sie per E-Mail mit uns Kontakt aufnehmen, werden die mitgeteilten
            Daten von uns gespeichert, um Ihr Anliegen zu bearbeiten.
          </p>

          <p class="p-card-content-header">Betroffenenrechte</p>
          <p>
            Sie haben als betroffene Person, das Recht auf Auskunft, das Recht auf
            Berichtigung oder Löschung, das Recht auf Einschränkung der Verarbeitung
            und das Recht auf Widerspruch gegen die Verarbeitung Ihrer Daten.
            Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit mit
            Wirkung für die Zukunft widerrufen.
          </p>
          <p>
            Bitte richten Sie Ihren Widerspruch [oder Widerruf] formlos an folgende Adresse: privacy@remsfal.de
          </p>
          <p>
            Darüber hinaus haben Sie das Recht auf Datenübertragbarkeit.
            Sie haben weiter das Recht, sich bei einer Aufsichtsbehörde über die Verarbeitung zu
            beschweren. Eine Liste der entsprechenden Behörden finden Sie unter:
            <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" target="_blank" rel="noopener">
              https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html
            </a>.
          </p>
        </template>
        <template #footer>
          <a href="https://opr.vc/docs/allgemein/dse_einleitung/" target="_blank" rel="noopener">
            open privacy by opr.vc
          </a>
        </template>
      </Card>
    </div>

    <div class="col-12">
      <Card>
        <template #title>
          Hosting
        </template>
        <template #content>
          <p class="p-card-content-header">Unser Hoster erhebt in sog. Logfiles folgende Daten,
            die Ihr Browser übermittelt:</p>
          <p>
            Ihre IP-Adresse, Ihr Browsertyp und Ihre Browserversion, Ihr Betriebssystem,
            die Internetseite, von der Sie auf unsere Website gelangt sind, die Unterwebseiten,
            welche über ein zugreifendes System auf unserer Internetseite angesteuert werden,
            das Datum und die Uhrzeit eines Zugriffs auf unsere Website und Ihr Internet-Service-Provider.
          </p>
          <p>
            Wir benötigen die vorgenannten Daten, um die Inhalte unserer Internetseite korrekt auszuliefern
            und die dauerhafte Funktionsfähigkeit unserer informationstechnologischen Systeme und der Technik
            unserer Internetseite zu gewährleisten. Die gespeicherten Daten werden nur zu statistischen Zwecken
            ausgewertet. Rückschlüsse auf Ihre Person werden aus den Daten nicht gezogen, insbesondere werden
            die Server-Logfiles getrennt von Ihren sonstigen personenbezogenen Daten gespeichert.
            Personenbezogene Nutzerprofile können nicht gebildet werden.
          </p>
          <p>
            Die Verarbeitung der Daten erfolgt auf Grundlage von Art. 6 I lit. b) DSGVO.
            Nach dieser Vorschrift ist die Verarbeitung personenbezogener Daten zur Erfüllung eines Vertrags,
            dessen Vertragspartei Sie sind, oder zur Durchführung vorvertraglicher Maßnahmen erforderlich.
            Mit der Nutzung unserer Seite nehmen Sie unser Angebot auf Abschluss
            eines entsprechenden (unentgeltlichen) Nutzungsvertrages stillschweigend an.
            Im Übrigen ist die Verarbeitung auch über Art. 6 I lit. f) DSGVO gerechtfertigt,
            da wir ein berechtigtes Interesse an der Verarbeitung haben und Ihre Interessen,
            Grundrechte und Grundfreiheiten nicht überwiegen. Das Interesse besteht darin,
            unser Webangebot ordnungsgemäß auszuliefern und die Funktionsfähigkeit unserer Systeme zu schützen.
          </p>
          <p class="p-card-content-header">Wir setzen für die Zurverfügungstellung unserer Website folgenden Hoster ein:</p>
          <p>
            Hochschulrechenzentrum HTW Berlin<br />
            TGS Technologie- und Gründerzentrum Spreeknie Haus 9<br />
            Ostendstraße 25<br />
            12459 Berlin<br />
            Germany<br />
          </p>
          <p>
            Weitere Details und Informationen zu Widerspruchs- und Beseitigungsmöglichkeiten gegenüber
            dem Hochschulrechenzentrum der HTW Berlin finden Sie unter:
            <a href="https://www.htw-berlin.de/datenschutz/" target="_blank" rel="noopener">
              https://www.htw-berlin.de/datenschutz/
            </a>
          </p>
        </template>
        <template #footer>
          <p>Stand: Januar 2024</p>
        </template>
      </Card>
    </div>
  </div>
</template>
