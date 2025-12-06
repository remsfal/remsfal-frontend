
<script setup lang="ts">
import { ref } from "vue";
import Chart from "primevue/chart";

/* ---------- KPI DATEN ---------- */
const kpi = ref({
  open: 4,
  progress: 7,
  done: 15,
  overdue: 3,
});

/* ---------- BAR CHART ---------- */
const monthlyData = ref({
  labels: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  datasets: [
    {
 label: "Offene Aufträge", backgroundColor: "#ef4444", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 7] 
},
    {
 label: "In Bearbeitung", backgroundColor: "#fbbf24", data: [0, 1, 0, 2, 1, 3, 0, 0, 1, 1, 3, 5] 
},
    {
 label: "Erledigt", backgroundColor: "#22c55e", data: [5, 6, 8, 7, 8, 9, 7, 6, 5, 8, 9, 9] 
},
  ]
});

const monthlyOptions = ref({
  plugins: { legend: { labels: { color: "var(--text-color)" } } },
  scales: { x: { ticks: { color: "var(--text-color)" } }, y: { ticks: { color: "var(--text-color)" } } }
});

/* ---------- DOUGHNUT CHART ---------- */
const urgencyData = ref({
  labels: ["Hoch", "Mittel", "Niedrig"],
  datasets: [{ data: [3, 7, 10], backgroundColor: ["#ef4444", "#fbbf24", "#22c55e"] }]
});

const urgencyOptions = ref({
  cutout: "60%",
  plugins: { legend: { labels: { color: "var(--text-color)" } } }
});

/* ------------------------------------------------------
 *  FINANZ-LINECHART – Einnahmen & Ausgaben
 * ----------------------------------------------------*/
const financeLineData = ref({
  labels: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  datasets: [
    {
      label: "Einnahmen (€)",
      data: [3200, 3400, 3100, 3600, 3800, 3900, 4200, 4100, 4300, 4500, 4700, 4900],
      borderColor: "#22c55e",        // Grün
      backgroundColor: "transparent",
      tension: 0.35,
      borderWidth: 3
    },
    {
      label: "Ausgaben (€)",
      data: [2000, 2200, 2400, 2100, 2500, 2300, 2600, 2400, 2700, 2600, 2800, 3000],
      borderColor: "#ef4444",        // Rot
      backgroundColor: "transparent",
      tension: 0.35,
      borderWidth: 3
    }
  ]
});

const financeLineOptions = ref({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "var(--text-color)",
        font: { size: 14 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: "var(--text-color)" },
      grid: { color: "rgba(150,150,150,0.1)" }
    },
    y: {
      ticks: { color: "var(--text-color)" },
      grid: { color: "rgba(150,150,150,0.1)" }
    }
  }
});

/* ---------- LISTEN ---------- */
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
  { title: "Terminabsprache", status: "In Bearbeitung" },
]);

/* ------------------------------------------------------
 * 7) Rechnungen – Offene & Überfällige
 * ----------------------------------------------------*/
const invoicesOpen = ref([
  {
    id: "RE-2025-001",
    customer: "Müller Bau GmbH",
    amount: 750,
    due: "2025-12-10",
    status: "offen"
  },
  {
    id: "RE-2025-003",
    customer: "Schneider Immobilien",
    amount: 1250,
    due: "2025-12-15",
    status: "offen"
  }
]);

const invoicesOverdue = ref([
  {
    id: "RE-2025-002",
    customer: "Hoch & Tief AG",
    amount: 900,
    due: "2025-11-28",
    status: "überfällig"
  },
  {
    id: "RE-2025-004",
    customer: "BauConcept KG",
    amount: 450,
    due: "2025-11-25",
    status: "überfällig"
  }
]);
</script>

