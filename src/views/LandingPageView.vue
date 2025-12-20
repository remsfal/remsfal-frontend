<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useI18n } from 'vue-i18n';
import Snowfall from '@/components/Snowfall.vue';

const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans text-surface-900 dark:text-surface-0 relative">

    <Snowfall />

    <main class="flex-grow z-10 relative">
      <section class="relative pt-20 pb-20">
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-6xl mx-auto">
            <div class="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h1
                  class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-surface-900
                  dark:text-surface-0 mb-6 tracking-tight leading-tight"
                >
                  <span class="text-emerald-600 dark:text-emerald-400">REMSFAL</span>
                </h1>
                <h2 class="text-2xl md:text-3xl font-bold text-surface-800 dark:text-surface-100 mb-6 leading-tight">
                  REmote Management Services for connected FAciLities
                </h2>
                <p class="text-lg md:text-xl text-surface-600 dark:text-surface-300 leading-relaxed">
                  Die erste Open-Source-Software für ganzheitliches, digitales Facility Management
                </p>
              </div>

              <div class="flex justify-center md:justify-end">
                <div class="relative w-64 h-64 md:w-80 md:h-80">
                  <div
                    class="absolute inset-0 bg-gradient-to-br from-emerald-100 via-blue-50 to-purple-100
                     dark:from-emerald-900 dark:via-blue-950 dark:to-purple-900 rounded-full opacity-60 blur-sm"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-tl from-emerald-200 via-transparent to-blue-200
                     dark:from-emerald-800 dark:via-transparent dark:to-blue-800 rounded-full opacity-40 blur-md"
                  />
                  <div
                    class="absolute top-1/4 left-1/4 w-40 h-40 bg-emerald-300
                     dark:bg-emerald-700 rounded-full blur-3xl opacity-30"
                  />
                  <div
                    class="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-300
                     dark:bg-blue-700 rounded-full blur-3xl opacity-30"
                  />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <img
                      src="@/assets/remsfal-icon.svg"
                      alt="REMSFAL Icon"
                      class="w-40 h-40 md:w-48 md:h-48 text-emerald-700 dark:text-emerald-300 drop-shadow-2xl"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div
                class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-6
                shadow-md border border-surface-200 dark:border-surface-700"
              >
                <h2 class="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon="fa-solid fa-lightbulb" class="text-lg" />
                  Unsere Vision
                </h2>
                <p class="text-surface-700 dark:text-surface-300 leading-relaxed">
                  Eine End-to-End-Lösung, die alle relevanten Interessengruppen – von Mietern über Hausverwaltungen
                  bis hin zu Auftragnehmern – nahtlos in einem transparenten Prozess vereint.
                  REMSFAL bietet hierfür eine ganzheitliche Prozessabbildung, die den gesamten Lebenszyklus
                  eines Mangelprozesses digitalisiert.
                </p>
              </div>

              <div
                class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-6 shadow-md
                border border-surface-200 dark:border-surface-700"
              >
                <h2 class="text-xl font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" class="text-lg" />
                  Das Problem
                </h2>
                <p class="text-surface-700 dark:text-surface-300 leading-relaxed">
                  Viele kleine und mittelständische Hausverwaltungen sind mit ineffizienten, analogen Prozessen konfrontiert.
                  Die manuelle Bearbeitung von Mängelmeldungen per E-Mail oder Telefon ist zeitaufwendig und fehleranfällig.
                  Gleichzeitig sind die am Markt verfügbaren digitalen Lösungen oft zu teuer und komplex,
                  was zu Intransparenz für Mieter und unnötig hoher Arbeitsbelastung für Hausverwalter führt.
                </p>
              </div>

              <div
                class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-6 shadow-md
                border border-surface-200 dark:border-surface-700"
              >
                <h2 class="text-xl font-bold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon="fa-solid fa-rocket" class="text-lg" />
                  Unsere Lösung
                </h2>
                <p class="text-surface-700 dark:text-surface-300 leading-relaxed mb-4">
                  REMSFAL bietet eine zugängliche und leistungsstarke Plattform. Die Kernfunktionalität ist das
                  <strong>Mängelmanagement</strong>, das Mietern ermöglicht, Anfragen einfach und datenschutzkonform zu stellen.
                  Alle notwendigen Informationen werden bereits bei der Meldung erfasst und intelligent aufbereitet.
                </p>
                <ul class="space-y-2 text-surface-700 dark:text-surface-300">
                  <li class="flex items-start gap-2">
                    <FontAwesomeIcon
                      icon="fa-solid fa-check-circle"
                      class="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0"
                    />
                    <span>Asynchrone Bewertung und Klassifizierung zur Identifikation von Notfällen</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <FontAwesomeIcon
                      icon="fa-solid fa-check-circle"
                      class="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0"
                    />
                    <span>Transparente Koordination mit Auftragnehmern</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <FontAwesomeIcon
                      icon="fa-solid fa-check-circle"
                      class="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0"
                    />
                    <span>Einfache Stammdatenverwaltung und Dokumentation</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <FontAwesomeIcon
                      icon="fa-solid fa-check-circle"
                      class="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0"
                    />
                    <span>Intelligente Auswertung von Schadensdaten zur optimierung von Instandhaltungskosten</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute top-0 left-0 w-full h-full -z-10 opacity-20 pointer-events-none">
          <div class="absolute -top-24 -left-24 w-96 h-96 bg-emerald-300 dark:bg-emerald-800 rounded-full blur-3xl" />
          <div class="absolute top-1/2 right-0 w-96 h-96 bg-blue-300 dark:bg-blue-800 rounded-full blur-3xl" />
          <div class="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-300 dark:bg-purple-800 rounded-full blur-3xl" />
        </div>
      </section>

      <section id="features" class="py-20">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-surface-800 dark:text-surface-100">
              Unsere Funktionen
            </h2>
          </div>
          <div class="grid md:grid-cols-3 gap-12">
            <div
              class="group p-8 rounded-2xl bg-surface-0 dark:bg-surface-800 hover:shadow-xl transition-all
               duration-300 border border-surface-200 dark:border-surface-700"
            >
              <div
                class="w-14 h-14 bg-emerald-100 dark:bg-emerald-900 text-emerald-600
                dark:text-emerald-400 rounded-xl flex items-center justify-center
                mb-6 group-hover:scale-110 transition-transform"
              >
                <FontAwesomeIcon icon="fa-solid fa-screwdriver-wrench" class="text-2xl" />
              </div>
              <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-3">
                {{ t('landingPage.header.defect-management') }}
              </h3>
              <p class="text-surface-600 dark:text-surface-300 leading-relaxed">
                Effizientes Mängelmanagement für Ihre Immobilien. Erfassen, verfolgen und lösen Sie Probleme schneller.
              </p>
            </div>

            <div
              class="group p-8 rounded-2xl bg-surface-0 dark:bg-surface-800 hover:shadow-xl
              transition-all duration-300 border border-surface-200 dark:border-surface-700"
            >
              <div
                class="w-14 h-14 bg-blue-100 dark:bg-blue-900 text-blue-600
                dark:text-blue-400 rounded-xl flex items-center justify-center mb-6
                group-hover:scale-110 transition-transform"
              >
                <FontAwesomeIcon icon="fa-solid fa-file-lines" class="text-2xl" />
              </div>
              <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-3">
                {{ t('landingPage.header.documentation') }}
              </h3>
              <p class="text-surface-600 dark:text-surface-300 leading-relaxed">
                Lückenlose Dokumentation aller Vorgänge. Behalten Sie den Überblick über Verträge, Protokolle und mehr.
              </p>
            </div>

            <div
              class="group p-8 rounded-2xl bg-surface-0 dark:bg-surface-800 hover:shadow-xl
                transition-all duration-300 border border-surface-200 dark:border-surface-700"
            >
              <div
                class="w-14 h-14 bg-purple-100 dark:bg-purple-900 text-purple-600
                dark:text-purple-400 rounded-xl flex items-center justify-center
                mb-6 group-hover:scale-110 transition-transform"
              >
                <FontAwesomeIcon icon="fa-solid fa-chart-line" class="text-2xl" />
              </div>
              <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-3">
                {{ t('landingPage.header.monitoring') }}
              </h3>
              <p class="text-surface-600 dark:text-surface-300 leading-relaxed">
                Echtzeit-Monitoring Ihrer Portfolios. Analysieren Sie Performance
                und treffen Sie datenbasierte Entscheidungen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-8 border-t border-surface-200 dark:border-surface-700">
        <div class="container mx-auto px-6">
          <p class="text-xs text-surface-500 dark:text-surface-400 text-center leading-relaxed">
            Mit der Anmeldung über Ihr Google-Konto können Sie Projekte anlegen und verwalten.
            Durch die Nutzung stimmen Sie unseren Nutzungsbedingungen und der Datenschutzerklärung zu.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
</style>