<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Snowflake {
  id: number;
  style: Record<string, string>;
}

const flakes = ref<Snowflake[]>([]);
const flakeCount = 50; // Anzahl der Schneeflocken

onMounted(() => {
  // Erstellt Schneeflocken mit zufälligen Positionen und Geschwindigkeiten
  flakes.value = Array.from({ length: flakeCount }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 3 + 2}s`, // Zwischen 2s und 5s Fallzeit
      animationDelay: `${Math.random() * 5}s`, // Verzögerter Start
      opacity: `${Math.random() * 0.5 + 0.3}`, // Zufällige Transparenz
      fontSize: `${Math.random() * 10 + 10}px` // Größe zwischen 10px und 20px
    }
  }));
});
</script>

<template>
  <div class="snow-container" aria-hidden="true">
    <div
      v-for="flake in flakes"
      :key="flake.id"
      class="snowflake"
      :style="flake.style"
    >
      ❄
    </div>
  </div>
</template>

<style scoped>
.snow-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* WICHTIG: Klicks gehen durch den Schnee durch */
  z-index: 50;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -20px;
  color: #87CEEB; /* Hellblau, damit es auf Weiß sichtbar ist */
  user-select: none;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-20px) translateX(0);
  }
  100% {
    transform: translateY(100vh) translateX(20px); /* Leichte Seitwärtsbewegung */
  }
}
</style>