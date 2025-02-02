<template>
  <div class="space-y-6">
    <!-- Source Currency -->
    <div class="card bg-white shadow-md hover:shadow-lg transition-all source-currency-container">
      <div class="card-body p-6">
        <h3 class="text-sm font-medium text-neutral/70 mb-4">Source Currency</h3>
        <CurrencyRow
          :currency-options="displayedCurrencyOptions"
          v-model:currency="modelFromCurrency"
          v-model:amount="modelAmount"
          placeholder="Enter amount"
          :index="0"
          @search="onSearch"
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
            @search="onSearch"
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
      <div v-for="(rate, index) in formattedExchangeRates" :key="index" class="stat">
        <div class="stat-title">{{ targetCurrencies[index]?.code || 'N/A' }}</div>
        <div class="stat-value text-2xl">{{ rate }}</div>
        <div class="stat-desc">per {{ modelFromCurrency?.code || 'N/A' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import 'vue-select/dist/vue-select.css'
import { formatNumber } from '../utils/formatters'

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
  set: (value) => {
    emit('update:fromCurrency', value);
    emit('fromAmountChange'); // Add this line to trigger conversion when source changes
  }
})

const modelAmount = computed({
  get: () => props.amount,
  set: (value) => emit('update:amount', value)
})

// Top 20 popular currencies
const popularCurrencyCodes = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 
  'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
  'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 
  'INR', 'RUB', 'ZAR', 'BRL', 'AED'
];

// Update displayedCurrencyOptions to include search functionality
const displayedCurrencyOptions = computed(() => {
  let filtered = props.currencyOptions;
  
  // If searching, filter by search text
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    return filtered.filter(currency => 
      currency.code.toLowerCase().includes(search) || 
      currency.name.toLowerCase().includes(search)
    );
  }
  
  // If not searching, return only popular currencies
  return filtered.filter(currency => 
    popularCurrencyCodes.includes(currency.code)
  ).sort((a, b) => 
    popularCurrencyCodes.indexOf(a.code) - popularCurrencyCodes.indexOf(b.code)
  );
});

// Modified availableCurrencies to use searchText for filtering
const availableCurrencies = computed(() => {
  // First filter out already selected currencies
  let filtered = props.currencyOptions.filter(currency => 
    currency?.code && 
    !props.targetCurrencies.some(target => target?.code === currency.code) &&
    currency.code !== props.fromCurrency?.code
  );
  
  // If searching, filter by search text
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    return filtered.filter(currency => 
      currency.code.toLowerCase().includes(search) || 
      currency.name.toLowerCase().includes(search)
    );
  }
  
  // If not searching, return only popular currencies
  return filtered.filter(currency => 
    popularCurrencyCodes.includes(currency.code)
  ).sort((a, b) => 
    popularCurrencyCodes.indexOf(a.code) - popularCurrencyCodes.indexOf(b.code)
  );
});

// Add search text ref to track the search query
const searchText = ref('');

const addCurrency = () => {
  if (availableCurrencies.value.length > 0) {
    const newTargets = [...props.targetCurrencies];
    const newAmounts = [...props.convertedAmounts];
    
    newTargets.push(availableCurrencies.value[0]);
    newAmounts.push('0');
    
    emit('update:targetCurrencies', newTargets);
    emit('update:convertedAmounts', newAmounts);
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

const filteredExchangeRates = computed(() => {
  return props.exchangeRates
    .slice(0, props.targetCurrencies.length) // Only take rates for existing currencies
    .filter((rate, index) => {
      // Only include rate if we have both rate and corresponding currency
      return rate !== null && props.targetCurrencies[index]?.code;
    }) as string[];
})

const formattedExchangeRates = computed(() => {
  return filteredExchangeRates.value.map(rate => formatNumber(rate));
})

// Update the onSearch handler to use the search text directly
const onSearch = (search: string) => {
  searchText.value = search;
};
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
