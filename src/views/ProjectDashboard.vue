<script setup lang="ts">
import 'chart.js/auto';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement);

import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import Chart from 'primevue/chart';
import Card from 'primevue/card';
import Dashboard from '@/components/Dashboard.vue'; 

const { t } = useI18n();
const taskChartData = {
  labels: ['Jan', 'Feb', 'Mär','Apr', 'Mai', 'Jun', 'Jul','Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Aufgaben',
      data: [20,15,16,12,8,13],
      backgroundColor: '#3B82F6',
      borderRadius: 4,
      barThickness: 12,
    },
    {
      label: 'Offene Aufgaben',
      data: [0,2,4,1,0,7],
      backgroundColor: '#F97316',
      borderRadius: 4,
      barThickness: 12,
    },
    {
      label: 'Erledigte Aufgaben',
      data: [20,13,12,11,8,6],
      backgroundColor: '#10B981',
      borderRadius: 4,
      barThickness: 12,
    },
  ],
};

const taskChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#374151', 
        padding: 20,
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    tooltip: {
    backgroundColor: '#f9fafb',
    titleColor: '#111827',
    bodyColor: '#374151',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    titleFont: { weight: 'bold' },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#6b7280', // helleres Grau
      },
      grid: {
        display: false,
      },
      barPercentage: 0.7,
      categoryPercentage: 0.5,
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: '#6b7280',
        stepSize: 5,
      },
      grid: {
        color: '#e5e7eb', // hellgraue Linien
      },
    },
  },
};


const costChartData = {
  labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Kosten (€)',
      data: [800, 950, 700, 1100, 900, 750, 1000, 950, 900, 1100, 1200, 1300],
      fill: false,
      borderColor: '#10b981',
      tension: 0.4
    }
  ]
};

const costChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const upcomingTasks = [
  { title: 'Dokumentation', dueDate: '2025-06-10', status: 'Offen' },
  { title: 'Review Meeting', dueDate: '2025-06-12', status: 'In Bearbeitung' },
  { title: 'Rechnungsfreigabe', dueDate: '2025-06-14', status: 'Erledigt' },
];

const issueChartData = {
  labels: ['Jan', 'Feb', 'Mär','Apr', 'Mai', 'Jun', 'Jul','Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Offene Issues',
      data: [5, 7, 4, 6, 8, 3],
      backgroundColor: '#F59E0B', // Amber
      borderRadius: 4,
      barThickness: 12,
    },
    {
      label: 'In Bearbeitung',
      data: [2, 3, 5, 4, 3, 2],
      backgroundColor: '#3B82F6', // Blau
      borderRadius: 4,
      barThickness: 12,
    },
    {
      label: 'Erledigte Issues',
      data: [10, 8, 9, 11, 7, 10],
      backgroundColor: '#10B981', // Grün
      borderRadius: 4,
      barThickness: 12,
    },
  ],
};

const issueChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#374151',
        padding: 20,
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    tooltip: {
      backgroundColor: '#f9fafb',
      titleColor: '#111827',
      bodyColor: '#374151',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      titleFont: { weight: 'bold' },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#6b7280',
      },
      grid: {
        display: false,
      },
      barPercentage: 0.7,
      categoryPercentage: 0.5,
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: '#6b7280',
        stepSize: 5,
      },
      grid: {
        color: '#e5e7eb',
      },
    },
  },
};

const defectChartData = {
  labels: ['Offen', 'In Bearbeitung', 'Behoben'],
  datasets: [
    {
      data: [8, 5, 14],
      backgroundColor: ['#F87171', '#FBBF24', '#34D399'],
      hoverBackgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      borderWidth: 1,
    }
  ]
};

const defectChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    datalabels: {
      display: true,
      color: '#111827',
      font: {
        weight: 'bold' as const,
        size: 14,
      },
      formatter: (value: number) => value
    }
  }
};

const recentActivities = [
  {
    title: 'Dokumentation abgeschlossen',
    date: '2025-06-04',
    type: 'completed'
  },
  {
    title: 'Status geändert: "Review Meeting"',
    date: '2025-06-03',
    type: 'updated'
  },
  {
    title: 'Neuer Mangel gemeldet',
    date: '2025-06-01',
    type: 'issue'
  },
];


const route = useRoute();
const projectId = route.params.projectId as string;
</script>


