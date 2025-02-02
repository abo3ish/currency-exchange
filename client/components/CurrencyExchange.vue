<template>
  <div>
    <CurrencyExchangeInput
      :currencyOptions="currencyOptions"
      v-model:fromCurrency="fromCurrency"
      v-model:targetCurrencies="targetCurrencies"
      v-model:amount="amount"
      v-model:convertedAmounts="convertedAmounts"
      :exchangeRates="exchangeRates"
      @fromAmountChange="handleFromAmountChange"
    />
  </div>
</template>

<script setup lang="ts">
import {currencyList} from '../static/currencies'

interface Currency {
  code: string;
  name: string;
}

const emit = defineEmits<{
  'update:fromCurrency': [value: Currency];
  'update:targetCurrencies': [value: Currency[]];
}>()

const currencyOptions = computed(() => 
  Object.entries(currencyList).map(([code, name]) => ({
    code: code.toUpperCase(),
    name
  }))
)

// Initialize amount with '1' instead of empty string
const amount = ref('1')
const fromCurrency = ref<Currency>(currencyOptions.value.find(c => c.code === 'USD') || { code: 'USD', name: 'US Dollar' })
const targetCurrencies = ref<Currency[]>([
  currencyOptions.value.find(c => c.code === 'EUR') || { code: 'EUR', name: 'Euro' },
  currencyOptions.value.find(c => c.code === 'GBP') || { code: 'GBP', name: 'British Pound' },
//   currencyOptions.value.find(c => c.code === 'JPY') || { code: 'JPY', name: 'Japanese Yen' },
])
const convertedAmounts = ref<string[]>(new Array(targetCurrencies.value.length).fill(''))
const exchangeRates = ref<(string | null)[]>(new Array(targetCurrencies.value.length).fill(null))

const convertCurrency = async () => {
  try {
    const runtimeConfig = useRuntimeConfig()
    const response = await fetch(`${runtimeConfig.public.API_URL}/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(amount.value),
        from: fromCurrency.value.code.toLowerCase(),
        to: targetCurrencies.value.map(c => c.code.toLowerCase()),
      }),
    })
    const data = await response.json()
    
    data.results.forEach((result, index) => {
      convertedAmounts.value[index] = result.result.toString()
      exchangeRates.value[index] = (result.result / Number(amount.value)).toFixed(6)
    })
  } catch (error) {
    console.error('Error converting currency:', error)
  }
}

const handleFromAmountChange = async () => {
  if (amount.value) {
    await convertCurrency()
  } else {
    convertedAmounts.value = targetCurrencies.value.map(() => '')
    exchangeRates.value = targetCurrencies.value.map(() => null)
  }
}

// Watch for changes in currencies or amount
watch([fromCurrency, targetCurrencies], async () => {
  if (amount.value) {
    await handleFromAmountChange()
  }
}, { deep: true })

// Add watcher to emit target currencies changes
watch(targetCurrencies, (newVal) => {
  emit('update:targetCurrencies', newVal)
}, { deep: true })

// Add onMounted to trigger initial conversion
onMounted(() => {
  handleFromAmountChange()
})
</script>