<template>
  <main class="p-6 lg:p-10">
    <!-- TITLE -->
    <h1 class="text-4xl font-bold mb-2">
      Auftragnehmer Dashboard
    </h1>
    <p class="text-gray-500 dark:text-gray-400 mb-8">
      Übersicht über laufende Arbeiten, Dringlichkeiten & finanzielle Kennzahlen
    </p>

    <!-- KPI SECTION -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div class="kpi-card">
        <div class="kpi-icon kpi-blue">
          <i class="pi pi-folder-open"></i>
        </div>
        <div>
          <p class="kpi-title">Offene Aufträge</p>
          <p class="kpi-value">4</p>
          <p class="kpi-sub">+1 seit gestern</p>
        </div>
      </div>


      <div class="kpi-card">
        <div class="kpi-icon kpi-amber">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <div>
          <p class="kpi-title">In Bearbeitung</p>
          <p class="kpi-value">7</p>
          <p class="kpi-sub">+2 seit letzter Woche</p>
        </div>
      </div>


      <div class="kpi-card">
        <div class="kpi-icon kpi-green">
          <i class="pi pi-check-circle"></i>
        </div>
        <div>
          <p class="kpi-title">Abgeschlossen (Monat)</p>
          <p class="kpi-value">15</p>
          <p class="kpi-sub">+5 abgeschlossen</p>
        </div>
      </div>


      <div class="kpi-card">
        <div class="kpi-icon kpi-red">
          <i class="pi pi-clock"></i>
        </div>
        <div>
          <p class="kpi-title">Fälligkeit überschritten</p>
          <p class="kpi-value">3</p>
          <p class="kpi-sub">Heute +1</p>
        </div>
      </div>
    </section>

    <!-- BAR + DOUGHNUT -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div class="card p-6">
        <h2 class="card-title">
          Auftragsstatus nach Monaten
        </h2>
        <Chart type="bar" :data="monthlyData" :options="monthlyOptions" style="height: 330px;" />
      </div>

      <div class="card p-6">
        <h2 class="card-title">
          Dringlichkeit der Aufträge
        </h2>
        <Chart type="doughnut" :data="urgencyData" :options="urgencyOptions" style="height: 330px;" />
      </div>
    </section>

    <!-- FINANCE SECTION -->
    <section class="finance-card mb-16">
      <h2 class="finance-title">
        Finanzentwicklung – Einnahmen & Ausgaben
      </h2>

      <div class="finance-legend">
        <div class="finance-legend-item">
          <span class="finance-dot finance-dot-income" /> Einnahmen (€)
        </div>
        <div class="finance-legend-item">
          <span class="finance-dot finance-dot-expense" /> Ausgaben (€)
        </div>
      </div>

      <Chart
        type="line"
        :data="financeLineData"
        :options="financeLineOptions"
        style="height: 340px;"
      />
    </section>

    <!-- LISTEN -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div class="card p-6">
        <h2 class="card-title mb-4">
          Heute fällige Aufgaben
        </h2>
        <ul class="space-y-3">
          <li v-for="task in todayTasks" :key="task.title" class="flex justify-between border-b pb-2">
            <span>{{ task.title }} — <span class="text-gray-400">{{ task.project }}</span></span>
            <span
              :class="{
                'text-red-500': task.status === 'Offen',
                'text-yellow-500': task.status === 'In Bearbeitung',
                'text-green-500': task.status === 'Erledigt'
              }"
            >
              {{ task.status }}
            </span>
          </li>
        </ul>
      </div>

      <div class="card p-6">
        <h2 class="card-title mb-4">
          Offene Kundenanfragen
        </h2>
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

    <!-- ========================================================= -->
    <!--  FINANZÜBERSICHT -->
    <!-- ========================================================= -->
    <section class="card p-6 mb-16">
      <h2 class="card-title mb-6">
        Finanzübersicht
      </h2>

      <!-- Offene Rechnungen -->
      <h3 class="text-xl font-semibold mb-3">
        Offene Rechnungen
      </h3>
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
      <h3 class="text-xl font-semibold mt-10 mb-3">
        Überfällige Rechnungen
      </h3>
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
 * GLOBAL CARD STYLE
 * ----------------------------------------------------*/
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: 0.2s ease;
  padding: 1.5rem;
}

