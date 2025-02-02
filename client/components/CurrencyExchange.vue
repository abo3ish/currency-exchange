<template>
  <div>
    <CurrencyExchangeInput
      :currencyOptions="currencyOptions"
      :fromCurrency="fromCurrency"
      :targetCurrencies="targetCurrencies"
      v-model:amount="amount"
      v-model:convertedAmounts="convertedAmounts"
      :exchangeRates="exchangeRates"
      @fromAmountChange="handleFromAmountChange"
      @update:fromCurrency="$emit('update:fromCurrency', $event)"
      @update:targetCurrencies="handleTargetCurrenciesUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {currencyList} from '../static/currencies'
import { useRuntimeConfig } from 'nuxt/app';

interface Currency {
  code: string;
  name: string;
}

const emit = defineEmits<{
  'update:fromCurrency': [value: Currency];
  'update:targetCurrencies': [value: Currency[]];
}>()

const props = defineProps<{
  fromCurrency: Currency;
  targetCurrencies: Currency[];
}>()

const currencyOptions = computed(() => 
  Object.entries(currencyList).map(([code, name]) => ({
    code: code.toUpperCase(),
    name
  }))
)

// Initialize amount with '1' instead of empty string
const amount = ref('1')
const convertedAmounts = ref<string[]>(new Array(props.targetCurrencies.length).fill(''))
const exchangeRates = ref<(string | null)[]>(new Array(props.targetCurrencies.length).fill(null))

const convertCurrency = async () => {
  try {
    if (!props.targetCurrencies.length) return;
    
    const runtimeConfig = useRuntimeConfig()
    const response = await fetch(`${runtimeConfig.public.API_URL}/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(amount.value),
        from: props.fromCurrency.code.toLowerCase(),
        to: props.targetCurrencies.map(c => c.code.toLowerCase()),
      }),
    })
    const data = await response.json()
    
    // Reset arrays to match current target currencies length
    convertedAmounts.value = new Array(props.targetCurrencies.length).fill('');
    exchangeRates.value = new Array(props.targetCurrencies.length).fill(null);
    
    data.results.forEach((result: { result: number; }, index: number) => {
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
    convertedAmounts.value = props.targetCurrencies.map(() => '')
    exchangeRates.value = props.targetCurrencies.map(() => null)
  }
}

const handleTargetCurrenciesUpdate = (newTargets: Currency[]) => {
  // Resize arrays to match new target currencies length
  convertedAmounts.value = convertedAmounts.value.slice(0, newTargets.length);
  exchangeRates.value = exchangeRates.value.slice(0, newTargets.length);
  
  // Fill with empty values if needed
  while (convertedAmounts.value.length < newTargets.length) {
    convertedAmounts.value.push('');
    exchangeRates.value.push(null);
  }
  
  emit('update:targetCurrencies', newTargets);
  // Trigger conversion for the new currency
  handleFromAmountChange();
}

// Watch for changes in currencies or amount
watch([() => props.fromCurrency, () => props.targetCurrencies], async () => {
  await handleFromAmountChange()
}, { deep: true, immediate: true })

// Add onMounted to trigger initial conversion
onMounted(() => {
  handleFromAmountChange()
})
</script>
