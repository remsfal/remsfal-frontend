<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-surface-900 dark:text-surface-0 mb-6 tracking-tight leading-tight">
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
                <img src="@/assets/remsfal-icon.svg" alt="REMSFAL Icon" class="w-40 h-40 md:w-48 md:h-48">
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="features" class="py-20">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl font-bold text-center mb-16 text-surface-800 dark:text-surface-100">Unsere Funktionen</h2>
        </div>
      </section>
    </main>
  </div>
</template>