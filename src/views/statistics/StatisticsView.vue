<template>
  <div class="px-8 py-8">

    <h1 class="text-3xl font-extrabold text-gray-800 mb-2 title-bold">Insurance Plan Statistics</h1>
    <p class="text-md text-gray-600 font-semibold">View the number of insurance plans ordered over time</p>

    <hr class="border-gray-200 custom-margin" />

    <div class="card">
      <div class="filters">
        <div class="filter">
          <label for="period">Time Period</label>
          <select id="period" v-model.number="period">
            <option v-for="p in periodOptions" :key="p" :value="p">
              {{ p }} Months
            </option>
          </select>
        </div>

        <div class="filter">
          <label for="service">Service</label>
          <select id="service" v-model="service">
            <option v-for="s in serviceOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="chart-wrapper">
        <div v-if="store.chartLoading" class="state">Loading chart...</div>
        <div v-else-if="store.chartError" class="state error">
          {{ store.chartError }}
        </div>
        <canvas v-show="!store.chartLoading && !store.chartError" ref="canvasEl"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useStatisticsStore } from '@/stores/statistics/statistics.stores'

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip,
} from 'chart.js'
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip
)

const store = useStatisticsStore()

const periodOptions = [3, 6, 12] as const
const serviceOptions = [
  { label: 'All Services', value: '' }, // kirim empty string untuk "all"
  { label: 'Accommodation', value: 'ACCOMMODATION' },
  { label: 'Flight', value: 'FLIGHT' },
  { label: 'Tour Package', value: 'TOUR_PACKAGE' },
  { label: 'Rental', value: 'RENTALS' },
] as const

const period = ref<number>(3)
const service = ref<string>('')

const serviceLabel = computed(
  () => serviceOptions.find((o) => o.value === service.value)?.label ?? 'All Services'
)

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function renderChart(labels: string[], series: number[]) {
  if (!canvasEl.value) return
  if (chart) {
    chart.destroy()
    chart = null
  }

  chart = new Chart(canvasEl.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Insurance Plans Ordered',
          data: series.map((n) => Number(n)),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.15)',
          pointBackgroundColor: '#3b82f6',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: `Insurance Plans Ordered Over Time (${period.value} Months, ${serviceLabel.value})`,
        },
        tooltip: { intersect: false, mode: 'index' as const },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Number of Insurance Plans Ordered' },
          ticks: { precision: 0 },
        },
        x: {
          title: { display: true, text: 'Time (Months)' },
        },
      },
    },
  })
}

async function load() {
  const resp = await store.fetchChartData(period.value, service.value)
  if (resp) {
    renderChart(resp.labels, resp.data)
  }
}

onMounted(load)
watch([period, service], load)

onUnmounted(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped>
.title-bold { font-weight: 800; }
.stats-page {
  display: grid;
  gap: 8px;
}
.title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.subtitle {
  color: #6b7280;
  margin: -6px 0 8px;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.filter {
  display: grid;
  gap: 6px;
}
.filter label {
  font-size: 12px;
  color: #374151;
}
.filter select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
}
.chart-wrapper {
  height: 360px;
  position: relative;
}
.state {
  display: grid;
  height: 100%;
  place-items: center;
  color: #6b7280;
}
.state.error {
  color: #b91c1c;
}
.custom-margin { margin-top: 20px; margin-bottom: 20px; }
</style>
