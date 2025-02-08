<template>
  <div class="card bg-gradient text-primary-content shadow-lg">
    <div class="card-body">
      <div class="flex flex-col gap-4 mb-6">
        <div class="flex justify-between items-center">
          <h3 class="card-title text-xl font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Historical Exchange Rates
          </h3>
        </div>
        <div class="flex flex-wrap gap-4 items-center">
          <div class="join">
            <button 
              v-for="period in predefinedPeriods" 
              :key="period.value"
              class="join-item btn btn-sm"
              :class="{'btn-primary': selectedPeriod === period.value}"
              @click="selectPredefinedPeriod(period.value)"
            >
              {{ period.label }}
            </button>
          </div>
          <div class="divider divider-horizontal">or</div>
          <div class="flex items-center gap-2">
            <div class="join">
              <input 
                type="date" 
                v-model="startDate" 
                class="join-item input input-bordered input-sm w-40"
                :max="endDate"
              />
              <input 
                type="date" 
                v-model="endDate" 
                class="join-item input input-bordered input-sm w-40"
                :min="startDate"
                :max="today"
              />
            </div>
            <button 
              class="btn btn-sm btn-primary" 
              @click="applyCustomDates"
              :disabled="!isValidDateRange"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
      <div class="w-full h-[300px] bg-base-100 rounded-box p-4 shadow-inner relative">
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-base-100/50 backdrop-blur-sm">
          <div class="loading loading-spinner loading-lg text-primary"></div>
        </div>
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js/auto'
import { useRuntimeConfig } from 'nuxt/app';
import { ref, watch, onMounted, computed } from 'vue';

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
const isLoading = ref(false)

const predefinedPeriods = [
  { label: '1W', value: 7 },
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '9M', value: 270 },
]

const today = new Date().toISOString().split('T')[0]
const startDate = ref(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
const endDate = ref(today)
const isCustomRange = ref(false)

const isValidDateRange = computed(() => {
  return startDate.value && endDate.value && startDate.value <= endDate.value
})

const selectPredefinedPeriod = (days: number) => {
  isCustomRange.value = false
  selectedPeriod.value = days
  startDate.value = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  endDate.value = today
}

const applyCustomDates = () => {
  if (!isValidDateRange.value) return
  isCustomRange.value = true
  updateChart()
}

const fetchHistoricalData = async () => {
  isLoading.value = true
  try {
    if (!props.targetCurrencies?.length) return null
    
    const runtimeConfig = useRuntimeConfig()
    const targetParams = props.targetCurrencies
      .map(c => `target=${c.code.toLowerCase()}`)
      .join('&')
    
    const response = await fetch(
      `${runtimeConfig.public.API_URL}/history?base=${props.fromCurrency.code.toLowerCase()}&${targetParams}&start=${startDate.value}&end=${endDate.value}`
    )
    return await response.json()
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

const sortDatesChronologically = (dates: string[]): string[] => {
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}

const createChartDatasets = (dates: string[], data: any) => {
  return props.targetCurrencies.map((currency, index) => ({
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
}

const updateChart = async () => {
  const data = await fetchHistoricalData()
  if (!data) return

  const dates = sortDatesChronologically(Object.keys(data))
  const datasets = createChartDatasets(dates, data)

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
  if (!isCustomRange.value && props.fromCurrency && props.targetCurrencies.length > 0) {
    selectPredefinedPeriod(selectedPeriod.value)
    await updateChart()
  }
}, { deep: true })

onMounted(async () => {
  if (props.fromCurrency && props.targetCurrencies.length > 0) {
    await updateChart()
  }
})

</script>
