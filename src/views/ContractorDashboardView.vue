<script setup lang="ts">
import { ref } from "vue";
import Chart from "primevue/chart";

/* ------------------------------------------------------
 *  GLOBALE KONSTANTEN
 * ----------------------------------------------------*/
const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

/* ------------------------------------------------------
 *  BASIS-CHART-OPTIONEN (für alle Diagramme)
 * ----------------------------------------------------*/
const baseChartOptions = {
  plugins: {legend: { labels: { color: "var(--text-color)" } }},
  scales: {
    x: { ticks: { color: "var(--text-color)" } },
    y: { ticks: { color: "var(--text-color)" } }
  }
};

/* ======================================================
 *  KPI-KARTEN (dynamisch statt 4x Duplikate)
 * ====================================================*/
const kpiCards = ref([
  {
 icon: "pi-folder-open", color: "kpi-blue", title: "Offene Aufträge", value: 4, sub: "+1 seit gestern" 
},
  {
 icon: "pi-spin pi-spinner", color: "kpi-amber", title: "In Bearbeitung", value: 7, sub: "+2 seit letzter Woche" 
},
  {
 icon: "pi-check-circle", color: "kpi-green", title: "Abgeschlossen (Monat)", value: 15, sub: "+5 abgeschlossen" 
},
  {
 icon: "pi-clock", color: "kpi-red", title: "Fälligkeit überschritten", value: 3, sub: "Heute +1" 
}
]);

/* ======================================================
 *  1) BAR-CHART
 * ====================================================*/
const monthlyData = ref({
  labels: MONTHS,
  datasets: [
    {
 label: "Offene Aufträge", backgroundColor: "#ef4444", data: [0,0,0,0,0,0,0,0,0,0,2,7] 
},
    {
 label: "In Bearbeitung", backgroundColor: "#fbbf24", data: [0,1,0,2,1,3,0,0,1,1,3,5] 
},
    {
 label: "Erledigt", backgroundColor: "#22c55e", data: [5,6,8,7,8,9,7,6,5,8,9,9] 
}
  ]
});
const monthlyOptions = ref({ ...baseChartOptions });

/* ======================================================
 *  2) DOUGHNUT-CHART
 * ====================================================*/
const urgencyData = ref({
  labels: ["Hoch", "Mittel", "Niedrig"],
  datasets: [{ data: [3, 7, 10], backgroundColor: ["#ef4444", "#fbbf24", "#22c55e"] }]
});
const urgencyOptions = ref({
  cutout: "60%",
  plugins: {legend: {labels: { color: "var(--text-color)" }}},
  scales: {
    x: { display: false },
    y: { display: false }
  }
});


/* ======================================================
 *  3) FINANZ-LINECHART
 * ====================================================*/
const financeLineData = ref({
  labels: MONTHS,
  datasets: [
    {
      label: "Einnahmen (€)",
      data: [3200,3400,3100,3600,3800,3900,4200,4100,4300,4500,4700,4900],
      borderColor: "#22c55e",
      backgroundColor: "transparent",
      tension: 0.35,
      borderWidth: 3
    },
    {
      label: "Ausgaben (€)",
      data: [2000,2200,2400,2100,2500,2300,2600,2400,2700,2600,2800,3000],
      borderColor: "#ef4444",
      backgroundColor: "transparent",
      tension: 0.35,
      borderWidth: 3
    }
  ]
});

const financeLineOptions = ref({
  ...baseChartOptions,
  maintainAspectRatio: false,
  plugins: {legend: { labels: { color: "var(--text-color)", font: { size: 14 } } }}
});

/* ======================================================
 *  4) LISTEN (Tasks, Kundenanfragen)
 * ====================================================*/
const todayTasks = ref([
  {
 title: "Dokumentation aktualisieren", project: "Projekt A", status: "Offen" 
},
  {
 title: "Baustellenbegehung", project: "Projekt B", status: "In Bearbeitung" 
},
  {
 title: "Rechnung prüfen", project: "Projekt C", status: "Erledigt" 
}
]);

const customerRequests = ref([
  { title: "Klärung Materialbedarf", status: "Offen" },
  { title: "Terminabsprache", status: "In Bearbeitung" }
]);

/* ======================================================
 *  5) RECHNUNGEN (Offen + Überfällig)
 * ====================================================*/
const invoicesOpen = ref([
  {
 id: "RE-2025-001", customer: "Müller Bau GmbH", amount: 750, due: "2025-12-10", status: "offen" 
},
  {
 id: "RE-2025-003", customer: "Schneider Immobilien", amount: 1250, due: "2025-12-15", status: "offen" 
}
]);

const invoicesOverdue = ref([
  {
 id: "RE-2025-002", customer: "Hoch & Tief AG", amount: 900, due: "2025-11-28", status: "überfällig" 
},
  {
 id: "RE-2025-004", customer: "BauConcept KG", amount: 450, due: "2025-11-25", status: "überfällig" 
}
]);
</script>

