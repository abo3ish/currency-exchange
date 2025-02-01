<template>
  <div class="mt-8">
    <h3 class="text-xl font-semibold mb-4">Historical Exchange Rates</h3>
    <div class="w-full h-[300px]">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Chart } from 'chart.js/auto'
import { useRuntimeConfig } from '#app'

const props = defineProps({
  fromCurrency: {
    type: Object,
    required: true
  },
  toCurrency: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

const fetchHistoricalData = async () => {
  try {
    const runtimeConfig = useRuntimeConfig()
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const response = await fetch(`${runtimeConfig.public.API_URL}/history?base=${props.fromCurrency.code.toLowerCase()}&target=${props.toCurrency.code.toLowerCase()}&start=${startDate}&end=${endDate}`)
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return null
  }
}

const updateChart = async () => {
  const data = await fetchHistoricalData()
  if (!data) return

  const dates = Object.keys(data)
  const rates = dates.map(date => data[date].rates[0].rate)

  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `${props.fromCurrency.code} to ${props.toCurrency.code}`,
        data: rates,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content')
          }
        }
      },
      scales: {
        x: {
          ticks: {
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

watch([() => props.fromCurrency, () => props.toCurrency], async () => {
  await updateChart()
}, { deep: true })

onMounted(async () => {
  await updateChart()
})
</script>
