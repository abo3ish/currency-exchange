<template>
  <div class="min-h-screen bg-gradient flex items-center justify-center p-4 md:p-8">
    <div class="card w-full max-w-5xl bg-white shadow-lg">
      <div class="card-body p-6 md:p-8">
        <div class="flex flex-col items-center mb-8">
          <h2 class="text-2xl font-semibold text-neutral mb-2">Currency Exchange</h2>
          <p class="text-neutral/60 text-center text-sm">Real-time currency conversion and historical rates tracking</p>
        </div>
        
        <div class="divider my-2"></div>
        
        <CurrencyExchange
          v-model:fromCurrency="fromCurrency"
          v-model:targetCurrencies="targetCurrencies"
          class="mb-8"
        />

        <div class="divider my-2"></div>

        <HistoricalRates
          :from-currency="fromCurrency"
          :target-currencies="targetCurrencies"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Currency {
  code: string;
  name: string;
}

const fromCurrency = ref<Currency>({ code: 'USD', name: 'US Dollar' })
const targetCurrencies = ref<Currency[]>([
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  // { code: 'JPY', name: 'Japanese Yen' }
])
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
  position: relative;
  z-index: 30;
}

.v-select.vs--open {
  z-index: 50;
}

.v-select.style-chooser .vs__dropdown-toggle {
  @apply rounded-lg border-base-300 bg-base-100;
  position: relative; /* Add this line */
  z-index: 40; /* Add this line */
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
  z-index: 50; /* Add this line */
  position: absolute; /* Add this line */
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

/* Additional styles for enhanced aesthetics */
.card {
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  isolation: isolate;
}

.card:hover {
  transform: translateY(-2px);
}

.divider {
  opacity: 0.1;
}

@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }
}
</style>