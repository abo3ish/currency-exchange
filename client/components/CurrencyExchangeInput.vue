<template>
  <div class="space-y-6">
    <!-- Source Currency -->
    <div class="card bg-white shadow-md hover:shadow-lg transition-all source-currency-container">
      <div class="card-body p-6">
        <h3 class="text-sm font-medium text-neutral/70 mb-4">Source Currency</h3>
        <CurrencyRow
          :currency-options="currencyOptions"
          v-model:currency="modelFromCurrency"
          v-model:amount="modelAmount"
          placeholder="Enter amount"
          :index="0"
          @amount-change="$emit('fromAmountChange')"
        />
      </div>
    </div>

    <!-- Target Currencies -->
    <div class="space-y-4 target-currencies-container">
      <h3 class="text-sm font-medium text-neutral/70 ml-2">Target Currencies</h3>
      <div v-for="(currency, index) in targetCurrencies" :key="index" 
           class="group card bg-white shadow-md hover:shadow-lg transition-all"
           :style="{ zIndex: 30 - index }">
        <div class="card-body p-4">
          <CurrencyRow
            :currency-options="availableCurrencies"
            v-model:currency="targetCurrencies[index]"
            v-model:amount="convertedAmounts[index]"
            placeholder="Converted amount"
            :readonly="true"
            :show-remove="index > 0"
            :index="index + 1"
            @remove="removeCurrency(index)"
          />
        </div>
      </div>
    </div>

    <!-- Add Currency Button -->
    <div class="flex justify-center">
      <button 
        @click="addCurrency"
        class="btn btn-outline gap-2 hover:scale-102 transition-transform"
        :disabled="targetCurrencies.length >= availableCurrencies.length">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Currency
      </button>
    </div>

    <!-- Exchange Rates -->
    <div class="stats shadow-md w-full bg-white">
      <div v-for="(rate, index) in exchangeRates" :key="index" v-if="rate" class="stat">
        <div class="stat-title">{{ targetCurrencies[index].code }}</div>
        <div class="stat-value text-2xl">{{ rate }}</div>
        <div class="stat-desc">per {{ modelFromCurrency.code }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'vue-select/dist/vue-select.css'
import { getCountryCode } from '../utils/countryCodes'

interface Currency {
  code: string;
  name: string;
}

const props = defineProps<{
  currencyOptions: Currency[];
  fromCurrency: Currency;
  targetCurrencies: Currency[];
  amount: string;
  convertedAmounts: string[];
  exchangeRates: (string | null)[];
}>()

const emit = defineEmits<{
  'update:fromCurrency': [value: Currency];
  'update:targetCurrencies': [value: Currency[]];
  'update:amount': [value: string];
  'update:convertedAmounts': [value: string[]];
  'fromAmountChange': [];
}>()

const modelFromCurrency = computed({
  get: () => props.fromCurrency,
  set: (value) => emit('update:fromCurrency', value)
})

const modelAmount = computed({
  get: () => props.amount,
  set: (value) => emit('update:amount', value)
})

// Computed property to filter out already selected currencies
const availableCurrencies = computed(() => {
  return props.currencyOptions.filter(currency => 
    !props.targetCurrencies.some(target => target.code === currency.code) &&
    currency.code !== props.fromCurrency.code
  )
})

const addCurrency = () => {
  const newCurrency = availableCurrencies.value[0];
  if (newCurrency) {
    emit('update:targetCurrencies', [...props.targetCurrencies, newCurrency]);
    emit('update:convertedAmounts', [...props.convertedAmounts, '']);
  }
}

const removeCurrency = (index: number) => {
  const newTargets = [...props.targetCurrencies];
  const newAmounts = [...props.convertedAmounts];
  newTargets.splice(index, 1);
  newAmounts.splice(index, 1);
  emit('update:targetCurrencies', newTargets);
  emit('update:convertedAmounts', newAmounts);
}

const getFlag = (currencyCode: string) => {
  const code = getCountryCode(currencyCode.toUpperCase())
  if (!code) return ''
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1A5 + c.charCodeAt()))
}
</script>

<style scoped>
.card {
  border-radius: 12px;
}

.stats {
  border-radius: 12px;
}

.btn-outline {
  @apply border-neutral/20 text-neutral hover:bg-neutral hover:text-white;
}

:deep(.vs__dropdown-toggle) {
  border-color: hsl(210 20% 90%);
  border-radius: 8px;
  min-height: 42px;
  position: relative;
  z-index: 1;
}

:deep(.vs__dropdown-menu) {
  border-radius: 8px;
  border-color: hsl(210 20% 90%);
  box-shadow: var(--shadow-lg);
}

.source-currency-container {
  position: relative;
  z-index: 30;
}

.target-currencies-container {
  position: relative;
  z-index: 20;
}
</style>
