<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card w-full max-w-4xl bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-6">Currency Exchange</h2>
        
        <!-- Changed grid to flex column on mobile -->
        <div class="flex flex-col md:grid md:grid-cols-[1fr,auto,1fr] gap-6 md:gap-4 items-center">
          <!-- First Currency -->
          <div class="w-full space-y-4">
            <v-select
              v-model="fromCurrency"
              :options="currencyOptions"
              :searchable="true"
              :clearable="false"
              class="style-chooser"
              :get-option-label="(option) => `${getFlag(option.code)} ${option.code} - ${option.name}`"
            >
              <template #option="{ code, name }">
                <span>{{ getFlag(code) }} {{ code }} - {{ name }}</span>
              </template>
            </v-select>
            <input 
              type="number"
              v-model="amount"
              @input="handleFromAmountChange"
              class="input input-bordered w-full"
              placeholder="Enter amount"
            />
          </div>

          <!-- Swap Button - Hide on mobile, show different button -->
          <button @click="swapCurrencies" class="hidden md:flex btn btn-circle btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          
          <!-- Mobile Swap Button -->
          <button @click="swapCurrencies" class="md:hidden btn btn-wide btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <!-- Second Currency -->
          <div class="w-full space-y-4">
            <v-select
              v-model="toCurrency"
              :options="currencyOptions"
              :searchable="true"
              :clearable="false"
              class="style-chooser"
              :get-option-label="(option) => `${getFlag(option.code)} ${option.code} - ${option.name}`"
            >
              <template #option="{ code, name }">
                <span>{{ getFlag(code) }} {{ code }} - {{ name }}</span>
              </template>
            </v-select>
            <input 
              type="number" 
              v-model="convertedAmount"
              @input="handleToAmountChange"
              class="input input-bordered w-full" 
              placeholder="Converted amount"
            />
          </div>
        </div>

        <div class="mt-4 text-center text-sm opacity-70">
          <p v-if="exchangeRate">1 {{ fromCurrency.code }} = {{ exchangeRate }} {{ toCurrency.code }}</p>
        </div>

        <HistoricalRates
          :from-currency="fromCurrency"
          :to-currency="toCurrency"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import currencyList from '../static/currencies.json'
import { getCountryCode } from './utils/countryCode'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

// Transform currency list into array of objects with code and name
const currencyOptions = computed(() => 
  Object.entries(currencyList).map(([code, name]) => ({
    code: code.toUpperCase(),
    name
  }))
)

const amount = ref('')
const fromCurrency = ref(currencyOptions.value.find(c => c.code === 'USD'))
const toCurrency = ref(currencyOptions.value.find(c => c.code === 'EGP'))
const convertedAmount = ref('')
const exchangeRate = ref(null)

// Update convertCurrency to use the new object structure
const convertCurrency = async (value, from, to) => {
  try {
    const runtimeConfig = useRuntimeConfig()
    const response = await fetch(`${runtimeConfig.public.API_URL}/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: value,
        from: from.code,
        to: to.code,
      }),
    })
    const data = await response.json()
    exchangeRate.value = (data.result / value).toFixed(6)
    return data.result
  } catch (error) {
    console.error('Error converting currency:', error)
  }
}

// Update swap currencies function
const swapCurrencies = async () => {
  const originalFrom = fromCurrency.value
  const originalAmount = amount.value

  fromCurrency.value = toCurrency.value
  toCurrency.value = originalFrom

  if (originalAmount && originalAmount !== '') {
    amount.value = convertedAmount.value
    convertedAmount.value = await convertCurrency(
      amount.value,
      fromCurrency.value,
      toCurrency.value
    )
  }
}

const handleFromAmountChange = async () => {
  if (amount.value) {
    convertedAmount.value = await convertCurrency(amount.value, fromCurrency.value, toCurrency.value)
  } else {
    convertedAmount.value = ''
  }
}

const handleToAmountChange = async () => {
  if (convertedAmount.value) {
    amount.value = await convertCurrency(convertedAmount.value, toCurrency.value, fromCurrency.value)
  } else {
    amount.value = ''
  }
}

// Make sure watch triggers after both currencies are updated
watch([fromCurrency, toCurrency], async () => {
  if (amount.value && amount.value !== '') {
    await handleFromAmountChange()
  }
}, { flush: 'post' })

// Function to get flag emoji for currency
const getFlag = (currencyCode) => {
  const code = getCountryCode(currencyCode.toUpperCase())
  if (!code) return ''
  // Convert country code to flag emoji
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1A5 + c.charCodeAt()))
}
</script>

<style>
select option {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.v-select {
  min-width: 280px; /* Set minimum width for select boxes */
  --vs-controls-color: theme('colors.base-content');
  --vs-border-color: theme('colors.base-300');
  --vs-dropdown-bg: theme('colors.base-100');
  --vs-dropdown-color: theme('colors.base-content');
  --vs-dropdown-option-color: theme('colors.base-content');
  --vs-selected-bg: theme('colors.primary');
  --vs-selected-color: theme('colors.primary-content');
}

.v-select.style-chooser .vs__dropdown-toggle {
  @apply rounded-lg border-base-300 bg-base-100;
  padding: 8px 12px; /* Increased padding */
  height: 48px; /* Fixed height for better alignment */
}

.v-select.style-chooser .vs__selected-options {
  min-height: 32px; /* Ensure consistent height */
  align-items: center;
}

.v-select.style-chooser .vs__dropdown-menu {
  @apply border border-base-300 rounded-lg shadow-lg;
  padding: 8px;
  min-width: 100%; /* Ensure dropdown is at least as wide as the select */
  max-height: 300px; /* Limit maximum height with scroll */
}

.v-select.style-chooser .vs__dropdown-option {
  padding: 10px 14px; /* Increased padding for options */
  margin: 2px 0; /* Add some spacing between options */
  border-radius: 6px; /* Rounded corners for options */
}

.v-select.style-chooser .vs__selected {
  @apply text-base-content;
  margin: 0 4px; /* Add some spacing around selected item */
  font-size: 1rem; /* Consistent font size */
}

.v-select.style-chooser .vs__search {
  @apply text-base-content;
  font-size: 1rem;
  padding: 4px 8px;
}

/* Additional styles for better appearance */
.v-select.style-chooser .vs__clear {
  display: none; /* Hide clear button since clearable is false */
}

.v-select.style-chooser .vs__actions {
  padding-top: 0;
  padding-bottom: 0;
}

/* Ensure consistent spacing in the grid */
.grid-cols-\[1fr\,auto\,1fr\] {
  gap: 1.5rem; /* Increased gap between columns */
}

/* Make inputs match select height */
.input {
  height: 48px; /* Match the height of select boxes */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .v-select {
    width: 100%;
    min-width: 100%;
  }

  .card-body {
    padding: 1rem;
  }

  .btn-wide {
    width: 80%;
    margin: 0.5rem auto;
  }
}

/* Ensure inputs and selects are full width on mobile */
.w-full {
  width: 100% !important;
}
</style>