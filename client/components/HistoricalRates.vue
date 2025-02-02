<template>
  <div class="card bg-gradient text-primary-content shadow-lg">
    <div class="card-body">
      <div class="flex justify-between items-center mb-6">
        <h3 class="card-title text-xl font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Historical Exchange Rates
        </h3>
        <select v-model="selectedPeriod" class="select select-sm select-bordered">
          <option value="7">1 Week</option>
          <option value="30">1 Month</option>
          <option value="90">3 Months</option>
          <option value="180">6 Months</option>
          <option value="270">9 Months</option>
          <!-- <option value="365">1 Year</option> -->
        </select>
      </div>
      <div class="w-full h-[300px] bg-base-100 rounded-box p-4 shadow-inner">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js/auto'
import { useRuntimeConfig } from 'nuxt/app';
import { ref, watch, onMounted } from 'vue';

interface Currency {
  code: string;
  name: string;
}

const props = defineProps<{
  fromCurrency: Currency;
  targetCurrencies: Currency[];
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// Update chart colors to match theme
const chartColors = [
  'hsl(338, 100%, 48%)', // Secondary
  'hsl(135, 100%, 40%)', // Accent
  'hsl(222, 100%, 61%)', // Primary
  '#FF6B6B',            // Coral
  '#4ECDC4'             // Turquoise
]

const selectedPeriod = ref(30)

const fetchHistoricalData = async () => {
  try {
    if (!props.targetCurrencies?.length) return null;
    
    const runtimeConfig = useRuntimeConfig()
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - selectedPeriod.value * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const targetParams = props.targetCurrencies
      .map(c => `target=${c.code.toLowerCase()}`)
      .join('&')
    
    const response = await fetch(
      `${runtimeConfig.public.API_URL}/history?base=${props.fromCurrency.code.toLowerCase()}&${targetParams}&start=${startDate}&end=${endDate}`
    )
    return await response.json()
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return null
  }
}

const updateChart = async () => {
  const data = await fetchHistoricalData()
  if (!data) return

  const dates = Object.keys(data)
  const datasets = props.targetCurrencies.map((currency, index) => ({
    label: `${props.fromCurrency.code} to ${currency.code}`,
    data: dates.map(date => {
      const rateData = data[date].rates.find((r: any) => r.to === currency.code.toLowerCase())
      return rateData ? rateData.rate : null
    }),
    borderColor: chartColors[index % chartColors.length],
    tension: 0.4,
    fill: false,
    pointRadius: 0,
    borderWidth: 2
  }))

  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value?.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'line',
    data: { labels: dates, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: window.innerWidth > 640,
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content')
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content')
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
          }
        },
        y: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content')
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
          }
        }
      }
    }
  })
}

watch([() => props.fromCurrency, () => props.targetCurrencies, selectedPeriod], async () => {
  if (props.fromCurrency && props.targetCurrencies.length > 0) {
    await updateChart()
  }
}, { deep: true })

onMounted(async () => {
  if (props.fromCurrency && props.targetCurrencies.length > 0) {
    await updateChart()
  }
})

</script>