<template>
  <main class="p-6 lg:p-10">
    <!-- TITLE -->
    <h1 class="text-4xl font-bold mb-2">Auftragnehmer Dashboard</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-8">
      Übersicht über laufende Arbeiten, Dringlichkeiten & finanzielle Kennzahlen
    </p>

    <!-- KPI SECTION (dynamisch) -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div v-for="kpi in kpiCards" :key="kpi.title" class="kpi-card">
        <div class="kpi-icon" :class="kpi.color">
          <i :class="'pi ' + kpi.icon"></i>
        </div>
        <div>
          <p class="kpi-title">{{ kpi.title }}</p>
          <p class="kpi-value">{{ kpi.value }}</p>
          <p class="kpi-sub">{{ kpi.sub }}</p>
        </div>
      </div>
    </section>

    <!-- BAR + DOUGHNUT -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div class="card p-6">
        <h2 class="card-title">Auftragsstatus nach Monaten</h2>
        <Chart type="bar" :data="monthlyData" :options="monthlyOptions" style="height: 330px;" />
      </div>

      <div class="card p-6">
        <h2 class="card-title">Dringlichkeit der Aufträge</h2>
        <Chart type="doughnut" :data="urgencyData" :options="urgencyOptions" style="height: 330px;" />
      </div>
    </section>

    <!-- FINANCE SECTION -->
    <section class="finance-card mb-16">
      <h2 class="finance-title">Finanzentwicklung – Einnahmen & Ausgaben</h2>

      <div class="finance-legend">
        <div class="finance-legend-item">
          <span class="finance-dot finance-dot-income" /> Einnahmen (€)
        </div>
        <div class="finance-legend-item">
          <span class="finance-dot finance-dot-expense" /> Ausgaben (€)
        </div>
      </div>

      <Chart type="line" :data="financeLineData" :options="financeLineOptions" style="height: 340px;" />
    </section>

    <!-- LISTEN -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <!-- TASK LIST -->
      <div class="card p-6">
        <h2 class="card-title mb-4">Heute fällige Aufgaben</h2>
        <ul class="space-y-3">
          <li v-for="task in todayTasks" :key="task.title" class="flex justify-between border-b pb-2">
            <span>{{ task.title }} — <span class="text-gray-400">{{ task.project }}</span></span>
            <span
                :class="{
                'text-red-500': task.status === 'Offen',
                'text-yellow-500': task.status === 'In Bearbeitung',
                'text-green-500': task.status === 'Erledigt'
              }"
            >{{ task.status }}</span>
          </li>
        </ul>
      </div>

      <!-- CUSTOMER REQUESTS -->
      <div class="card p-6">
        <h2 class="card-title mb-4">Offene Kundenanfragen</h2>
        <ul class="space-y-3">
          <li v-for="req in customerRequests" :key="req.title" class="flex justify-between border-b pb-2">
            <span>{{ req.title }}</span>
            <span
                :class="{
                'text-red-500': req.status === 'Offen',
                'text-yellow-500': req.status === 'In Bearbeitung'
              }"
            >{{ req.status }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- FINANZÜBERSICHT -->
    <section class="card p-6 mb-16">
      <h2 class="card-title mb-6">Finanzübersicht</h2>

      <!-- Offene Rechnungen -->
      <h3 class="text-xl font-semibold mb-3">Offene Rechnungen</h3>
      <table class="invoice-table">
        <thead>
        <tr>
          <th>Rechnung</th>
          <th>Kunde</th>
          <th>Fällig am</th>
          <th>Betrag</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="inv in invoicesOpen" :key="inv.id">
          <td>{{ inv.id }}</td>
          <td>{{ inv.customer }}</td>
          <td>{{ inv.due }}</td>
          <td>{{ inv.amount }} €</td>
          <td><span class="status-pill status-open">Offen</span></td>
        </tr>
        </tbody>
      </table>

      <!-- Überfällige Rechnungen -->
      <h3 class="text-xl font-semibold mt-10 mb-3">Überfällige Rechnungen</h3>
      <table class="invoice-table">
        <thead>
        <tr>
          <th>Rechnung</th>
          <th>Kunde</th>
          <th>Überfällig seit</th>
          <th>Betrag</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="inv in invoicesOverdue" :key="inv.id">
          <td>{{ inv.id }}</td>
          <td>{{ inv.customer }}</td>
          <td>{{ inv.due }}</td>
          <td>{{ inv.amount }} €</td>
          <td><span class="status-pill status-overdue">Überfällig</span></td>
        </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style>
/* ------------------------------------------------------
 *  Zentrale Farbvariablen
 * ---------------------------------------------------- */

:root {
  --blue: #3b82f6;
  --green: #22c55e;
  --red: #ef4444;
  --amber: #f59e0b;
  --card-bg: white;
  --card-bg-dark: #1f2937;
  --shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  --shadow-dark: 0 4px 12px rgb(0 0 0 / 0.35);
}

/* ------------------------------------------------------
 *  CARD BASE
 * ---------------------------------------------------- */
.card {
  background: var(--card-bg);
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
  transition: 0.2s ease;
}
.app-dark .card {
  background: var(--card-bg-dark);
  box-shadow: var(--shadow-dark);
}

.card:hover {
  transform: translateY(-2px);
}

.card:hover {
  box-shadow: 0 8px 25px rgb(0 0 0 / 0.18);
}

.card-title {
  font-size: 1.25rem;
}

.card-title {
  font-weight: 600;
}

.card-title {
  margin-bottom: 1rem;
}

/* ------------------------------------------------------
 * KPI CARDS
 * ---------------------------------------------------- */
.kpi-card {
  background: var(--card-bg);
}

.kpi-card {
  border-radius: 0.75rem;
}

.kpi-card {
  padding: 1.5rem;
}

.kpi-card {
  box-shadow: var(--shadow);
}

.kpi-card {
  display: flex;
}

.kpi-card {
  gap: 1.2rem;
}

.kpi-card {
  align-items: center;
}

.app-dark .kpi-card {
  background: var(--card-bg-dark);
}

.kpi-icon {
  width: 54px;
}

.kpi-icon {
  height: 54px;
}

.kpi-icon {
  border-radius: 14px;
}

.kpi-icon {
  display: flex;
}

.kpi-icon {
  align-items: center;
}

.kpi-icon {
  justify-content: center;
}

.kpi-icon {
  font-size: 26px;
}

.kpi-icon {
  color: white;
}

.kpi-blue {
  background: var(--blue);
}

.kpi-green {
  background: var(--green);
}

.kpi-red {
  background: var(--red);
}

.kpi-amber {
  background: var(--amber);
}

.kpi-title {
  font-size: .9rem;
}

.kpi-title {
  color: #6b7280;
}

.kpi-title {
  margin-bottom: .25rem;
}

.kpi-value {
  font-size: 2rem;
}

.kpi-value {
  font-weight: 700;
}

.kpi-sub {
  font-size: .75rem;
}

.kpi-sub {
  color: #9ca3af;
}

/* ------------------------------------------------------
 * INVOICE TABLE
 * ---------------------------------------------------- */
.invoice-table {
  width: 100%;
}

.invoice-table {
  border-collapse: separate;
}

.invoice-table {
  border-spacing: 0 8px;
}

.invoice-table th {
  text-align: left;
}

.invoice-table th {
  padding: 8px 10px;
}

.invoice-table th {
  font-size: 0.9rem;
}

.invoice-table th {
  color: #6b7280;
}

.invoice-table td {
  background: #f9fafb;
}

.invoice-table td {
  padding: 14px 10px;
}

.invoice-table td {
  border-radius: 8px;
}

.invoice-table td {
  font-size: 0.95rem;
}

.app-dark .invoice-table td {
  background: #374151;
}

.app-dark .invoice-table td {
  color: #e5e7eb;
}

.status-pill {
  padding: 4px 10px;
}

.status-pill {
  font-size: 0.75rem;
}

.status-pill {
  border-radius: 6px;
}

.status-pill {
  font-weight: 600;
}

.status-open {
  background: #dbeafe;
}

.status-open {
  color: #1e40af;
}

.status-overdue {
  background: #fee2e2;
}

.status-overdue {
  color: #991b1b;
}

.app-dark .status-open {
  background: #1e3a8a;
}

.app-dark .status-open {
  color: #bfdbfe;
}

.app-dark .status-overdue {
  background: #7f1d1d;
}

.app-dark .status-overdue {
  color: #fecaca;
}

/* ------------------------------------------------------
 * FINANCE SECTION
 * ---------------------------------------------------- */
.finance-card {
  padding: 1.5rem;
}

.finance-card {
  border-radius: .75rem;
}

.finance-card {
  background: var(--card-bg);
}

.finance-card {
  box-shadow: var(--shadow);
}

.app-dark .finance-card {
  background: var(--card-bg-dark);
}

.app-dark .finance-card {
  box-shadow: var(--shadow-dark);
}

.finance-title {
  font-size: 1.3rem;
}

.finance-title {
  font-weight: 600;
}

.finance-title {
  margin-bottom: 1rem;
}

.finance-legend {
  display: flex;
}

.finance-legend {
  gap: 1.5rem;
}

.finance-legend {
  margin-bottom: 1rem;
}

.finance-legend {
  font-size: 0.9rem;
}

.finance-legend {
  align-items: center;
}

.finance-dot {
  width: 14px;
}

.finance-dot {
  height: 14px;
}

.finance-dot {
  border-radius: 4px;
}

.finance-dot-income {
  background: var(--green);
}

.finance-dot-expense {
  background: var(--red);
}
</style>
