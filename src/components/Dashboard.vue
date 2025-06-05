<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-semibold">Projekt Dashboard</h1>

    <!-- 1. Projektüberblick (Summary Cards) -->
    <div class="grid grid-cols-3 gap-4">
      <SummaryCard title="Projekte" value="6" />
      <SummaryCard title="Offene Issues" value="12" />
      <SummaryCard title="Abgeschlossene Aufgaben" value="34" />
    </div>

    <!-- 2. Aufgabenstatus (Task Progress Chart) -->
    <Card title="Aufgabenstatus">
      <Chart type="bar" :data="taskChartData" :options="chartOptions" />
    </Card>

    <!-- 3. Letzte Aktivitäten -->
    <Card title="Letzte Aktivitäten">
      <ul class="list-disc pl-6">
        <li>Projekt A wurde bearbeitet</li>
        <li>Neuer Mangel gemeldet</li>
        <li>Aufgabe X abgeschlossen</li>
      </ul>
    </Card>

    <!-- 4. Nächste Fälligkeiten -->
    <Card title="Nächste Fälligkeiten">
      <ul>
        <li>🔔 Aufgabe Z – fällig am 10.06.2025</li>
        <li>🔔 Mangel B – fällig am 12.06.2025</li>
      </ul>
    </Card>

    <!-- 5. Mängelübersicht -->
    <Card title="Mängelübersicht">
      <Chart type="pie" :data="defectData" />
    </Card>

    <!-- 6. Monatliche Kosten (Line Chart) -->
    <Card title="Monatliche Kosten">
      <Chart type="line" :data="costData" :options="chartOptions" />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Chart from 'primevue/chart'
import Card from 'primevue/card'
import SummaryCard from "@/components/SummaryCard.vue";

// Beispiel-Daten
const taskChartData = {
  labels: ['Offen', 'In Bearbeitung', 'Erledigt'],
  datasets: [{ label: 'Tasks', data: [10, 5, 20], backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'] }]
}

const defectData = {
  labels: ['Offen', 'In Bearbeitung', 'Abgeschlossen'],
  datasets: [{ data: [6, 3, 10], backgroundColor: ['#ef4444', '#facc15', '#22c55e'] }]
}

const costData = {
  labels: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  datasets: [{ label: 'Kosten (€)', data: [800, 950, 700, 1100, 900, 750, 1000, 950, 900, 1100, 1200, 1300], fill: false, borderColor: '#10b981' }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>