.app-dark .card {
  background: #1f2937;
  box-shadow: 0 4px 12px rgba(0,0,0,0.35);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.18);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}


/* ------------------------------------------------------
 * KPI CARDS
 * ----------------------------------------------------*/
.kpi-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  display: flex;
  gap: 1.2rem;
  align-items: center;
}

.app-dark .kpi-card {
  background: #1f2937;
}

/* --- ICON CONTAINER --- */
.kpi-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;     /* Icon Size */
  color: white;
}

/* farben */
.kpi-blue  { background: #3b82f6; } /* blue-500 */
.kpi-green { background: #22c55e; } /* green-500 */
.kpi-red   { background: #ef4444; } /* red-500 */
.kpi-amber { background: #f59e0b; } /* amber-500 */

/* dark mode */
.app-dark .kpi-blue  { background: #1e3a8a; }
.app-dark .kpi-green { background: #166534; }
.app-dark .kpi-red   { background: #7f1d1d; }
.app-dark .kpi-amber { background: #713f12; }

/* text */
.kpi-title {
  font-size: .9rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.app-dark .kpi-title { color: #9ca3af; }

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0;
}

.kpi-sub {
  font-size: .75rem;
  color: #9ca3af;
  margin-top: 0.1rem;
}

.app-dark .kpi-sub { color: #d1d5db; }

/* ------------------------------------------------------
 * TASK TABLE
 * ----------------------------------------------------*/
.task-table { border-collapse: collapse; }

.task-table th {
  text-align: left;
  padding-bottom: 8px;
  font-size: 0.9rem;
  color: #6b7280;
}

.task-table td {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.app-dark .task-table td {
  border-color: #374151;
}

.app-dark .task-table th {
  color: #9ca3af;
}


/* ------------------------------------------------------
 * FINANCE TABLE DESIGN
 * ----------------------------------------------------*/
.finance-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.finance-table th {
  text-align: left;
  font-size: 0.85rem;
  color: #6b7280;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.app-dark .finance-table th {
  color: #9ca3af;
  border-color: #374151;
}

.finance-table td {
  padding: 10px 4px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.95rem;
}

.app-dark .finance-table td {
  border-color: #374151;
}


/* ------------------------------------------------------
 * INVOICE TABLE
 * ----------------------------------------------------*/
.invoice-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}

.invoice-table th {
  text-align: left;
  padding: 8px 10px;
  font-size: 0.9rem;
  color: #6b7280;
}

.invoice-table td {
  background: #f9fafb;
  padding: 14px 10px;
  border-radius: 8px;
  font-size: 0.95rem;
}

.app-dark .invoice-table td {
  background: #374151;
  color: #e5e7eb;
}

.status-pill {
  padding: 4px 10px;
  font-size: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
}

.status-open {
  background: #dbeafe;
  color: #1e40af;
}

.status-overdue {
  background: #fee2e2;
  color: #991b1b;
}

.app-dark .status-open {
  background: #1e3a8a;
  color: #bfdbfe;
}

.app-dark .status-overdue {
  background: #7f1d1d;
  color: #fecaca;
}


/* ------------------------------------------------------
 * FINANCE CHART
 * ----------------------------------------------------*/
.finance-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.app-dark .finance-card {
  background: #1f2937;
  box-shadow: 0 4px 12px rgba(0,0,0,0.35);
}

.finance-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.app-dark .finance-title {
  color: #e5e7eb;
}

/* Chart legend */
.finance-legend {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  align-items: center;
}

.finance-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.finance-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: block;
}

.finance-dot-income { background: #22c55e; }
.finance-dot-expense { background: #ef4444; }

/* CSS Vars */
:root {
  --chart-text: #1f2937;
  --chart-grid: rgba(0,0,0,0.1);
}

.app-dark {
  --chart-text: #e5e7eb;
  --chart-grid: rgba(255,255,255,0.15);
}
</style>