<template>
  <main class="p-4">
    <h1 class="text-2xl font-bold mb-6">
      {{ t('projectDashboard.title', [projectId]) }}
    </h1>

    <!-- Verbesserte Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
  <!-- Projekte -->
  <Card class="shadow-lg rounded-xl">
    <template #content>
      <div class="flex items-center gap-4 p-4">
        <div class="bg-blue-100 text-blue-600 rounded-full p-3">
          <i class="pi pi-briefcase text-xl"></i>
        </div>
        <div>
          <p class="text-gray-500 text-sm font-medium">Projekte</p>
          <p class="text-2xl font-bold text-gray-800">6</p>
          <p class="text-sm text-green-600 mt-1">+2 seit letzter Woche</p>
        </div>
      </div>
    </template>
  </Card>

  <!-- Offene Issues -->
  <Card class="shadow-lg rounded-xl">
    <template #content>
      <div class="flex items-center gap-4 p-4">
        <div class="bg-yellow-100 text-yellow-600 rounded-full p-3">
          <i class="pi pi-exclamation-circle text-xl"></i>
        </div>
        <div>
          <p class="text-gray-500 text-sm font-medium">Offene Issues</p>
          <p class="text-2xl font-bold text-gray-800">12</p>
          <p class="text-sm text-red-500 mt-1">-1 seit gestern</p>
        </div>
      </div>
    </template>
  </Card>

  <!-- Abgeschlossene Aufgaben -->
  <Card class="shadow-lg rounded-xl">
    <template #content>
      <div class="flex items-center gap-4 p-4">
        <div class="bg-green-100 text-green-600 rounded-full p-3">
          <i class="pi pi-check-circle text-xl"></i>
        </div>
        <div>
          <p class="text-gray-500 text-sm font-medium">Abgeschlossene Aufgaben</p>
          <p class="text-2xl font-bold text-gray-800">34</p>
          <p class="text-sm text-green-600 mt-1">+5 abgeschlossen</p>
        </div>
      </div>
    </template>
  </Card>
</div>

    <!-- Aufgabenstatus -->
    <Card class="mb-6 p-4">
      <template #title>
        Aufgabenstatus
      </template>
      <template #content>
        <Chart
          type="bar"
          :data="taskChartData"
          :options="taskChartOptions"
          style="height: 300px"
        />
      </template>
    </Card>

    <!-- Recent Activity Feed -->
    <Card class="mb-6 p-4">
      <template #title>
        Letzte Aktivitäten
      </template>
      <template #content>
        <ul class="space-y-4">
          <li
            v-for="(activity, index) in recentActivities"
            :key="index"
            class="flex items-start gap-4"
          >
            <span
              class="h-3 w-3 mt-1 rounded-full"
              :class="{
                'bg-green-500': activity.type === 'completed',
                'bg-yellow-400': activity.type === 'updated',
                'bg-red-500': activity.type === 'issue',
              }"
            ></span>
            <div>
              <p class="text-sm text-gray-800 font-medium">
                {{ activity.title }}
              </p>
              <p class="text-xs text-gray-500">{{ activity.date }}</p>
            </div>
          </li>
        </ul>
      </template>
    </Card>

    <!-- Kostenübersicht -->
    <Card class="mb-6 p-4">
      <template #title>
        Monatliche Kosten
      </template>
      <template #content>
        <Chart
          type="line"
          :data="costChartData"
          :options="costChartOptions"
          style="height: 300px; max-width: 100%;"
        />
      </template>
    </Card>

    <!-- Issue Status Übersicht -->
    <Card class="mb-6 p-4">
      <template #title>
        Issue Status Übersicht
      </template>
      <template #content>
        <Chart
          type="bar"
          :data="issueChartData"
          :options="issueChartOptions"
          style="height: 300px"
        />
      </template>
    </Card>

    <!-- Nächste Fälligkeiten -->
    <Card class="mb-6 p-4">
      <template #title>
        Nächste Fälligkeiten
      </template>
      <template #content>
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-gray-700 text-left">
            <tr>
              <th class="py-2 px-4">Aufgabe</th>
              <th class="py-2 px-4">Fällig am</th>
              <th class="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            <tr v-for="task in upcomingTasks" :key="task.title">
              <td class="py-2 px-4">{{ task.title }}</td>
              <td class="py-2 px-4">{{ task.dueDate }}</td>
              <td class="py-2 px-4">
                <span
                  :class="{
                    'text-red-500 font-semibold': task.status === 'Offen',
                    'text-yellow-500 font-semibold':
                      task.status === 'In Bearbeitung',
                    'text-green-500 font-semibold': task.status === 'Erledigt',
                  }"
                >
                  {{ task.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </Card>

    <!-- Mängelübersicht -->
    <Card class="mb-6 p-4">
      <template #title>
        Mängelübersicht
      </template>
      <template #content>
        <Chart
          type="doughnut"
          :data="defectChartData"
          :options="defectChartOptions"
          :plugins="[ChartDataLabels]"
          style="max-height: 300px; max-width: 400px; margin: auto;"
        />
      </template>
    </Card>
  </main>
</template>
